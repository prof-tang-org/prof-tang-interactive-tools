const saturationCurveCache = new Map();

function saturationCurves(fluid) {
    if (saturationCurveCache.has(fluid)) {
        return saturationCurveCache.get(fluid);
    }

    const temperatures = [];
    const liquidPressure = [];
    const vaporPressure = [];
    const liquidEntropy = [];
    const vaporEntropy = [];
    const liquidEnthalpy = [];
    const vaporEnthalpy = [];

    for (let temperature = -30; temperature <= 90; temperature += 2) {
        const temperatureK = temperature + 273.15;
        temperatures.push(temperature);
        liquidPressure.push(window.PropsSI('P', 'T', temperatureK, 'Q', 0, fluid) / 1000);
        vaporPressure.push(window.PropsSI('P', 'T', temperatureK, 'Q', 1, fluid) / 1000);
        liquidEntropy.push(window.PropsSI('S', 'T', temperatureK, 'Q', 0, fluid) / 1000);
        vaporEntropy.push(window.PropsSI('S', 'T', temperatureK, 'Q', 1, fluid) / 1000);
        liquidEnthalpy.push(window.PropsSI('H', 'T', temperatureK, 'Q', 0, fluid) / 1000);
        vaporEnthalpy.push(window.PropsSI('H', 'T', temperatureK, 'Q', 1, fluid) / 1000);
    }

    const curves = {
        temperatures,
        liquidPressure,
        vaporPressure,
        liquidEntropy,
        vaporEntropy,
        liquidEnthalpy,
        vaporEnthalpy
    };
    saturationCurveCache.set(fluid, curves);
    return curves;
}

export function calculate_cycle(inputs) {
    const fluid = String(inputs.fluid ?? 'R134a');
    const T1 = Number(inputs.T_evap ?? 10);
    const T3 = Number(inputs.T_cond ?? 40);
    const x1 = 1;
    const x3 = 0;

    const P1 = window.PropsSI('P', 'T', T1 + 273.15, 'Q', x1, fluid) / 1000;
    const h1 = window.PropsSI('H', 'T', T1 + 273.15, 'Q', x1, fluid) / 1000;
    const s1 = window.PropsSI('S', 'T', T1 + 273.15, 'Q', x1, fluid) / 1000;

    const P3 = window.PropsSI('P', 'T', T3 + 273.15, 'Q', x3, fluid) / 1000;
    const h3 = window.PropsSI('H', 'T', T3 + 273.15, 'Q', x3, fluid) / 1000;
    const s3 = window.PropsSI('S', 'T', T3 + 273.15, 'Q', x3, fluid) / 1000;

    const P2 = P3;
    const s2 = s1;
    const T2 = window.PropsSI('T', 'P', P2 * 1000, 'S', s2 * 1000, fluid) - 273.15;
    const h2 = window.PropsSI('H', 'P', P2 * 1000, 'S', s2 * 1000, fluid) / 1000;

    const P4 = P1;
    const h4 = h3;
    const T4 = window.PropsSI('T', 'P', P4 * 1000, 'H', h4 * 1000, fluid) - 273.15;
    const s4 = window.PropsSI('S', 'P', P4 * 1000, 'H', h4 * 1000, fluid) / 1000;

    const Ta = T3;
    const Pa = P3;
    const ha = window.PropsSI('H', 'T', Ta + 273.15, 'Q', 1, fluid) / 1000;
    const sa = window.PropsSI('S', 'T', Ta + 273.15, 'Q', 1, fluid) / 1000;

    const temperatures = [T1, T2, Ta, T3, T4, T1];
    const pressures = [P1, P2, Pa, P3, P4, P1];
    const entropies = [s1, s2, sa, s3, s4, s1];
    const enthalpies = [h1, h2, ha, h3, h4, h1];
    const saturation = saturationCurves(fluid);

    const result = {
        ts_cycle: entropies.map((entropy, index) => [entropy, temperatures[index]]),
        ph_cycle: enthalpies.map((enthalpy, index) => [enthalpy, pressures[index]]),
        th_cycle: enthalpies.map((enthalpy, index) => [enthalpy, temperatures[index]]),
        ts_liquid: saturation.liquidEntropy.map((entropy, index) => [entropy, saturation.temperatures[index]]),
        ts_vapor: saturation.vaporEntropy.map((entropy, index) => [entropy, saturation.temperatures[index]]),
        ph_liquid: saturation.liquidEnthalpy.map((enthalpy, index) => [enthalpy, saturation.liquidPressure[index]]),
        ph_vapor: saturation.vaporEnthalpy.map((enthalpy, index) => [enthalpy, saturation.vaporPressure[index]]),
        th_liquid: saturation.liquidEnthalpy.map((enthalpy, index) => [enthalpy, saturation.temperatures[index]]),
        th_vapor: saturation.vaporEnthalpy.map((enthalpy, index) => [enthalpy, saturation.temperatures[index]]),
        T1,
        P1_kPa: P1,
        P1_bar: P1 / 100,
        s1,
        h1,
        T2,
        P2_kPa: P2,
        P2_bar: P2 / 100,
        s2,
        h2,
        Ta,
        Pa_kPa: Pa,
        Pa_bar: Pa / 100,
        sa,
        ha,
        T3,
        P3_kPa: P3,
        P3_bar: P3 / 100,
        s3,
        h3,
        T4,
        P4_kPa: P4,
        P4_bar: P4 / 100,
        s4,
        h4
    };

    const w_in = h2 - h1;
    const q_in = h1 - h4;
    Object.assign(result, {
        w_in,
        q_in,
        q_out: h2 - h3,
        cop: q_in / w_in,
        cop_carnot: (T1 + 273.15) / (T3 - T1),
        p_ratio: P2 / P1,
        x4: window.PropsSI('Q', 'P', P4 * 1000, 'H', h4 * 1000, fluid)
    });

    return result;
}
