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
    const T_evap = Number(inputs.T_evap ?? 10);
    const T_cond = Number(inputs.T_cond ?? 45);
    const SH = Number(inputs.SH ?? 7);
    const SC = Number(inputs.SC ?? 5);
    const eta_cp = Number(inputs.eta_cp ?? 0.7);

    const P_1 = window.PropsSI('P', 'T', T_evap + 273.15, 'Q', 1, fluid) / 1000;
    const T_1 = SH > 0 ? T_evap + SH : T_evap;
    const h_1 = SH > 0
        ? window.PropsSI('H', 'T', T_1 + 273.15, 'P', P_1 * 1000, fluid) / 1000
        : window.PropsSI('H', 'T', T_1 + 273.15, 'Q', 1, fluid) / 1000;
    const s_1 = SH > 0
        ? window.PropsSI('S', 'T', T_1 + 273.15, 'P', P_1 * 1000, fluid) / 1000
        : window.PropsSI('S', 'T', T_1 + 273.15, 'Q', 1, fluid) / 1000;

    const P_3 = window.PropsSI('P', 'T', T_cond + 273.15, 'Q', 0, fluid) / 1000;
    const T_3 = SC > 0 ? T_cond - SC : T_cond;
    const h_3 = SC > 0
        ? window.PropsSI('H', 'T', T_3 + 273.15, 'P', P_3 * 1000, fluid) / 1000
        : window.PropsSI('H', 'T', T_3 + 273.15, 'Q', 0, fluid) / 1000;
    const s_3 = SC > 0
        ? window.PropsSI('S', 'T', T_3 + 273.15, 'P', P_3 * 1000, fluid) / 1000
        : window.PropsSI('S', 'T', T_3 + 273.15, 'Q', 0, fluid) / 1000;

    const P_2 = P_3;
    const h_2s = window.PropsSI('H', 'P', P_2 * 1000, 'S', s_1 * 1000, fluid) / 1000;
    const h_2 = h_1 + (h_2s - h_1) / eta_cp;
    const T_2 = window.PropsSI('T', 'P', P_2 * 1000, 'H', h_2 * 1000, fluid) - 273.15;
    const s_2 = window.PropsSI('S', 'P', P_2 * 1000, 'H', h_2 * 1000, fluid) / 1000;

    const P_4 = P_1;
    const h_4 = h_3;
    const T_4 = window.PropsSI('T', 'P', P_4 * 1000, 'H', h_4 * 1000, fluid) - 273.15;
    const s_4 = window.PropsSI('S', 'P', P_4 * 1000, 'H', h_4 * 1000, fluid) / 1000;

    const T_a = T_cond;
    const P_a = P_3;
    const h_a = window.PropsSI('H', 'T', T_a + 273.15, 'Q', 1, fluid) / 1000;
    const s_a = window.PropsSI('S', 'T', T_a + 273.15, 'Q', 1, fluid) / 1000;
    const T_b = T_cond;
    const P_b = P_3;
    const h_b = window.PropsSI('H', 'T', T_b + 273.15, 'Q', 0, fluid) / 1000;
    const s_b = window.PropsSI('S', 'T', T_b + 273.15, 'Q', 0, fluid) / 1000;
    const T_c = T_evap;
    const P_c = P_1;
    const h_c = window.PropsSI('H', 'T', T_c + 273.15, 'Q', 1, fluid) / 1000;
    const s_c = window.PropsSI('S', 'T', T_c + 273.15, 'Q', 1, fluid) / 1000;

    const temperatures = [T_1, T_2, T_a, T_b, T_3, T_4, T_c, T_1];
    const pressures = [P_1, P_2, P_a, P_b, P_3, P_4, P_c, P_1];
    const entropies = [s_1, s_2, s_a, s_b, s_3, s_4, s_c, s_1];
    const enthalpies = [h_1, h_2, h_a, h_b, h_3, h_4, h_c, h_1];
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
        th_vapor: saturation.vaporEnthalpy.map((enthalpy, index) => [enthalpy, saturation.temperatures[index]])
    };

    const stateNames = ['1', '2', 'a', 'b', '3', '4', 'c'];
    stateNames.forEach((state, index) => {
        const temperature = temperatures[index];
        const pressure = pressures[index];
        result[`T${state}`] = temperature;
        result[`P${state}_kPa`] = pressure;
        result[`P${state}_bar`] = pressure / 100;
        result[`s${state}`] = entropies[index];
        result[`h${state}`] = enthalpies[index];
    });

    const w_in = h_2 - h_1;
    const q_in = h_1 - h_4;
    Object.assign(result, {
        w_in,
        q_in,
        q_out: h_2 - h_3,
        cop: q_in / w_in,
        cop_carnot: (T_evap + 273.15) / (T_cond - T_evap),
        p_ratio: P_2 / P_1,
        eta_cp,
        x4: window.PropsSI('Q', 'P', P_4 * 1000, 'H', h_4 * 1000, fluid)
    });

    return result;
}
