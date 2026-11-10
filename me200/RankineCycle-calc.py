"""CoolProp calculations for the ideal Rankine cycle simulation."""

from functools import lru_cache

import CoolProp.CoolProp as CP


_WATER = "Water"
_KELVIN_OFFSET = 273.15
_PA_PER_KPA = 1000.0
_J_PER_KJ = 1000.0
_CRITICAL_TEMPERATURE_C = 373.946


@lru_cache(maxsize=1)
def saturation_curves():
    """Return the saturation dome coordinates below the critical temperature."""
    lower_temperature = 10.0
    upper_temperature = _CRITICAL_TEMPERATURE_C - 4
    sample_count = 81
    temperatures = [
        lower_temperature
        + (upper_temperature - lower_temperature) * index / (sample_count - 1)
        for index in range(sample_count)
    ]

    liquid_ts = []
    vapor_ts = []
    liquid_ph = []
    vapor_ph = []
    liquid_th = []
    vapor_th = []
    for temperature in temperatures:
        temperature_k = temperature + _KELVIN_OFFSET
        pressure = CP.PropsSI("P", "T", temperature_k, "Q", 0, _WATER) / _PA_PER_KPA
        h_liquid = CP.PropsSI("H", "T", temperature_k, "Q", 0, _WATER) / _J_PER_KJ
        h_vapor = CP.PropsSI("H", "T", temperature_k, "Q", 1, _WATER) / _J_PER_KJ
        s_liquid = CP.PropsSI("S", "T", temperature_k, "Q", 0, _WATER) / _J_PER_KJ
        s_vapor = CP.PropsSI("S", "T", temperature_k, "Q", 1, _WATER) / _J_PER_KJ

        liquid_ts.append([s_liquid, temperature])
        vapor_ts.append([s_vapor, temperature])
        liquid_ph.append([h_liquid, pressure])
        vapor_ph.append([h_vapor, pressure])
        liquid_th.append([h_liquid, temperature])
        vapor_th.append([h_vapor, temperature])
    return liquid_ts, vapor_ts, liquid_ph, vapor_ph, liquid_th, vapor_th


