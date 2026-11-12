const T1_FIXED = 300;
const P1_FIXED = 100;
const GAS_CONSTANT = 8.314 / 28.97;
const C_V = 0.718;
const K = 1.4;
const PATH_SEGMENT_COUNT = 20;

function cycleAtCompressionRatio(gama, T3) {
    const T2 = T1_FIXED * gama ** (K - 1);
    const T4 = T3 / gama ** (K - 1);

    const p2 = P1_FIXED * gama ** K;
    const p3 = p2 * T3 / T2;
    const p4 = p3 / gama ** K;

    const v1 = GAS_CONSTANT * T1_FIXED / P1_FIXED;
    const v2 = v1 / gama;
    const v3 = v2;
    const v4 = v1;

    const q_in = C_V * (T3 - T2);
    const q_out = C_V * (T4 - T1_FIXED);
    const w_net = q_in - q_out;
    const eta = w_net / q_in;
    const mep = w_net / (v1 - v2);

    const s1 = 0;
    const s2 = 0;
    const s3 = C_V * Math.log(T3 / T2);
    const s4 = s3;

    return {
        T_1: T1_FIXED,
        T_2: T2,
        T_3: T3,
        T_4: T4,
        p_1: P1_FIXED,
        p_2: p2,
        p_3: p3,
        p_4: p4,
        v_1: v1,
        v_2: v2,
        v_3: v3,
        v_4: v4,
        s_1: s1,
        s_2: s2,
        s_3: s3,
        s_4: s4,
        q_in,
        q_out,
        w_net,
        eta,
        mep
    };
}

function cycleDiagramPoints(cycle) {
    const temperatures = [cycle.T_1, cycle.T_2, cycle.T_3, cycle.T_4];
    const pressures = [cycle.p_1, cycle.p_2, cycle.p_3, cycle.p_4];
    const volumes = [cycle.v_1, cycle.v_2, cycle.v_3, cycle.v_4];
    const entropies = [cycle.s_1, cycle.s_2, cycle.s_3, cycle.s_4];
    const ts_cycle = [];
    const pv_cycle = [];

    for (let index = 0; index < 4; index++) {
        const nextIndex = (index + 1) % 4;
        for (let step = 0; step <= PATH_SEGMENT_COUNT; step++) {
            const fraction = step / PATH_SEGMENT_COUNT;
            const temperature = temperatures[index]
                + fraction * (temperatures[nextIndex] - temperatures[index]);
            const volume = volumes[index]
                + fraction * (volumes[nextIndex] - volumes[index]);
            const pressure = index === 0 || index === 2
                ? pressures[index] * (volumes[index] / volume) ** K
                : pressures[index] + fraction * (pressures[nextIndex] - pressures[index]);

            let entropy;
            if (index === 0) {
                entropy = entropies[0];
            } else if (index === 1) {
                entropy = entropies[1] + C_V * Math.log(temperature / temperatures[1]);
            } else if (index === 2) {
                entropy = entropies[2];
            } else {
                entropy = C_V * Math.log(temperature / T1_FIXED);
            }

            ts_cycle.push([entropy, temperature]);
            pv_cycle.push([volume, pressure]);
        }
    }

    const ts_states = [1, 2, 3, 4].map(index => [
        cycle[`s_${index}`],
        cycle[`T_${index}`]
    ]);
    const pv_states = [1, 2, 3, 4].map(index => [
        cycle[`v_${index}`],
        cycle[`p_${index}`]
    ]);
    return { ts_cycle, ts_states, pv_cycle, pv_states };
}

export function calculate_cycle(inputs) {
    const gama = Number(inputs.gama ?? 10);
    const T3 = Number(inputs.T_3 ?? 2000);
    if (!Number.isFinite(gama) || gama < 2 || gama > 22) {
        throw new RangeError('gama must be between 2 and 22.');
    }
    if (!Number.isFinite(T3) || T3 < 1500 || T3 > 2500) {
        throw new RangeError('T_3 must be between 1500 and 2500 K.');
    }

    const cycle = cycleAtCompressionRatio(gama, T3);
    const points = cycleDiagramPoints(cycle);
    return {
        gama,
        T_3: T3,
        ...points,
        ...cycle
    };
}
