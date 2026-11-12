"""Cold-air-standard calculations for the ideal Otto cycle."""

import math


_T_1 = 300.0
_P_1 = 100.0
_GAS_CONSTANT = 8.314 / 28.97
_C_V = 0.718
_K = 1.4
_SWEEP_COUNT = 61
_PATH_SEGMENT_COUNT = 20


def _cycle_at_compression_ratio(gama, T_3):
    """Calculate the four Otto-cycle states and performance at one input."""
    T_2 = _T_1 * gama ** (_K - 1)
    T_4 = T_3 / gama ** (_K - 1)

    p_2 = _P_1 * gama**_K
    p_3 = p_2 * T_3 / T_2
    p_4 = p_3 / gama**_K

    v_1 = _GAS_CONSTANT * _T_1 / _P_1
    v_2 = v_1 / gama
    v_3 = v_2
    v_4 = v_1

    q_in = _C_V * (T_3 - T_2)
    q_out = _C_V * (T_4 - _T_1)
    w_net = q_in - q_out
    eta = w_net / q_in
    mep = w_net / (v_1 - v_2)

    s_1 = 0.0
    s_2 = 0.0
    s_3 = _C_V * math.log(T_3 / T_2)
    s_4 = s_3

    return {
        "T_1": _T_1,
        "T_2": T_2,
        "T_3": T_3,
        "T_4": T_4,
        "p_1": _P_1,
        "p_2": p_2,
        "p_3": p_3,
        "p_4": p_4,
        "v_1": v_1,
        "v_2": v_2,
        "v_3": v_3,
        "v_4": v_4,
        "s_1": s_1,
        "s_2": s_2,
        "s_3": s_3,
        "s_4": s_4,
        "q_in": q_in,
        "q_out": q_out,
        "w_net": w_net,
        "eta": eta,
        "mep": mep,
    }


def _cycle_diagram_points(cycle):
    """Return smooth T-s and p-v cycle paths plus the four state markers."""
    count = _PATH_SEGMENT_COUNT
    temperatures = [cycle[f"T_{index}"] for index in range(1, 5)]
    pressures = [cycle[f"p_{index}"] for index in range(1, 5)]
    volumes = [cycle[f"v_{index}"] for index in range(1, 5)]
    entropies = [cycle[f"s_{index}"] for index in range(1, 5)]

    ts_cycle = []
    pv_cycle = []

    for index in range(4):
        next_index = (index + 1) % 4
        for step in range(count + 1):
            fraction = step / count
            temperature = temperatures[index] + fraction * (
                temperatures[next_index] - temperatures[index]
            )
            volume = volumes[index] + fraction * (
                volumes[next_index] - volumes[index]
            )
            if index in (0, 2):
                pressure = pressures[index] * (
                    volumes[index] / volume
                ) ** _K
            else:
                pressure = pressures[index] + fraction * (
                    pressures[next_index] - pressures[index]
                )

            if index == 0:
                entropy = entropies[0]
            elif index == 1:
                entropy = entropies[1] + _C_V * math.log(
                    temperature / temperatures[1]
                )
            elif index == 2:
                entropy = entropies[2]
            else:
                entropy = _C_V * math.log(temperature / _T_1)

            ts_cycle.append([entropy, temperature])
            pv_cycle.append([volume, pressure])

    ts_states = [
        [cycle[f"s_{index}"], cycle[f"T_{index}"]]
        for index in range(1, 5)
    ]
    pv_states = [
        [cycle[f"v_{index}"], cycle[f"p_{index}"]]
        for index in range(1, 5)
    ]
    return ts_cycle, ts_states, pv_cycle, pv_states


def calculate_cycle(inputs):
    """Return Otto-cycle performance and plot coordinates for the page."""
    gama = float(inputs.get("gama", 10.0))
    T_3 = float(inputs.get("T_3", 2000.0))
    if not 2.0 <= gama <= 22.0:
        raise ValueError("gama must be between 2 and 22.")
    if not 1500.0 <= T_3 <= 2500.0:
        raise ValueError("T_3 must be between 1500 and 2500 K.")

    cycle = _cycle_at_compression_ratio(gama, T_3)
    ts_cycle, ts_states, pv_cycle, pv_states = _cycle_diagram_points(cycle)

    result = {
        "gama": gama,
        "T_3": T_3,
        "ts_cycle": ts_cycle,
        "ts_states": ts_states,
        "pv_cycle": pv_cycle,
        "pv_states": pv_states,
        "eta": cycle["eta"],
    }
    result.update(cycle)
    return result