def _cycle_at_temperatures(boiler_temperature, condenser_temperature):
    """Calculate the ideal Rankine states and specific cycle performance."""
    if not 200.0 <= boiler_temperature <= 350.0:
        raise ValueError("T_boil must be between 200 and 350 °C.")
    if not 40.0 <= condenser_temperature <= 100.0:
        raise ValueError("T_cond must be between 40 and 100 °C.")
    if condenser_temperature >= boiler_temperature:
        raise ValueError("T_cond must be lower than T_boil.")

    boiler_temperature_k = boiler_temperature + _KELVIN_OFFSET
    condenser_temperature_k = condenser_temperature + _KELVIN_OFFSET

    # State 1: saturated vapor leaving the boiler.
    p_1 = CP.PropsSI("P", "T", boiler_temperature_k, "Q", 1, _WATER)
    h_1 = CP.PropsSI("H", "T", boiler_temperature_k, "Q", 1, _WATER) / _J_PER_KJ
    s_1 = CP.PropsSI("S", "T", boiler_temperature_k, "Q", 1, _WATER) / _J_PER_KJ

    # State a: saturated liquid at boiler temperature.
    h_a = CP.PropsSI("H", "T", boiler_temperature_k, "Q", 0, _WATER) / _J_PER_KJ
    s_a = CP.PropsSI("S", "T", boiler_temperature_k, "Q", 0, _WATER) / _J_PER_KJ

    # State 3: saturated liquid leaving the condenser.
    p_2 = CP.PropsSI("P", "T", condenser_temperature_k, "Q", 0, _WATER)
    h_3 = CP.PropsSI("H", "T", condenser_temperature_k, "Q", 0, _WATER) / _J_PER_KJ
    s_3 = CP.PropsSI("S", "T", condenser_temperature_k, "Q", 0, _WATER) / _J_PER_KJ

    # State 2: isentropic turbine expansion to condenser pressure.
    h_2 = CP.PropsSI("H", "P", p_2, "S", s_1 * _J_PER_KJ, _WATER) / _J_PER_KJ
    t_2 = CP.PropsSI("T", "P", p_2, "S", s_1 * _J_PER_KJ, _WATER) - _KELVIN_OFFSET
    x_2 = CP.PropsSI("Q", "P", p_2, "S", s_1 * _J_PER_KJ, _WATER)

    # State 4: isentropic pump compression to boiler pressure.
    h_4 = CP.PropsSI("H", "P", p_1, "S", s_3 * _J_PER_KJ, _WATER) / _J_PER_KJ
    t_4 = CP.PropsSI("T", "P", p_1, "S", s_3 * _J_PER_KJ, _WATER) - _KELVIN_OFFSET

    w_t = h_1 - h_2
    w_p = h_4 - h_3
    q_in = h_1 - h_4
    q_out = h_2 - h_3
    w_net = w_t - w_p
    eta = w_net / q_in

    return {
        "p_1": p_1 / _PA_PER_KPA,
        "p_2": p_2 / _PA_PER_KPA,
        "h_1": h_1,
        "h_2": h_2,
        "h_3": h_3,
        "h_4": h_4,
        "h_a": h_a,
        "s_1": s_1,
        "s_2": s_1,
        "s_3": s_3,
        "s_4": s_3,
        "s_a": s_a,
        "T_1": boiler_temperature,
        "T_2": t_2,
        "T_3": condenser_temperature,
        "T_4": t_4,
        "T_a": boiler_temperature,
        "p_a": p_1 / _PA_PER_KPA,
        "x_2": x_2,
        "q_in": q_in,
        "q_out": q_out,
        "w_t": w_t,
        "w_p": w_p,
        "w_net": w_net,
        "eta": eta,
    }


def calculate_cycle(inputs):
    """Return state outputs and plotted saturation/cycle coordinates."""
    boiler_temperature = float(inputs.get("T_boil", 300.0))
    condenser_temperature = float(inputs.get("T_cond", 50.0))
    cycle = _cycle_at_temperatures(boiler_temperature, condenser_temperature)

    (
        liquid_ts,
        vapor_ts,
        liquid_ph,
        vapor_ph,
        liquid_th,
        vapor_th,
    ) = saturation_curves()
    cycle_points = [
        [cycle["s_1"], cycle["T_1"]],
        [cycle["s_2"], cycle["T_2"]],
        [cycle["s_3"], cycle["T_3"]],
        [cycle["s_4"], cycle["T_4"]],
        [cycle["s_a"], cycle["T_a"]],
        [cycle["s_1"], cycle["T_1"]],
    ]
    pressure_points = [
        [cycle["h_1"], cycle["p_1"]],
        [cycle["h_2"], cycle["p_2"]],
        [cycle["h_3"], cycle["p_2"]],
        [cycle["h_4"], cycle["p_1"]],
        [cycle["h_a"], cycle["p_a"]],
        [cycle["h_1"], cycle["p_1"]],
    ]
    temperature_points = [
        [cycle["h_1"], cycle["T_1"]],
        [cycle["h_2"], cycle["T_2"]],
        [cycle["h_3"], cycle["T_3"]],
        [cycle["h_4"], cycle["T_4"]],
        [cycle["h_a"], cycle["T_a"]],
        [cycle["h_1"], cycle["T_1"]],
    ]

    result = {
        "p_ratio": cycle["p_1"] / cycle["p_2"],
        "ts_liquid": liquid_ts,
        "ts_vapor": vapor_ts,
        "ts_cycle": cycle_points,
        "ph_liquid": liquid_ph,
        "ph_vapor": vapor_ph,
        "ph_cycle": pressure_points,
        "th_liquid": liquid_th,
        "th_vapor": vapor_th,
        "th_cycle": temperature_points,
    }
    result.update(cycle)
    return result
