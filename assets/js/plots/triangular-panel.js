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
        if (defs.select('#panelArrowEnd').empty()) {
            defs.append('marker')
                .attr('id', 'panelArrowEnd')
                .attr('viewBox', '0 0 10 10')
                .attr('refX', 8)
                .attr('refY', 5)
                .attr('markerWidth', 7)
                .attr('markerHeight', 7)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                .attr('fill', '#0f766e');
        }
    }

    /**
     * 1. Render Normal View Schematic of the Triangular Panel
     */
    function renderTriangularPanel(ctx) {
        const { svg, g, state, iw, ih, plot_x_offset, plot_y_offset, clipId, d3 } = ctx;
        const calc = calcGeomAndCP(state);

        const containerG = g || svg.append('g').attr('clip-path', `url(#${clipId})`);
        containerG.selectAll('*').remove();

        ensureArrowMarker(svg);

        // Calculate dynamic bounds to fit the panel cleanly
        const maxDim = Math.max(13, calc.a + 2, calc.b + 2, calc.d + 2);
        const margin = { left: 65, right: 35, top: 35, bottom: 45 };

        const xScale = d3.scaleLinear()
            .domain([-1.5, maxDim])
            .range([plot_x_offset + margin.left, plot_x_offset + iw - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([-1.5, maxDim])
            .range([plot_y_offset + ih - margin.bottom, plot_y_offset + margin.top]);

        // Background card rectangle
        containerG.append('rect')
            .attr('x', plot_x_offset)
            .attr('y', plot_y_offset)
            .attr('width', iw)
            .attr('height', ih)
            .attr('fill', '#fdfdfe')
            .attr('rx', 8);

        // Coordinate Axes
        containerG.append('line')
            .attr('x1', xScale(0)).attr('y1', yScale(0))
            .attr('x2', xScale(maxDim)).attr('y2', yScale(0))
            .attr('stroke', '#334155').attr('stroke-width', 2);

        containerG.append('line')
            .attr('x1', xScale(0)).attr('y1', yScale(0))
            .attr('x2', xScale(0)).attr('y2', yScale(maxDim))
            .attr('stroke', '#334155').attr('stroke-width', 2);

        containerG.append('text')
            .attr('x', xScale(maxDim) + 8).attr('y', yScale(0) + 4)
            .attr('fill', '#0f172a').attr('font-size', '14px').attr('font-weight', 'bold').text('x');

        containerG.append('text')
            .attr('x', xScale(0) - 4).attr('y', yScale(maxDim) - 10)
            .attr('fill', '#0f172a').attr('font-size', '14px').attr('font-weight', 'bold').attr('text-anchor', 'end').text('y');

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
            .attr('stroke-width', 2.5);

        // Dimension lines and callouts
        const drawDimArrow = (x1, y1, x2, y2) => {
            containerG.append('line')
                .attr('x1', xScale(x1)).attr('y1', yScale(y1))
                .attr('x2', xScale(x2)).attr('y2', yScale(y2))
                .attr('stroke', '#0f766e').attr('stroke-width', 1.8)
                .attr('marker-end', 'url(#panelArrowEnd)');
        };

        // Dimension 'a' & 'a/3'
        drawDimArrow(-0.5, 0, -0.5, calc.a);
        containerG.append('text')
            .attr('x', xScale(-0.5) - 6).attr('y', yScale(calc.a / 2))
            .attr('fill', '#0f766e').attr('font-size', '12px').attr('text-anchor', 'end').text(`a = ${calc.a.toFixed(1)}m`);

        drawDimArrow(-1.0, 0, -1.0, calc.a / 3);
        containerG.append('text')
            .attr('x', xScale(-1.0) - 6).attr('y', yScale(calc.a / 6))
            .attr('fill', '#0f766e').attr('font-size', '11px').attr('text-anchor', 'end').text('a/3');

        // Dimension 'b'
        drawDimArrow(0, -0.6, calc.b, -0.6);
        containerG.append('text')
            .attr('x', xScale(calc.b / 2)).attr('y', yScale(-0.6) + 14)
            .attr('fill', '#0f766e').attr('font-size', '12px').attr('text-anchor', 'middle').text(`b = ${calc.b.toFixed(1)}m`);

        // Dimension 'd'
        drawDimArrow(0, calc.a + 0.4, calc.d, calc.a + 0.4);
        containerG.append('text')
            .attr('x', xScale(calc.d / 2)).attr('y', yScale(calc.a + 0.4) - 6)
            .attr('fill', '#0f766e').attr('font-size', '12px').attr('text-anchor', 'middle').text(`d = ${calc.d.toFixed(1)}m`);

        // Projection dashed lines to Centroid
        containerG.append('line')
            .attr('x1', xScale(calc.xc)).attr('y1', yScale(calc.a))
            .attr('x2', xScale(calc.xc)).attr('y2', yScale(calc.yc_base))
            .attr('stroke', '#64748b').attr('stroke-dasharray', '4 4');

        containerG.append('line')
            .attr('x1', xScale(0)).attr('y1', yScale(calc.yc_base))
            .attr('x2', xScale(calc.xc)).attr('y2', yScale(calc.yc_base))
            .attr('stroke', '#64748b').attr('stroke-dasharray', '4 4');

        // Centroid Point (c)
        const cxPx = xScale(calc.xc);
        const cyPx = yScale(calc.yc_base);

        containerG.append('circle')
            .attr('cx', cxPx).attr('cy', cyPx).attr('r', 5.5)
            .attr('fill', '#10b981').attr('stroke', '#064e3b').attr('stroke-width', 1.5);

        containerG.append('text')
            .attr('x', cxPx + 8).attr('y', cyPx - 4)
            .attr('fill', '#047857').attr('font-size', '13px').attr('font-weight', 'bold').text('c (Centroid)');

        // Center of Pressure Point (CP)
        const cpX = calc.xR;
        const cpY = calc.yR_panel;
        const cpxPx = xScale(cpX);
        const cpyPx = yScale(cpY);

        containerG.append('circle')
            .attr('cx', cpxPx).attr('cy', cpyPx).attr('r', 6)
            .attr('fill', '#ef4444').attr('stroke', '#7f1d1d').attr('stroke-width', 1.5);

        containerG.append('text')
            .attr('x', cpxPx + 8).attr('y', cpyPx + 12)
            .attr('fill', '#b91c1c').attr('font-size', '13px').attr('font-weight', 'bold').text('CP');

        // Schematic Title Overlay
        containerG.append('text')
            .attr('x', plot_x_offset + 12)
            .attr('y', plot_y_offset + 22)
            .attr('fill', '#1e293b').attr('font-size', '13px').attr('font-weight', 'bold')
            .text('Panel Normal View (Front View)');
    }

    /**
     * Dual Curve Plot Helper: Renders Δx (blue) and Δy (red) vs independent variable
     */
    function renderDualOffsetPlot(ctx, paramKey, paramName, paramDomain) {
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

        containerG.append('g')
            .attr('transform', `translate(0, ${plot_y_offset + ih - margin.bottom})`)
            .call(xAxis)
            .selectAll('text').attr('font-size', '11px');

        containerG.append('g')
            .attr('transform', `translate(${plot_x_offset + margin.left}, 0)`)
            .call(yAxis)
            .selectAll('text').attr('font-size', '11px');

        // Labels
        containerG.append('text')
            .attr('x', plot_x_offset + margin.left + (iw - margin.left - margin.right) / 2)
            .attr('y', plot_y_offset + ih - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1e293b').attr('font-size', '12px').attr('font-weight', 'bold')
            .text(paramName);

        containerG.append('text')
            .attr('transform', `rotate(-90)`)
            .attr('x', -(plot_y_offset + (ih / 2)))
            .attr('y', plot_x_offset + 16)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1e293b').attr('font-size', '12px').attr('font-weight', 'bold')
            .text('Offset (m)');

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
            .attr('cx', xScale(nowVal)).attr('cy', yScale(currentCalc.dx)).attr('r', 5.5)
            .attr('fill', '#2563eb').attr('stroke', '#ffffff').attr('stroke-width', 1.5);

        containerG.append('circle')
            .attr('cx', xScale(nowVal)).attr('cy', yScale(currentCalc.dy)).attr('r', 5.5)
            .attr('fill', '#ef4444').attr('stroke', '#ffffff').attr('stroke-width', 1.5);

        // Legend box
        const legG = containerG.append('g')
            .attr('transform', `translate(${plot_x_offset + iw - margin.right - 130}, ${plot_y_offset + margin.top + 5})`);

        legG.append('rect')
            .attr('width', 125).attr('height', 42)
            .attr('fill', 'rgba(255, 255, 255, 0.9)').attr('stroke', '#e2e8f0').attr('rx', 6);

        legG.append('circle').attr('cx', 12).attr('cy', 14).attr('r', 4.5).attr('fill', '#2563eb');
        legG.append('text').attr('x', 24).attr('y', 18).attr('fill', '#1e293b').attr('font-size', '11px').text('x_R - x_c');

        legG.append('circle').attr('cx', 12).attr('cy', 30).attr('r', 4.5).attr('fill', '#ef4444');
        legG.append('text').attr('x', 24).attr('y', 34).attr('fill', '#1e293b').attr('font-size', '11px').text('y_R - y_c');
    }

    function renderCPVsDepth(ctx) {
        renderDualOffsetPlot(ctx, 'D', 'Depth, D (m)', [10.5, 20.0]);
    }

    function renderCPVsTheta(ctx) {
        renderDualOffsetPlot(ctx, 'theta', 'Angle, θ (deg)', [30, 60]);
    }

    function renderCPVsDoverB(ctx) {
        renderDualOffsetPlot(ctx, 'd_over_b', 'Apex Ratio, d/b (-)', [0, 1.5]);
    }

    // Register renderers
    if (typeof window.registerPlotRenderer === 'function') {
        window.registerPlotRenderer('triangularPanel', renderTriangularPanel);
        window.registerPlotRenderer('cpVsDepth', renderCPVsDepth);
        window.registerPlotRenderer('cpVsTheta', renderCPVsTheta);
        window.registerPlotRenderer('cpVsDoverB', renderCPVsDoverB);
    } else {
        window.triangularPanel = renderTriangularPanel;
        window.cpVsDepth = renderCPVsDepth;
        window.cpVsTheta = renderCPVsTheta;
        window.cpVsDoverB = renderCPVsDoverB;
    }
})();
