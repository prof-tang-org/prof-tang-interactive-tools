/**
 * ts-diagram.js
 * Extensible custom plot module for rendering interactive T-s (Temperature-Entropy) thermodynamic diagrams.
 * Uses CoolProp / PropsSI for thermophysical saturation dome, quality lines, and isobar calculations.
 */

(function () {
    // Cache saturation dome points per fluid to prevent expensive CoolProp recalculations
    const domeCache = new Map();

    function getSaturationDome(fluid, PropsSI) {
        if (!PropsSI || typeof PropsSI !== 'function') return null;
        if (domeCache.has(fluid)) return domeCache.get(fluid);

        try {
            // Get critical properties
            const Tcrit_K = PropsSI('TCRIT', '', 0, '', 0, fluid);
            const Tmin_K = PropsSI('TMIN', '', 0, '', 0, fluid);

            if (isNaN(Tcrit_K) || isNaN(Tmin_K)) return null;

            // Start slightly above Tmin and end just below Tcrit to avoid singularity
            const Tmin = Math.max(Tmin_K, 173.15); // Allow sub-zero temperatures in Kelvin (down to -100°C)
            const Tcrit = Tcrit_K - 0.2;
            const steps = 60;

            const liquidCurve = [];
            const vaporCurve = [];
            const qualityCurves = { 0.2: [], 0.4: [], 0.6: [], 0.8: [] };

            for (let i = 0; i <= steps; i++) {
                // Non-linear spacing to get higher density near critical point
                const frac = i / steps;
                const T_K = Tmin + (Tcrit - Tmin) * Math.pow(frac, 1.2);
                const T_C = T_K - 273.15;

                const sf = PropsSI('S', 'T', T_K, 'Q', 0, fluid); // J/kg·K
                const sg = PropsSI('S', 'T', T_K, 'Q', 1, fluid); // J/kg·K

                if (!isNaN(sf) && !isNaN(sg)) {
                    const sf_kJ = sf / 1000;
                    const sg_kJ = sg / 1000;

                    liquidCurve.push({ s: sf_kJ, T: T_C });
                    vaporCurve.push({ s: sg_kJ, T: T_C });

                    // Constant quality lines
                    [0.2, 0.4, 0.6, 0.8].forEach(q => {
                        const sq_kJ = sf_kJ + q * (sg_kJ - sf_kJ);
                        qualityCurves[q].push({ s: sq_kJ, T: T_C });
                    });
                }
            }

            const scrit_kJ = PropsSI('S', 'T', Tcrit_K, 'Q', 0, fluid) / 1000;
            const Tcrit_C = Tcrit_K - 273.15;

            const domeData = {
                fluid,
                liquidCurve,
                vaporCurve,
                qualityCurves,
                criticalPoint: { s: scrit_kJ, T: Tcrit_C }
            };

            domeCache.set(fluid, domeData);
            return domeData;
        } catch (e) {
            console.warn(`[ts-diagram.js] Could not calculate saturation dome for ${fluid}:`, e);
            return null;
        }
    }

    function renderTSDiagram(ctx) {
        const { svg, g, plotConfig, state, x, y, iw, ih, scale, PropsSI, plot_x_offset, plot_y_offset, clipId, d3 } = ctx;

        const fluid = state.fluid || (plotConfig.customData && plotConfig.customData.fluid) || 'Water';
        const currentTemp_C = state.temp !== undefined ? state.temp : (state.T !== undefined ? state.T : 100);
        const currentPressure_bar = state.pressure !== undefined ? state.pressure : (state.P !== undefined ? state.P : 2.0);
        const currentPressure_Pa = currentPressure_bar * 1e5;

        // Container group inside plot clipping area
        const containerG = g || svg.append('g').attr('clip-path', `url(#${clipId})`);

        // Check if CoolProp is ready
        if (!PropsSI) {
            containerG.append('text')
                .attr('x', plot_x_offset + iw / 2)
                .attr('y', plot_y_offset + ih / 2)
                .attr('text-anchor', 'middle')
                .style('fill', '#94a3b8')
                .style('font-size', `${0.9 * scale}rem`)
                .text('Loading CoolProp thermodynamic property engine...');
            return;
        }

        const dome = getSaturationDome(fluid, PropsSI);
        if (!dome) return;

        // 1. Draw Saturation Dome Shading & Boundary Curves
        const lineGen = d3.line()
            .x(d => x(d.s))
            .y(d => y(d.T))
            .defined(d => d && !isNaN(d.s) && !isNaN(d.T));

        // Area under dome (two-phase mixture region)
        const areaPathData = [];
        dome.liquidCurve.forEach(pt => areaPathData.push(pt));
        for (let i = dome.vaporCurve.length - 1; i >= 0; i--) {
            areaPathData.push(dome.vaporCurve[i]);
        }

        if (areaPathData.length > 0) {
            containerG.append('path')
                .datum(areaPathData)
                .attr('class', 'ts-saturation-dome-fill')
                .attr('d', lineGen)
                .style('fill', '#e0f2fe')
                .style('fill-opacity', '0.45')
                .style('stroke', 'none');
        }

        // Draw Liquid Saturation Curve (sf)
        containerG.append('path')
            .datum(dome.liquidCurve)
            .attr('class', 'ts-liquid-sat-line')
            .attr('d', lineGen)
            .style('fill', 'none')
            .style('stroke', '#0284c7')
            .style('stroke-width', `${2 * scale}px`);

        // Draw Vapor Saturation Curve (sg)
        containerG.append('path')
            .datum(dome.vaporCurve)
            .attr('class', 'ts-vapor-sat-line')
            .attr('d', lineGen)
            .style('fill', 'none')
            .style('stroke', '#0d9488')
            .style('stroke-width', `${2 * scale}px`);

        // 2. Draw Constant Quality Lines (x = 0.2, 0.4, 0.6, 0.8)
        Object.entries(dome.qualityCurves).forEach(([q, curve]) => {
            containerG.append('path')
                .datum(curve)
                .attr('class', `ts-quality-line-${q}`)
                .attr('d', lineGen)
                .style('fill', 'none')
                .style('stroke', '#94a3b8')
                .style('stroke-dasharray', '3 3')
                .style('stroke-width', `${1 * scale}px`)
                .style('opacity', '0.6');
        });

        // 3. Draw Isobar (Constant Pressure Curve)
        try {
            const isobarPoints = [];
            const Tmin_C = Math.max(-20, x ? ctx.yMinVal : 0);
            const Tmax_C = ctx.yMax ? ctx.yMax : 350;

            const Tsat_K = PropsSI('T', 'P', currentPressure_Pa, 'Q', 0, fluid);
            const Tsat_C = !isNaN(Tsat_K) ? Tsat_K - 273.15 : null;

            const isoSteps = 40;
            for (let i = 0; i <= isoSteps; i++) {
                const T_C = Tmin_C + (Tmax_C - Tmin_C) * (i / isoSteps);
                const T_K = T_C + 273.15;
                try {
                    const s_J = PropsSI('S', 'T', T_K, 'P', currentPressure_Pa, fluid);
                    if (!isNaN(s_J)) {
                        isobarPoints.push({ s: s_J / 1000, T: T_C });
                    }
                } catch (e) {
                    // Ignore single out-of-range state errors
                }
            }

            if (isobarPoints.length > 0) {
                containerG.append('path')
                    .datum(isobarPoints)
                    .attr('class', 'ts-isobar-line')
                    .attr('d', lineGen)
                    .style('fill', 'none')
                    .style('stroke', '#ea580c')
                    .style('stroke-width', `${2 * scale}px`)
                    .style('stroke-dasharray', '5 3');
            }
        } catch (e) {
            // Isobar calculation fallback
        }

        // 4. Critical Point Marker
        if (dome.criticalPoint && !isNaN(dome.criticalPoint.s)) {
            const cx = x(dome.criticalPoint.s);
            const cy = y(dome.criticalPoint.T);
            if (!isNaN(cx) && !isNaN(cy)) {
                containerG.append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', 4 * scale)
                    .style('fill', '#ef4444')
                    .style('stroke', '#ffffff')
                    .style('stroke-width', '1.5px');
            }
        }

        // 5. Evaluate and Draw Current State Point
        try {
            const T_K = currentTemp_C + 273.15;
            const currentState_s = PropsSI('S', 'T', T_K, 'P', currentPressure_Pa, fluid) / 1000;

            if (!isNaN(currentState_s)) {
                const ptX = x(currentState_s);
                const ptY = y(currentTemp_C);

                if (!isNaN(ptX) && !isNaN(ptY)) {
                    // Pulsing highlight circle
                    containerG.append('circle')
                        .attr('cx', ptX)
                        .attr('cy', ptY)
                        .attr('r', 9 * scale)
                        .style('fill', 'none')
                        .style('stroke', '#0284c7')
                        .style('stroke-width', '2px')
                        .style('opacity', '0.6');

                    // Core state circle
                    containerG.append('circle')
                        .attr('cx', ptX)
                        .attr('cy', ptY)
                        .attr('r', 5 * scale)
                        .style('fill', '#0284c7')
                        .style('stroke', '#ffffff')
                        .style('stroke-width', '2px');

                    // Label offset
                    const phase = PropsSI('PHASE', 'T', T_K, 'P', currentPressure_Pa, fluid);
                    let phaseText = 'Single Phase';
                    if (typeof phase === 'string') {
                        if (phase.includes('liquid')) phaseText = 'Subcooled Liquid';
                        else if (phase.includes('gas') || phase.includes('vapor')) phaseText = 'Superheated Vapor';
                        else if (phase.includes('twophase')) phaseText = 'Two-Phase Mixture';
                    }

                    // Annotate phase region text near state point
                    containerG.append('text')
                        .attr('x', ptX + 10 * scale)
                        .attr('y', ptY - 8 * scale)
                        .style('font-size', `${0.8 * scale}rem`)
                        .style('font-weight', '600')
                        .style('fill', '#0369a1')
                        .text(`s = ${currentState_s.toFixed(3)} kJ/kg·K (${phaseText})`);
                }
            }
        } catch (e) {
            // State point out of range
        }
    }

    // Register plot renderer with global renderer system
    if (typeof window.registerPlotRenderer === 'function') {
        window.registerPlotRenderer('tsDiagram', renderTSDiagram);
    } else {
        window.tsDiagram = renderTSDiagram;
    }
})();
