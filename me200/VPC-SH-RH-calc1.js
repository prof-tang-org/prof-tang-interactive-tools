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

    const lowerTemperature = 0.01;
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

export function calculate_cycle(inputs) {
    const boilingTemperature = Number(inputs.T_boil ?? 300);
    const condensationTemperature = Number(inputs.T_cond ?? 50);
    const temperature1 = Number(inputs.T1 ?? 450);
    const temperature3 = Number(inputs.T3 ?? 450);
    const turbineEfficiency = Number(inputs.eta_t ?? 0.85);
    const pumpEfficiency = Number(inputs.eta_p ?? 0.8);
    const reheatPressure = Number(inputs.p_reheat ?? 800) * PA_PER_KPA;

    if (!Number.isFinite(boilingTemperature) || boilingTemperature < 200 || boilingTemperature > 350) {
        throw new RangeError('T_boil must be between 200 and 350 °C.');
    }
    if (!Number.isFinite(condensationTemperature) || condensationTemperature < 40 || condensationTemperature > 100) {
        throw new RangeError('T_cond must be between 40 and 100 °C.');
    }
    if (!Number.isFinite(temperature1) || temperature1 < 400 || temperature1 > 500) {
        throw new RangeError('T1 must be between 400 and 500 °C.');
    }
    if (!Number.isFinite(temperature3) || temperature3 < 400 || temperature3 > 500) {
        throw new RangeError('T3 must be between 400 and 500 °C.');
    }
    if (!Number.isFinite(turbineEfficiency) || turbineEfficiency < 0.6 || turbineEfficiency > 1) {
        throw new RangeError('eta_t must be between 0.6 and 1.');
    }
    if (!Number.isFinite(pumpEfficiency) || pumpEfficiency < 0.6 || pumpEfficiency > 1) {
        throw new RangeError('eta_p must be between 0.6 and 1.');
    }

    const temperature5K = condensationTemperature + KELVIN_OFFSET;
    const pressure1 = window.PropsSI(
        'P', 'T', boilingTemperature + KELVIN_OFFSET, 'Q', 0, WATER
    );
    const pressure5 = window.PropsSI('P', 'T', temperature5K, 'Q', 0, WATER);
    if (!(pressure5 < reheatPressure && reheatPressure < pressure1)) {
        throw new RangeError('Reheat pressure must be between condenser and boiler pressures.');
    }

    const h1 = window.PropsSI('H', 'T', temperature1 + KELVIN_OFFSET, 'P', pressure1, WATER);
    const s1 = window.PropsSI('S', 'T', temperature1 + KELVIN_OFFSET, 'P', pressure1, WATER);

    const h2s = window.PropsSI('H', 'P', reheatPressure, 'S', s1, WATER);
    const h2 = h1 - turbineEfficiency * (h1 - h2s);
    const temperature2K = window.PropsSI('T', 'P', reheatPressure, 'H', h2, WATER);
    const s2 = window.PropsSI('S', 'P', reheatPressure, 'H', h2, WATER);
    const quality2 = window.PropsSI('Q', 'P', reheatPressure, 'H', h2, WATER);
    const state2IsTwoPhase = 0 <= quality2 && quality2 <= 1;

    let temperatureCK;
    let hC;
    let sC;
    if (state2IsTwoPhase) {
        temperatureCK = window.PropsSI('T', 'P', reheatPressure, 'Q', 1, WATER);
        hC = window.PropsSI('H', 'P', reheatPressure, 'Q', 1, WATER);
        sC = window.PropsSI('S', 'P', reheatPressure, 'Q', 1, WATER);
    } else {
        temperatureCK = temperature2K;
        hC = h2;
        sC = s2;
    }

    const h3 = window.PropsSI('H', 'T', temperature3 + KELVIN_OFFSET, 'P', reheatPressure, WATER);
    const s3 = window.PropsSI('S', 'T', temperature3 + KELVIN_OFFSET, 'P', reheatPressure, WATER);

    const h4s = window.PropsSI('H', 'P', pressure5, 'S', s3, WATER);
    const h4 = h3 - turbineEfficiency * (h3 - h4s);
    const temperature4K = window.PropsSI('T', 'P', pressure5, 'H', h4, WATER);
    const s4 = window.PropsSI('S', 'P', pressure5, 'H', h4, WATER);

    let hD = window.PropsSI('H', 'P', pressure5, 'Q', 1, WATER);
    let sD = window.PropsSI('S', 'P', pressure5, 'Q', 1, WATER);
    if (h4 <= hD) {
        hD = h4;
        sD = s4;
    }

    const h5 = window.PropsSI('H', 'P', pressure5, 'Q', 0, WATER);
    const s5 = window.PropsSI('S', 'P', pressure5, 'Q', 0, WATER);

    const h6s = window.PropsSI('H', 'P', pressure1, 'S', s5, WATER);
    const h6 = h5 + (h6s - h5) / pumpEfficiency;
    const temperature6K = window.PropsSI('T', 'P', pressure1, 'H', h6, WATER);
    const s6 = window.PropsSI('S', 'P', pressure1, 'H', h6, WATER);

    const hA = window.PropsSI(
        'H', 'T', boilingTemperature + KELVIN_OFFSET, 'Q', 0, WATER
    );
    const sA = window.PropsSI(
        'S', 'T', boilingTemperature + KELVIN_OFFSET, 'Q', 0, WATER
    );
    const hB = window.PropsSI(
        'H', 'T', boilingTemperature + KELVIN_OFFSET, 'Q', 1, WATER
    );
    const sB = window.PropsSI(
        'S', 'T', boilingTemperature + KELVIN_OFFSET, 'Q', 1, WATER
    );

    const enthalpies = [h1, h2, hC, h3, h4, hD, h5, h6, hA, hB, h1];
    const entropies = [s1, s2, sC, s3, s4, sD, s5, s6, sA, sB, s1];
    const pressures = [
        pressure1, reheatPressure, reheatPressure, reheatPressure,
        pressure5, pressure5, pressure5, pressure1, pressure1, pressure1, pressure1
    ];
    const temperatures = [
        temperature1,
        temperature2K - KELVIN_OFFSET,
        temperatureCK - KELVIN_OFFSET,
        temperature3,
        temperature4K - KELVIN_OFFSET,
        condensationTemperature,
        condensationTemperature,
        temperature6K - KELVIN_OFFSET,
        boilingTemperature,
        boilingTemperature,
        temperature1
    ];

    const turbineWork = ((h1 - h2) + (h3 - h4)) / J_PER_KJ;
    const pumpWork = (h6 - h5) / J_PER_KJ;
    const heatAdded = ((h1 - h6) + (h3 - h2)) / J_PER_KJ;
    const heatRejected = (h4 - h5) / J_PER_KJ;
    const netWork = turbineWork - pumpWork;
    const saturation = saturationCurves();

    return {
        p_1: pressure1 / PA_PER_KPA,
        p_reheat: reheatPressure / PA_PER_KPA,
        p_5: pressure5 / PA_PER_KPA,
        p_ratio: pressure1 / pressure5,
        T_2: temperature2K - KELVIN_OFFSET,
        T_4: temperature4K - KELVIN_OFFSET,
        q_in: heatAdded,
        q_out: heatRejected,
        w_t: turbineWork,
        w_p: pumpWork,
        w_net: netWork,
        eta: netWork / heatAdded,
        ts_liquid: saturation.liquid_ts,
        ts_vapor: saturation.vapor_ts,
        ts_cycle: entropies.map((entropy, index) => [entropy / J_PER_KJ, temperatures[index]]),
        ph_liquid: saturation.liquid_ph,
        ph_vapor: saturation.vapor_ph,
        ph_cycle: enthalpies.map((enthalpy, index) => [
            enthalpy / J_PER_KJ,
            pressures[index] / PA_PER_KPA
        ]),
        th_liquid: saturation.liquid_th,
        th_vapor: saturation.vapor_th,
        th_cycle: enthalpies.map((enthalpy, index) => [
            enthalpy / J_PER_KJ,
            temperatures[index]
        ])
    };
}
