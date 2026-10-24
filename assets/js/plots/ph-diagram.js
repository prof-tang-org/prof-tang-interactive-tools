/**
 * ph-diagram.js
 * Custom plot module in JavaScript for generating thermodynamic P-h (Pressure-Enthalpy)
 * and T-h (Temperature-Enthalpy) diagrams.
 * Uses CoolProp / PropsSI to calculate saturation dome (saturated liquid and vapor curves) and quality lines.
 * Compatible with templates/renderer.js 'points' mode.
 */

const phCache = new Map();
const thCache = new Map();

export function phDiagram(ctx) {
    const PropsSI = window.PropsSI;
    if (!PropsSI || typeof PropsSI !== 'function') return [];

    let fluid = 'Water';
    if (ctx && ctx.state && ctx.state.fluid) {
        fluid = String(ctx.state.fluid);
    }

    const isKPa = !!(ctx && ctx.plotConfig && (ctx.plotConfig.pressureUnit === 'kPa' || ctx.plotConfig.yMax > 150 || (typeof ctx.plotConfig.yLabel === 'string' && ctx.plotConfig.yLabel.includes('kPa'))));
    const cacheKey = `${fluid}::${isKPa ? 'kPa' : 'bar'}`;

    if (phCache.has(cacheKey)) {
        return phCache.get(cacheKey);
    }

    if (fluid.toLowerCase() === 'air') {
        phCache.set(cacheKey, []);
        return [];
    }

    try {
        const T_crit = PropsSI('TCRIT', '', 0, '', 0, fluid);
        const T_min = PropsSI('TMIN', '', 0, '', 0, fluid);
        if (isNaN(T_crit) || isNaN(T_min)) return [];

        let T_start;
        if (fluid === 'Water') {
            T_start = 273.16 + 0.1;
        } else if (fluid === 'R134a') {
            T_start = Math.max(T_min, 190.0);
        } else if (fluid === 'CO2') {
            T_start = Math.max(T_min, 216.6);
        } else {
            T_start = Math.max(T_min, 180.0);
        }

        const T_end = T_crit - 0.15;
        const steps = 60;
        const pFactor = isKPa ? 1000.0 : 1e5;

        const liquidCurve = [];
        const vaporCurve = [];
        const qualityCurves = { 0.2: [], 0.4: [], 0.6: [], 0.8: [] };

        for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const T = T_start + (T_end - T_start) * Math.pow(frac, 1.35);

            const P = PropsSI('P', 'T', T, 'Q', 0, fluid);
            const hf = PropsSI('H', 'T', T, 'Q', 0, fluid);
            const hg = PropsSI('H', 'T', T, 'Q', 1, fluid);

            if (!isNaN(P) && !isNaN(hf) && !isNaN(hg)) {
                const P_val = P / pFactor;
                const hf_kJ = hf / 1000.0;
                const hg_kJ = hg / 1000.0;

                liquidCurve.push([parseFloat(hf_kJ.toFixed(2)), parseFloat(P_val.toFixed(3))]);
                vaporCurve.push([parseFloat(hg_kJ.toFixed(2)), parseFloat(P_val.toFixed(3))]);

                for (const q of [0.2, 0.4, 0.6, 0.8]) {
                    const hq_kJ = hf_kJ + q * (hg_kJ - hf_kJ);
                    qualityCurves[q].push([parseFloat(hq_kJ.toFixed(2)), parseFloat(P_val.toFixed(3))]);
                }
            }
        }

        const P_crit = PropsSI('PCRIT', '', 0, '', 0, fluid) / pFactor;
        const h_crit_kJ = PropsSI('H', 'T', T_crit, 'Q', 0, fluid) / 1000.0;
        const crit_pt = [parseFloat(h_crit_kJ.toFixed(2)), parseFloat(P_crit.toFixed(3))];

        const sat_liquid = [...liquidCurve, crit_pt];
        const sat_vapor = [crit_pt, ...vaporCurve.slice().reverse()];

        const seriesList = [
            { points: sat_liquid, color: "#0284c7", strokeWidth: 2.5, name: "sat_liquid" },
            { points: sat_vapor, color: "#ef4444", strokeWidth: 2.5, name: "sat_vapor" }
        ];

        for (const [qStr, pts] of Object.entries(qualityCurves)) {
            const ptsWithCrit = [...pts, crit_pt];
            seriesList.push({
                points: ptsWithCrit,
                color: "#94a3b8",
                dashed: true,
                strokeWidth: 1.2,
                opacity: 0.65,
                name: `quality_${Math.round(parseFloat(qStr) * 100)}`
            });
        }

        phCache.set(cacheKey, seriesList);
        return seriesList;
    } catch (err) {
        console.error(`[ph-diagram.js] Error generating P-h diagram for ${fluid}:`, err);
        return [];
    }
}

