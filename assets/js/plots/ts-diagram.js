/**
 * ts-diagram.js
 * Extensible custom plot module for rendering interactive T-s (Temperature-Entropy) thermodynamic diagrams.
 * Uses CoolProp / PropsSI for thermophysical saturation dome, quality lines, and isobar calculations.
 */

// Cache saturation dome points per fluid to prevent expensive CoolProp recalculations
const domeCache = new Map();

function getSaturationDome(fluid, PropsSI) {
    if (!PropsSI || typeof PropsSI !== 'function') return null;
    if (domeCache.has(fluid)) return domeCache.get(fluid);

    try {
        const Tcrit_K = PropsSI('TCRIT', '', 0, '', 0, fluid);
        const Tmin_K = PropsSI('TMIN', '', 0, '', 0, fluid);

        if (isNaN(Tcrit_K) || isNaN(Tmin_K)) return null;

        const Tmin = Math.max(Tmin_K, 173.15);
        const Tcrit = Tcrit_K - 0.2;
        const steps = 60;

        const liquidCurve = [];
        const vaporCurve = [];
        const qualityCurves = { 0.2: [], 0.4: [], 0.6: [], 0.8: [] };

        for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const T_K = Tmin + (Tcrit - Tmin) * Math.pow(frac, 1.2);
            const T_C = T_K - 273.15;

            const sfVal = PropsSI('S', 'T', T_K, 'Q', 0, fluid);
            const sgVal = PropsSI('S', 'T', T_K, 'Q', 1, fluid);

            if (!isNaN(sfVal) && !isNaN(sgVal)) {
                const sf_kJ = sfVal / 1000;
                const sg_kJ = sgVal / 1000;

                liquidCurve.push({ s: sf_kJ, T: T_C });
                vaporCurve.push({ s: sg_kJ, T: T_C });

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

export function tsDiagram(ctx) {
    const { svg, g, plotConfig, state, x, y, iw, ih, scale, PropsSI, plot_x_offset, plot_y_offset, clipId, d3 } = ctx;

    const fluid = state.fluid || (plotConfig.customData && plotConfig.customData.fluid) || 'Water';
    const containerG = g || svg.append('g').attr('clip-path', `url(#${clipId})`);

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

    // Critical Point Marker
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
}

// Export thermodynamic saturation property helper functions for plot evaluation
export function sf(T_C, fluid) {
    const f = fluid || (window.currentState && window.currentState.fluid) || 'Water';
    const PropsSI = window.PropsSI;
    if (!PropsSI) return NaN;
    const T_K = (typeof T_C === 'number' ? T_C : parseFloat(T_C)) + 273.15;
    return PropsSI('S', 'T', T_K, 'Q', 0, f) / 1000;
}

export function sg(T_C, fluid) {
    const f = fluid || (window.currentState && window.currentState.fluid) || 'Water';
    const PropsSI = window.PropsSI;
    if (!PropsSI) return NaN;
    const T_K = (typeof T_C === 'number' ? T_C : parseFloat(T_C)) + 273.15;
    return PropsSI('S', 'T', T_K, 'Q', 1, f) / 1000;
}

export function sf_P(P_bar, fluid) {
    const f = fluid || (window.currentState && window.currentState.fluid) || 'Water';
    const PropsSI = window.PropsSI;
    if (!PropsSI) return NaN;
    const P_Pa = (typeof P_bar === 'number' ? P_bar : parseFloat(P_bar)) * 1e5;
    return PropsSI('S', 'P', P_Pa, 'Q', 0, f) / 1000;
}

export function sg_P(P_bar, fluid) {
    const f = fluid || (window.currentState && window.currentState.fluid) || 'Water';
    const PropsSI = window.PropsSI;
    if (!PropsSI) return NaN;
    const P_Pa = (typeof P_bar === 'number' ? P_bar : parseFloat(P_bar)) * 1e5;
    return PropsSI('S', 'P', P_Pa, 'Q', 1, f) / 1000;
}

export function Tsat(P_bar, fluid) {
    const f = fluid || (window.currentState && window.currentState.fluid) || 'Water';
    const PropsSI = window.PropsSI;
    if (!PropsSI) return NaN;
    const P_Pa = (typeof P_bar === 'number' ? P_bar : parseFloat(P_bar)) * 1e5;
    return PropsSI('T', 'P', P_Pa, 'Q', 0, f) - 273.15;
}

export function Psat(T_C, fluid) {
    const f = fluid || (window.currentState && window.currentState.fluid) || 'Water';
    const PropsSI = window.PropsSI;
    if (!PropsSI) return NaN;
    const T_K = (typeof T_C === 'number' ? T_C : parseFloat(T_C)) + 273.15;
    return PropsSI('P', 'T', T_K, 'Q', 0, f) / 1e5;
}

export default {
    tsDiagram,
    sf,
    sg,
    sf_P,
    sg_P,
    Tsat,
    Psat
};
