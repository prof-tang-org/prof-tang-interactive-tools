/**
 * triangular-panel.js
 * Custom plot renderer module for Hydrostatic Force on a Plane Triangular Surface.
 * Renders:
 * 1. Interactive Front/Normal View schematic of the triangular panel with centroid (c) and center of pressure (CP).
 * 2. Dual-line plot for offset (x_R - x_c) and (y_R - y_c) vs Depth D.
 * 3. Dual-line plot for offset (x_R - x_c) and (y_R - y_c) vs Angle θ.
 * 4. Dual-line plot for offset (x_R - x_c) and (y_R - y_c) vs Apex Ratio d/b.
 */

(function () {
    const g_acc = 9.81;
    const LATEX_FONT = 'MathJax_Main, "Latin Modern Math", "Computer Modern", "Times New Roman", serif';

    function rad(deg) {
        return (deg * Math.PI) / 180;
    }

    function calcGeomAndCP(state) {
        const rho = state.rho !== undefined ? state.rho : 900.0;
        const D = state.D !== undefined ? state.D : 15.0;
        const theta = state.theta !== undefined ? state.theta : 60.0;
        const a = state.a !== undefined ? state.a : 10.0;
        const b = state.b !== undefined ? state.b : 12.0;
        const d = state.d !== undefined ? state.d : 8.0;

        const A = 0.5 * a * b;
        const xc = (b + d) / 3;
        const yc_base = a / 3;
        const yc = D / Math.sin(rad(theta)) - a / 3;
        const hc = yc * Math.sin(rad(theta));

        const Ixc = (b * Math.pow(a, 3)) / 36;
        const Ixyc = (b * Math.pow(a, 2) * (b - 2 * d)) / 72;

        const FR = rho * g_acc * hc * A;
        const xR = xc + Ixyc / (yc * A);
        const yR_free = yc + Ixc / (yc * A);
        const yR_panel = D / Math.sin(rad(theta)) - yR_free;

        const dx = xR - xc;
        const dy = yR_free - yc;

        return {
            rho, D, theta, a, b, d,
            A, xc, yc_base, yc, hc,
            Ixc, Ixyc, FR, FR_kN: FR / 1000,
            xR, yR_free, yR_panel, dx, dy
        };
    }

    function ensureArrowMarker(svg) {
        let defs = svg.select('defs');
        if (defs.empty()) {
            defs = svg.append('defs');
        }
        // Remove old markers if present to ensure updated proportions
        defs.select('#panelArrowEnd').remove();
        defs.select('#panelArrowStart').remove();

        defs.append('marker')
            .attr('id', 'panelArrowEnd')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 7)
            .attr('refY', 5)
            .attr('markerWidth', 4.5)
            .attr('markerHeight', 4.5)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 1.5 L 8 5 L 0 8.5 z')
            .attr('fill', '#0f766e');

        defs.append('marker')
            .attr('id', 'panelArrowStart')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 3)
            .attr('refY', 5)
            .attr('markerWidth', 4.5)
            .attr('markerHeight', 4.5)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 8 1.5 L 0 5 L 8 8.5 z')
            .attr('fill', '#0f766e');
    }

    /**
     * 1. Render Normal View Schematic of the Triangular Panel
     * Fills existing plot axes and uses LaTeX-styled labels with smaller dimension arrows.
     */
    function renderTriangularPanel(ctx) {
        const { svg, g, state, iw, ih, plot_x_offset, plot_y_offset, clipId, d3, x, y } = ctx;
        const calc = calcGeomAndCP(state);

        const containerG = g || svg.append('g').attr('clip-path', `url(#${clipId})`);
        containerG.selectAll('*').remove();

        ensureArrowMarker(svg);

        // Use scales from existing plot axes in ctx, fallback if not defined
        const xScale = x || d3.scaleLinear().domain([0, 14]).range([plot_x_offset, plot_x_offset + iw]);
        const yScale = y || d3.scaleLinear().domain([0, 14]).range([plot_y_offset + ih, plot_y_offset]);

        // Helper to draw dimension arrow with smaller markers
        const drawDimArrow = (x1, y1, x2, y2, doubleEnded = true) => {
            const px1 = xScale(x1);
            const py1 = yScale(y1);
            const px2 = xScale(x2);
            const py2 = yScale(y2);
            const dist = Math.hypot(px2 - px1, py2 - py1);

            const line = containerG.append('line')
                .attr('x1', px1).attr('y1', py1)
                .attr('x2', px2).attr('y2', py2)
                .attr('stroke', '#0f766e')
                .attr('stroke-width', 1.2);

            if (dist > 8) {
                line.attr('marker-end', 'url(#panelArrowEnd)');
                if (doubleEnded && dist > 18) {
                    line.attr('marker-start', 'url(#panelArrowStart)');
                }
            }
            return line;
        };

        // Triangular Panel Polygon
        const baseL = { x: 0, y: 0 };
        const baseR = { x: calc.b, y: 0 };
        const apex = { x: calc.d, y: calc.a };

        const pointsString = [baseL, apex, baseR]
            .map(p => `${xScale(p.x)},${yScale(p.y)}`)
            .join(' ');

        containerG.append('polygon')
            .attr('points', pointsString)
            .attr('fill', 'rgba(96, 165, 250, 0.25)')
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 2);

        // Projection dashed lines to Centroid
        containerG.append('line')
            .attr('x1', xScale(0)).attr('y1', yScale(calc.yc_base))
            .attr('x2', xScale(calc.xc)).attr('y2', yScale(calc.yc_base))
            .attr('stroke', '#94a3b8').attr('stroke-dasharray', '3 3').attr('stroke-width', 1.2);

        containerG.append('line')
            .attr('x1', xScale(calc.xc)).attr('y1', yScale(0))
            .attr('x2', xScale(calc.xc)).attr('y2', yScale(calc.yc_base))
            .attr('stroke', '#94a3b8').attr('stroke-dasharray', '3 3').attr('stroke-width', 1.2);

        // Apex projection dashed lines
        containerG.append('line')
            .attr('x1', xScale(0)).attr('y1', yScale(calc.a))
            .attr('x2', xScale(calc.d)).attr('y2', yScale(calc.a))
            .attr('stroke', '#94a3b8').attr('stroke-dasharray', '3 3').attr('stroke-width', 1.2);

        containerG.append('line')
            .attr('x1', xScale(calc.d)).attr('y1', yScale(0))
            .attr('x2', xScale(calc.d)).attr('y2', yScale(calc.a))
            .attr('stroke', '#94a3b8').attr('stroke-dasharray', '3 3').attr('stroke-width', 1.2);

        // Dimension 'd' (offset of apex from x = 0)
        const dOffset = Math.min(calc.a + 0.45, 13.5);
        if (calc.d > 0.05) {
            containerG.append('line')
                .attr('x1', xScale(0)).attr('y1', yScale(calc.a))
                .attr('x2', xScale(0)).attr('y2', yScale(dOffset + 0.15))
                .attr('stroke', '#0f766e').attr('stroke-width', 0.8).attr('opacity', 0.7);

            containerG.append('line')
                .attr('x1', xScale(calc.d)).attr('y1', yScale(calc.a))
                .attr('x2', xScale(calc.d)).attr('y2', yScale(dOffset + 0.15))
                .attr('stroke', '#0f766e').attr('stroke-width', 0.8).attr('opacity', 0.7);

            drawDimArrow(0, dOffset, calc.d, dOffset, true);
        }
        const dText = containerG.append('text')
            .attr('x', xScale(Math.max(calc.d / 2, 0.4)))
            .attr('y', yScale(dOffset) - 4)
            .attr('fill', '#0f766e')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('font-family', LATEX_FONT);
        dText.append('tspan').style('font-style', 'italic').text('d');
        dText.append('tspan').style('font-style', 'normal').text(` = ${calc.d.toFixed(1)} m`);

        // Dimension 'a' (height of apex)
        const dimAX = (calc.d <= 11) ? (calc.d + 0.6) : (calc.d - 0.6);
        containerG.append('line')
            .attr('x1', xScale(calc.d)).attr('y1', yScale(calc.a))
            .attr('x2', xScale(dimAX + (calc.d <= 11 ? 0.2 : -0.2))).attr('y2', yScale(calc.a))
            .attr('stroke', '#0f766e').attr('stroke-width', 0.8).attr('opacity', 0.7);

        containerG.append('line')
            .attr('x1', xScale(calc.d)).attr('y1', yScale(0))
            .attr('x2', xScale(dimAX + (calc.d <= 11 ? 0.2 : -0.2))).attr('y2', yScale(0))
            .attr('stroke', '#0f766e').attr('stroke-width', 0.8).attr('opacity', 0.7);

        drawDimArrow(dimAX, 0, dimAX, calc.a, true);

        const aText = containerG.append('text')
            .attr('x', xScale(dimAX) + (calc.d <= 11 ? 6 : -6))
            .attr('y', yScale(calc.a / 2) + 4)
            .attr('fill', '#0f766e')
            .attr('font-size', '12px')
            .attr('text-anchor', calc.d <= 11 ? 'start' : 'end')
            .style('font-family', LATEX_FONT);
        aText.append('tspan').style('font-style', 'italic').text('a');
        aText.append('tspan').style('font-style', 'normal').text(` = ${calc.a.toFixed(1)} m`);

        // Dimension 'a/3' (centroid height from base)
        const dimA3X = Math.max(0.4, calc.xc - 0.4);
        drawDimArrow(dimA3X, 0, dimA3X, calc.yc_base, true);

        const a3Text = containerG.append('text')
            .attr('x', xScale(dimA3X) - 5)
            .attr('y', yScale(calc.yc_base / 2) + 4)
            .attr('fill', '#0f766e')
            .attr('font-size', '11px')
            .attr('text-anchor', 'end')
            .style('font-family', LATEX_FONT);
        a3Text.append('tspan').style('font-style', 'italic').text('a');
        a3Text.append('tspan').style('font-style', 'normal').text('/3');

        // Dimension 'b' (base width along x-axis)
        if (calc.b > 0.4) {
            drawDimArrow(0, 0.45, calc.b, 0.45, true);
        }
        const bText = containerG.append('text')
            .attr('x', xScale(calc.b / 2))
            .attr('y', yScale(0.45) - 4)
            .attr('fill', '#0f766e')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .style('font-family', LATEX_FONT);
        bText.append('tspan').style('font-style', 'italic').text('b');
        bText.append('tspan').style('font-style', 'normal').text(` = ${calc.b.toFixed(1)} m`);

        // Centroid Point (c)
        const cxPx = xScale(calc.xc);
        const cyPx = yScale(calc.yc_base);

        containerG.append('circle')
            .attr('cx', cxPx).attr('cy', cyPx).attr('r', 4.5)
            .attr('fill', '#10b981').attr('stroke', '#064e3b').attr('stroke-width', 1.5);

        const cText = containerG.append('text')
            .attr('x', cxPx + 7).attr('y', cyPx - 4)
            .attr('fill', '#047857')
            .attr('font-size', '12px')
            .style('font-family', LATEX_FONT);
        cText.append('tspan').style('font-style', 'italic').style('font-weight', 'bold').text('c');
        cText.append('tspan').style('font-style', 'normal').text(' (Centroid)');

        // Center of Pressure Point (CP)
        const cpxPx = xScale(calc.xR);
        const cpyPx = yScale(calc.yR_panel);

        containerG.append('circle')
            .attr('cx', cpxPx).attr('cy', cpyPx).attr('r', 5)
            .attr('fill', '#ef4444').attr('stroke', '#7f1d1d').attr('stroke-width', 1.5);

        const cpText = containerG.append('text')
            .attr('x', cpxPx + 7).attr('y', cpyPx + 11)
            .attr('fill', '#b91c1c')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .style('font-family', LATEX_FONT);
        cpText.append('tspan').style('font-style', 'normal').text('CP');
    }

    /**
     * Dual Curve Plot Helper: Renders Δx (blue) and Δy (red) vs independent variable
     */
    function renderDualOffsetPlot(ctx, paramKey, paramLabelBuilder, paramDomain) {
        const { svg, g, state, iw, ih, plot_x_offset, plot_y_offset, clipId, d3 } = ctx;
        const containerG = g || svg.append('g').attr('clip-path', `url(#${clipId})`);
        containerG.selectAll('*').remove();

        const currentVal = state[paramKey] !== undefined ? state[paramKey] : (paramKey === 'd_over_b' ? (state.d / state.b) : paramDomain[0]);
        const currentCalc = calcGeomAndCP(state);

        // Generate data points
        const steps = 60;
        const minVal = paramDomain[0];
        const maxVal = paramDomain[1];
        const stepSize = (maxVal - minVal) / steps;

        const dataX = [];
        const dataY = [];

        for (let i = 0; i <= steps; i++) {
            const val = minVal + i * stepSize;
            const tempState = { ...state };
            if (paramKey === 'd_over_b') {
                tempState.d = val * tempState.b;
            } else {
                tempState[paramKey] = val;
            }
            const res = calcGeomAndCP(tempState);
            dataX.push({ x: val, y: res.dx });
            dataY.push({ x: val, y: res.dy });
        }

        const margin = { left: 55, right: 25, top: 30, bottom: 45 };

        const xScale = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([plot_x_offset + margin.left, plot_x_offset + iw - margin.right]);

        const yDomain = [-1.2, 1.2];
        const yScale = d3.scaleLinear()
            .domain(yDomain)
            .range([plot_y_offset + ih - margin.bottom, plot_y_offset + margin.top]);

        // Background
        containerG.append('rect')
            .attr('x', plot_x_offset).attr('y', plot_y_offset)
            .attr('width', iw).attr('height', ih)
            .attr('fill', '#ffffff').attr('rx', 8);

        // Zero line
        containerG.append('line')
            .attr('x1', xScale(minVal)).attr('y1', yScale(0))
            .attr('x2', xScale(maxVal)).attr('y2', yScale(0))
            .attr('stroke', '#cbd5e1').attr('stroke-dasharray', '4 4');

        // Axes
        const xAxis = d3.axisBottom(xScale).ticks(6);
        const yAxis = d3.axisLeft(yScale).ticks(5);

        const xG = containerG.append('g')
            .attr('transform', `translate(0, ${plot_y_offset + ih - margin.bottom})`)
            .call(xAxis);
        xG.selectAll('text').style('font-family', LATEX_FONT).attr('font-size', '11px');

        const yG = containerG.append('g')
            .attr('transform', `translate(${plot_x_offset + margin.left}, 0)`)
            .call(yAxis);
        yG.selectAll('text').style('font-family', LATEX_FONT).attr('font-size', '11px');

        // X Axis Label
        const xLbl = containerG.append('text')
            .attr('x', plot_x_offset + margin.left + (iw - margin.left - margin.right) / 2)
            .attr('y', plot_y_offset + ih - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1e293b').attr('font-size', '12px')
            .style('font-family', LATEX_FONT);
        paramLabelBuilder(xLbl);

        // Y Axis Label
        containerG.append('text')
            .attr('transform', `rotate(-90)`)
            .attr('x', -(plot_y_offset + (ih / 2)))
            .attr('y', plot_x_offset + 16)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1e293b').attr('font-size', '12px')
            .style('font-family', LATEX_FONT)
            .text('Offset [m]');

        // Lines
        const lineGen = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y));

        containerG.append('path')
            .datum(dataX)
            .attr('fill', 'none')
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 2)
            .attr('d', lineGen);

        containerG.append('path')
            .datum(dataY)
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 2)
            .attr('d', lineGen);

        // Active State Dots
        const nowVal = paramKey === 'd_over_b' ? (state.d / state.b) : currentVal;
        containerG.append('circle')
            .attr('cx', xScale(nowVal)).attr('cy', yScale(currentCalc.dx)).attr('r', 4.5)
            .attr('fill', '#2563eb').attr('stroke', '#ffffff').attr('stroke-width', 1.5);

        containerG.append('circle')
            .attr('cx', xScale(nowVal)).attr('cy', yScale(currentCalc.dy)).attr('r', 4.5)
            .attr('fill', '#ef4444').attr('stroke', '#ffffff').attr('stroke-width', 1.5);

        // Legend box
        const legG = containerG.append('g')
            .attr('transform', `translate(${plot_x_offset + iw - margin.right - 130}, ${plot_y_offset + margin.top + 5})`);

        legG.append('rect')
            .attr('width', 125).attr('height', 42)
            .attr('fill', 'rgba(255, 255, 255, 0.9)').attr('stroke', '#e2e8f0').attr('rx', 6);

        legG.append('circle').attr('cx', 12).attr('cy', 14).attr('r', 4).attr('fill', '#2563eb');
        const legText1 = legG.append('text')
            .attr('x', 24).attr('y', 18)
            .attr('fill', '#1e293b').attr('font-size', '12px')
            .style('font-family', LATEX_FONT);
        legText1.append('tspan').style('font-style', 'italic').text('x');
        legText1.append('tspan').style('font-size', '75%').attr('baseline-shift', 'sub').text('R');
        legText1.append('tspan').style('font-style', 'normal').text(' − ');
        legText1.append('tspan').style('font-style', 'italic').text('x');
        legText1.append('tspan').style('font-size', '75%').attr('baseline-shift', 'sub').text('c');

        legG.append('circle').attr('cx', 12).attr('cy', 30).attr('r', 4).attr('fill', '#ef4444');
        const legText2 = legG.append('text')
            .attr('x', 24).attr('y', 34)
            .attr('fill', '#1e293b').attr('font-size', '12px')
            .style('font-family', LATEX_FONT);
        legText2.append('tspan').style('font-style', 'italic').text('y');
        legText2.append('tspan').style('font-size', '75%').attr('baseline-shift', 'sub').text('R');
        legText2.append('tspan').style('font-style', 'normal').text(' − ');
        legText2.append('tspan').style('font-style', 'italic').text('y');
        legText2.append('tspan').style('font-size', '75%').attr('baseline-shift', 'sub').text('c');
    }

    function renderCPVsDepth(ctx) {
        renderDualOffsetPlot(ctx, 'D', function (el) {
            el.append('tspan').text('Depth, ');
            el.append('tspan').style('font-style', 'italic').text('D');
            el.append('tspan').text(' [m]');
        }, [10.5, 20.0]);
    }

    function renderCPVsTheta(ctx) {
        renderDualOffsetPlot(ctx, 'theta', function (el) {
            el.append('tspan').text('Angle, ');
            el.append('tspan').style('font-style', 'italic').text('θ');
            el.append('tspan').text(' [deg]');
        }, [30, 60]);
    }

    function renderCPVsDoverB(ctx) {
        renderDualOffsetPlot(ctx, 'd_over_b', function (el) {
            el.append('tspan').text('Apex Ratio, ');
            el.append('tspan').style('font-style', 'italic').text('d/b');
            el.append('tspan').text(' [-]');
        }, [0, 1.5]);
    }

    // Export & register functions
    const exportsObj = {
        triangularPanel: renderTriangularPanel,
        cpVsDepth: renderCPVsDepth,
        cpVsTheta: renderCPVsTheta,
        cpVsDoverB: renderCPVsDoverB
    };

    if (typeof window !== 'undefined') {
        if (typeof window.registerPlotRenderer === 'function') {
            window.registerPlotRenderer('triangularPanel', renderTriangularPanel);
            window.registerPlotRenderer('cpVsDepth', renderCPVsDepth);
            window.registerPlotRenderer('cpVsTheta', renderCPVsTheta);
            window.registerPlotRenderer('cpVsDoverB', renderCPVsDoverB);
        }
        window.triangularPanel = renderTriangularPanel;
        window.cpVsDepth = renderCPVsDepth;
        window.cpVsTheta = renderCPVsTheta;
        window.cpVsDoverB = renderCPVsDoverB;
        window._lastCustomModuleExports = { exports: exportsObj };
    }
})();
