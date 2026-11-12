"""CoolProp calculations for the superheated, reheated vapor power cycle."""

from functools import lru_cache

import CoolProp.CoolProp as CP


_WATER = "Water"
_KELVIN_OFFSET = 273.15
_PA_PER_KPA = 1000.0
_J_PER_KJ = 1000.0
_CRITICAL_TEMPERATURE_C = 373.946


@lru_cache(maxsize=1)
def saturation_curves():
    """Return water saturation-dome coordinates below the critical point."""
    lower_temperature = 0.01
    upper_temperature = _CRITICAL_TEMPERATURE_C - 4.0
    sample_count = 100
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


def calculate_cycle(inputs):
    """Calculate cycle states, performance, and diagram coordinates."""
    boiling_temperature = float(inputs.get("T_boil", 300.0))
    condensation_temperature = float(inputs.get("T_cond", 50.0))
    temperature_1 = float(inputs.get("T1", 450.0))
    temperature_3 = float(inputs.get("T3", 450.0))
    turbine_efficiency = float(inputs.get("eta_t", 0.85))
    pump_efficiency = float(inputs.get("eta_p", 0.8))
    reheat_pressure = float(inputs.get("p_reheat", 800.0)) * _PA_PER_KPA

    if not 200.0 <= boiling_temperature <= 350.0:
        raise ValueError("T_boil must be between 200 and 350 °C.")
    if not 40.0 <= condensation_temperature <= 100.0:
        raise ValueError("T_cond must be between 40 and 100 °C.")
    if not 400.0 <= temperature_1 <= 500.0:
        raise ValueError("T1 must be between 400 and 500 °C.")
    if not 400.0 <= temperature_3 <= 500.0:
        raise ValueError("T3 must be between 400 and 500 °C.")
    if not 0.6 <= turbine_efficiency <= 1.0:
        raise ValueError("eta_t must be between 0.6 and 1.")
    if not 0.6 <= pump_efficiency <= 1.0:
        raise ValueError("eta_p must be between 0.6 and 1.")

    temperature_5_k = condensation_temperature + _KELVIN_OFFSET
    pressure_1 = CP.PropsSI(
        "P", "T", boiling_temperature + _KELVIN_OFFSET, "Q", 0, _WATER
    )
    pressure_5 = CP.PropsSI("P", "T", temperature_5_k, "Q", 0, _WATER)
    if not pressure_5 < reheat_pressure < pressure_1:
        raise ValueError(
            "Reheat pressure must be between condenser and boiler pressures."
        )

    # State 1: superheated steam at boiler pressure.
    h_1 = CP.PropsSI("H", "T", temperature_1 + _KELVIN_OFFSET, "P", pressure_1, _WATER)
    s_1 = CP.PropsSI("S", "T", temperature_1 + _KELVIN_OFFSET, "P", pressure_1, _WATER)

    # State 2: actual first-stage turbine exit at reheat pressure.
    h_2s = CP.PropsSI("H", "P", reheat_pressure, "S", s_1, _WATER)
    h_2 = h_1 - turbine_efficiency * (h_1 - h_2s)
    temperature_2_k = CP.PropsSI("T", "P", reheat_pressure, "H", h_2, _WATER)
    s_2 = CP.PropsSI("S", "P", reheat_pressure, "H", h_2, _WATER)
    quality_2 = CP.PropsSI("Q", "P", reheat_pressure, "H", h_2, _WATER)
    state_2_is_two_phase = 0.0 <= quality_2 <= 1.0

    # State c: saturated vapor at reheat pressure, on the 2 -> 3 reheat path.
    if state_2_is_two_phase:
        temperature_c_k = CP.PropsSI("T", "P", reheat_pressure, "Q", 1, _WATER)
        h_c = CP.PropsSI("H", "P", reheat_pressure, "Q", 1, _WATER)
        s_c = CP.PropsSI("S", "P", reheat_pressure, "Q", 1, _WATER)
    else:
        temperature_c_k = temperature_2_k
        h_c = h_2
        s_c = s_2

    # State 3: superheated steam leaving the reheater.
    h_3 = CP.PropsSI("H", "T", temperature_3 + _KELVIN_OFFSET, "P", reheat_pressure, _WATER)
    s_3 = CP.PropsSI("S", "T", temperature_3 + _KELVIN_OFFSET, "P", reheat_pressure, _WATER)

    # State 4: actual second-stage turbine exit at condenser pressure.
    h_4s = CP.PropsSI("H", "P", pressure_5, "S", s_3, _WATER)
    h_4 = h_3 - turbine_efficiency * (h_3 - h_4s)
    temperature_4_k = CP.PropsSI("T", "P", pressure_5, "H", h_4, _WATER)
    s_4 = CP.PropsSI("S", "P", pressure_5, "H", h_4, _WATER)

    # State d: saturated vapor at condenser temperature when State 4 is superheated.
    h_d = CP.PropsSI("H", "P", pressure_5, "Q", 1, _WATER)
    s_d = CP.PropsSI("S", "P", pressure_5, "Q", 1, _WATER)
    if h_4 <= h_d:
        # Preserve the direct State 4 -> State 5 path when State 4 is not superheated.
        h_d = h_4
        s_d = s_4

    # State 5: saturated liquid leaving the condenser.
    h_5 = CP.PropsSI("H", "P", pressure_5, "Q", 0, _WATER)
    s_5 = CP.PropsSI("S", "P", pressure_5, "Q", 0, _WATER)

    # State 6: actual pump exit at boiler pressure.
    h_6s = CP.PropsSI("H", "P", pressure_1, "S", s_5, _WATER)
    h_6 = h_5 + (h_6s - h_5) / pump_efficiency
    temperature_6_k = CP.PropsSI("T", "P", pressure_1, "H", h_6, _WATER)
    s_6 = CP.PropsSI("S", "P", pressure_1, "H", h_6, _WATER)

    # States a and b: saturated liquid and vapor at the boiler temperature.
    h_a = CP.PropsSI(
        "H", "T", boiling_temperature + _KELVIN_OFFSET, "Q", 0, _WATER
    )
    s_a = CP.PropsSI(
        "S", "T", boiling_temperature + _KELVIN_OFFSET, "Q", 0, _WATER
    )
    h_b = CP.PropsSI(
        "H", "T", boiling_temperature + _KELVIN_OFFSET, "Q", 1, _WATER
    )
    s_b = CP.PropsSI(
        "S", "T", boiling_temperature + _KELVIN_OFFSET, "Q", 1, _WATER
    )

    h_values = [h_1, h_2, h_c, h_3, h_4, h_d, h_5, h_6, h_a, h_b, h_1]
    s_values = [s_1, s_2, s_c, s_3, s_4, s_d, s_5, s_6, s_a, s_b, s_1]
    pressure_values = [
        pressure_1,
        reheat_pressure,
        reheat_pressure,
        reheat_pressure,
        pressure_5,
        pressure_5,
        pressure_5,
        pressure_1,
        pressure_1,
        pressure_1,
        pressure_1,
    ]
    temperature_values = [
        temperature_1,
        temperature_2_k - _KELVIN_OFFSET,
        temperature_c_k - _KELVIN_OFFSET,
        temperature_3,
        temperature_4_k - _KELVIN_OFFSET,
        condensation_temperature,
        condensation_temperature,
        temperature_6_k - _KELVIN_OFFSET,
        boiling_temperature,
        boiling_temperature,
        temperature_1,
    ]

    turbine_work = ((h_1 - h_2) + (h_3 - h_4)) / _J_PER_KJ
    pump_work = (h_6 - h_5) / _J_PER_KJ
    heat_added = ((h_1 - h_6) + (h_3 - h_2)) / _J_PER_KJ
    heat_rejected = (h_4 - h_5) / _J_PER_KJ
    net_work = turbine_work - pump_work

    (
        liquid_ts,
        vapor_ts,
        liquid_ph,
        vapor_ph,
        liquid_th,
        vapor_th,
    ) = saturation_curves()

    return {
        "p_1": pressure_1 / _PA_PER_KPA,
        "p_reheat": reheat_pressure / _PA_PER_KPA,
        "p_5": pressure_5 / _PA_PER_KPA,
        "p_ratio": pressure_1 / pressure_5,
        "T_2": temperature_2_k - _KELVIN_OFFSET,
        "T_4": temperature_4_k - _KELVIN_OFFSET,
        "q_in": heat_added,
        "q_out": heat_rejected,
        "w_t": turbine_work,
        "w_p": pump_work,
        "w_net": net_work,
        "eta": net_work / heat_added,
        "ts_liquid": liquid_ts,
        "ts_vapor": vapor_ts,
        "ts_cycle": [
            [entropy / _J_PER_KJ, temperature]
            for entropy, temperature in zip(s_values, temperature_values)
        ],
        "ph_liquid": liquid_ph,
        "ph_vapor": vapor_ph,
        "ph_cycle": [
            [enthalpy / _J_PER_KJ, pressure / _PA_PER_KPA]
            for enthalpy, pressure in zip(h_values, pressure_values)
        ],
        "th_liquid": liquid_th,
        "th_vapor": vapor_th,
        "th_cycle": [
            [enthalpy / _J_PER_KJ, temperature]
            for enthalpy, temperature in zip(h_values, temperature_values)
        ],
    }
