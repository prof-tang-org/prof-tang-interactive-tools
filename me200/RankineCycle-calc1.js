const WATER = 'Water';
const KELVIN_OFFSET = 273.15;
const PA_PER_KPA = 1000;
const J_PER_KJ = 1000;
const CRITICAL_TEMPERATURE_C = 373.946;

let cachedSaturationCurves = null;

function saturationCurves() {
    if (cachedSaturationCurves) {
        return cachedSaturationCurves;
    }

    const lowerTemperature = 10;
    const upperTemperature = CRITICAL_TEMPERATURE_C - 3;
    const temperatureStep = 2;
    const liquid_ts = [];
    const vapor_ts = [];
    const liquid_ph = [];
    const vapor_ph = [];
    const liquid_th = [];
    const vapor_th = [];

    for (let temperature = lowerTemperature;
        temperature <= upperTemperature;
        temperature += temperatureStep) {
        const temperatureK = temperature + KELVIN_OFFSET;
        const pressure = window.PropsSI('P', 'T', temperatureK, 'Q', 0, WATER) / PA_PER_KPA;
        const h_liquid = window.PropsSI('H', 'T', temperatureK, 'Q', 0, WATER) / J_PER_KJ;
        const h_vapor = window.PropsSI('H', 'T', temperatureK, 'Q', 1, WATER) / J_PER_KJ;
        const s_liquid = window.PropsSI('S', 'T', temperatureK, 'Q', 0, WATER) / J_PER_KJ;
        const s_vapor = window.PropsSI('S', 'T', temperatureK, 'Q', 1, WATER) / J_PER_KJ;

        liquid_ts.push([s_liquid, temperature]);
        vapor_ts.push([s_vapor, temperature]);
        liquid_ph.push([h_liquid, pressure]);
        vapor_ph.push([h_vapor, pressure]);
        liquid_th.push([h_liquid, temperature]);
        vapor_th.push([h_vapor, temperature]);
    }

    cachedSaturationCurves = {
        liquid_ts,
        vapor_ts,
        liquid_ph,
        vapor_ph,
        liquid_th,
        vapor_th
    };
    return cachedSaturationCurves;
}

function cycleAtTemperatures(boilerTemperature, condenserTemperature) {
    if (!Number.isFinite(boilerTemperature) || boilerTemperature < 200 || boilerTemperature > 350) {
        throw new RangeError('T_boil must be between 200 and 350 °C.');
    }
    if (!Number.isFinite(condenserTemperature) || condenserTemperature < 40 || condenserTemperature > 100) {
        throw new RangeError('T_cond must be between 40 and 100 °C.');
    }
    if (condenserTemperature >= boilerTemperature) {
        throw new RangeError('T_cond must be lower than T_boil.');
    }

    const boilerTemperatureK = boilerTemperature + KELVIN_OFFSET;
    const condenserTemperatureK = condenserTemperature + KELVIN_OFFSET;

    const p_1 = window.PropsSI('P', 'T', boilerTemperatureK, 'Q', 1, WATER);
    const h_1 = window.PropsSI('H', 'T', boilerTemperatureK, 'Q', 1, WATER) / J_PER_KJ;
    const s_1 = window.PropsSI('S', 'T', boilerTemperatureK, 'Q', 1, WATER) / J_PER_KJ;

    const h_a = window.PropsSI('H', 'T', boilerTemperatureK, 'Q', 0, WATER) / J_PER_KJ;
    const s_a = window.PropsSI('S', 'T', boilerTemperatureK, 'Q', 0, WATER) / J_PER_KJ;

    const p_2 = window.PropsSI('P', 'T', condenserTemperatureK, 'Q', 0, WATER);
    const h_3 = window.PropsSI('H', 'T', condenserTemperatureK, 'Q', 0, WATER) / J_PER_KJ;
    const s_3 = window.PropsSI('S', 'T', condenserTemperatureK, 'Q', 0, WATER) / J_PER_KJ;

    const h_2 = window.PropsSI('H', 'P', p_2, 'S', s_1 * J_PER_KJ, WATER) / J_PER_KJ;
    const t_2 = window.PropsSI('T', 'P', p_2, 'S', s_1 * J_PER_KJ, WATER) - KELVIN_OFFSET;
    const x_2 = window.PropsSI('Q', 'P', p_2, 'S', s_1 * J_PER_KJ, WATER);

    const h_4 = window.PropsSI('H', 'P', p_1, 'S', s_3 * J_PER_KJ, WATER) / J_PER_KJ;
    const t_4 = window.PropsSI('T', 'P', p_1, 'S', s_3 * J_PER_KJ, WATER) - KELVIN_OFFSET;

    const w_t = h_1 - h_2;
    const w_p = h_4 - h_3;
    const q_in = h_1 - h_4;
    const q_out = h_2 - h_3;
    const w_net = w_t - w_p;

    return {
        p_1: p_1 / PA_PER_KPA,
        p_2: p_2 / PA_PER_KPA,
        h_1,
        h_2,
        h_3,
        h_4,
        h_a,
        s_1,
        s_2: s_1,
        s_3,
        s_4: s_3,
        s_a,
        T_1: boilerTemperature,
        T_2: t_2,
        T_3: condenserTemperature,
        T_4: t_4,
        T_a: boilerTemperature,
        p_a: p_1 / PA_PER_KPA,
        x_2,
        q_in,
        q_out,
        w_t,
        w_p,
        w_net,
        eta: w_net / q_in
    };
}

export function calculate_cycle(inputs) {
    const boilerTemperature = Number(inputs.T_boil ?? 300);
    const condenserTemperature = Number(inputs.T_cond ?? 50);
    const cycle = cycleAtTemperatures(boilerTemperature, condenserTemperature);
    const saturation = saturationCurves();

    const cyclePoints = [
        [cycle.s_1, cycle.T_1],
        [cycle.s_2, cycle.T_2],
        [cycle.s_3, cycle.T_3],
        [cycle.s_4, cycle.T_4],
        [cycle.s_a, cycle.T_a],
        [cycle.s_1, cycle.T_1]
    ];
    const pressurePoints = [
        [cycle.h_1, cycle.p_1],
        [cycle.h_2, cycle.p_2],
        [cycle.h_3, cycle.p_2],
        [cycle.h_4, cycle.p_1],
        [cycle.h_a, cycle.p_a],
        [cycle.h_1, cycle.p_1]
    ];
    const temperaturePoints = [
        [cycle.h_1, cycle.T_1],
        [cycle.h_2, cycle.T_2],
        [cycle.h_3, cycle.T_3],
        [cycle.h_4, cycle.T_4],
        [cycle.h_a, cycle.T_a],
        [cycle.h_1, cycle.T_1]
    ];

    return {
        p_ratio: cycle.p_1 / cycle.p_2,
        ts_liquid: saturation.liquid_ts,
        ts_vapor: saturation.vapor_ts,
        ts_cycle: cyclePoints,
        ph_liquid: saturation.liquid_ph,
        ph_vapor: saturation.vapor_ph,
        ph_cycle: pressurePoints,
        th_liquid: saturation.liquid_th,
        th_vapor: saturation.vapor_th,
        th_cycle: temperaturePoints,
        ...cycle
    };
}