export function thDiagram(ctx) {
    const PropsSI = window.PropsSI;
    if (!PropsSI || typeof PropsSI !== 'function') return [];

    let fluid = 'Water';
    if (ctx && ctx.state && ctx.state.fluid) {
        fluid = String(ctx.state.fluid);
    }

    if (thCache.has(fluid)) {
        return thCache.get(fluid);
    }

    if (fluid.toLowerCase() === 'air') {
        thCache.set(fluid, []);
        return [];
    }

    try {
        const T_crit = PropsSI('TCRIT', '', 0, '', 0, fluid);
        const T_min = PropsSI('TMIN', '', 0, '', 0, fluid);
        if (isNaN(T_crit) || isNaN(T_min)) return [];

        let T_start;
        if (fluid === 'Water') {
            T_start = 273.16 + 0.1;
        } else if (fluid === 'R134a') {
            T_start = Math.max(T_min, 190.0);
        } else if (fluid === 'CO2') {
            T_start = Math.max(T_min, 216.6);
        } else {
            T_start = Math.max(T_min, 180.0);
        }

        const T_end = T_crit - 0.15;
        const steps = 60;

        const liquidCurve = [];
        const vaporCurve = [];
        const qualityCurves = { 0.2: [], 0.4: [], 0.6: [], 0.8: [] };

        for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const T_K = T_start + (T_end - T_start) * Math.pow(frac, 1.35);
            const T_C = T_K - 273.15;

            const hf = PropsSI('H', 'T', T_K, 'Q', 0, fluid);
            const hg = PropsSI('H', 'T', T_K, 'Q', 1, fluid);

            if (!isNaN(hf) && !isNaN(hg)) {
                const hf_kJ = hf / 1000.0;
                const hg_kJ = hg / 1000.0;

                liquidCurve.push([parseFloat(hf_kJ.toFixed(2)), parseFloat(T_C.toFixed(2))]);
                vaporCurve.push([parseFloat(hg_kJ.toFixed(2)), parseFloat(T_C.toFixed(2))]);

                for (const q of [0.2, 0.4, 0.6, 0.8]) {
                    const hq_kJ = hf_kJ + q * (hg_kJ - hf_kJ);
                    qualityCurves[q].push([parseFloat(hq_kJ.toFixed(2)), parseFloat(T_C.toFixed(2))]);
                }
            }
        }

        const T_crit_C = T_crit - 273.15;
        const h_crit_kJ = PropsSI('H', 'T', T_crit, 'Q', 0, fluid) / 1000.0;
        const crit_pt = [parseFloat(h_crit_kJ.toFixed(2)), parseFloat(T_crit_C.toFixed(2))];

        const sat_liquid = [...liquidCurve, crit_pt];
        const sat_vapor = [crit_pt, ...vaporCurve.slice().reverse()];

        const seriesList = [
            { points: sat_liquid, color: "#0284c7", strokeWidth: 2.5, name: "sat_liquid" },
            { points: sat_vapor, color: "#ef4444", strokeWidth: 2.5, name: "sat_vapor" }
        ];

        for (const [qStr, pts] of Object.entries(qualityCurves)) {
            const ptsWithCrit = [...pts, crit_pt];
            seriesList.push({
                points: ptsWithCrit,
                color: "#94a3b8",
                dashed: true,
                strokeWidth: 1.2,
                opacity: 0.65,
                name: `quality_${Math.round(parseFloat(qStr) * 100)}`
            });
        }

        thCache.set(fluid, seriesList);
        return seriesList;
    } catch (err) {
        console.error(`[ph-diagram.js] Error generating T-h diagram for ${fluid}:`, err);
        return [];
    }
}

if (typeof window !== 'undefined') {
    window.phDiagram = phDiagram;
    window.thDiagram = thDiagram;
    if (window.registerPlotRenderer) {
        window.registerPlotRenderer('phDiagram', phDiagram);
        window.registerPlotRenderer('thDiagram', thDiagram);
    }
}

export default {
    phDiagram,
    thDiagram
};
