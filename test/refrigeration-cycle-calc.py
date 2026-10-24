"""
refrigeration-cycle-calc.py
Python calculation engine for the ideal vapor-compression refrigeration cycle.
Recreates the thermodynamic calculations from reference-refridgeration-cycle.py.
"""

import CoolProp.CoolProp as CP

def calculate_cycle(inputs):
    """
    Calculate state points and performance metrics for the refrigeration cycle.
    Receives interactive inputs dictionary:
      inputs["fluid"]: refrigerant name, e.g. "R134a"
      inputs["T_evap"]: evaporator temperature in °C (default 10)
      inputs["T_cond"]: condenser temperature in °C (default 40)
    Returns dictionary with state properties and cycle metrics.
    """
    fluid = str(inputs.get("fluid", "R134a"))
    T_1 = float(inputs.get("T_evap", inputs.get("T1", 10.0)))
    T_3 = float(inputs.get("T_cond", inputs.get("T3", 40.0)))

    # Ensure physical temperature ordering (condenser hotter than evaporator)
    if T_3 <= T_1:
        T_3 = T_1 + 5.0

    T1_K = T_1 + 273.15
    T3_K = T_3 + 273.15

    # State 1: Saturated vapor exiting evaporator
    x_1 = 1.0
    try:
        P_1_Pa = CP.PropsSI('P', 'T', T1_K, 'Q', x_1, fluid)
        h_1_J = CP.PropsSI('H', 'T', T1_K, 'Q', x_1, fluid)
        s_1_J = CP.PropsSI('S', 'T', T1_K, 'Q', x_1, fluid)
    except Exception:
        P_1_Pa = float('nan')
        h_1_J = float('nan')
        s_1_J = float('nan')

    P_1_kPa = P_1_Pa / 1000.0
    P_1_bar = P_1_Pa / 1e5
    h_1_kJ = h_1_J / 1000.0
    s_1_kJ = s_1_J / 1000.0

    # State 3: Saturated liquid exiting condenser
    x_3 = 0.0
    try:
        P_3_Pa = CP.PropsSI('P', 'T', T3_K, 'Q', x_3, fluid)
        h_3_J = CP.PropsSI('H', 'T', T3_K, 'Q', x_3, fluid)
        s_3_J = CP.PropsSI('S', 'T', T3_K, 'Q', x_3, fluid)
    except Exception:
        P_3_Pa = float('nan')
        h_3_J = float('nan')
        s_3_J = float('nan')

    P_3_kPa = P_3_Pa / 1000.0
    P_3_bar = P_3_Pa / 1e5
    h_3_kJ = h_3_J / 1000.0
    s_3_kJ = s_3_J / 1000.0

    # State 2: Isentropic compression (s2 = s1, P2 = P3)
    P_2_Pa = P_3_Pa
    P_2_kPa = P_3_kPa
    P_2_bar = P_3_bar
    s_2_kJ = s_1_kJ
    s_2_J = s_1_J

    try:
        T_2_K = CP.PropsSI('T', 'P', P_2_Pa, 'S', s_2_J, fluid)
        T_2 = T_2_K - 273.15
        h_2_J = CP.PropsSI('H', 'P', P_2_Pa, 'S', s_2_J, fluid)
        h_2_kJ = h_2_J / 1000.0
    except Exception:
        T_2 = float('nan')
        h_2_kJ = float('nan')

    # State a: Saturated vapor at condensing pressure (dew point before condensation)
    x_a = 1.0
    T_a = T_3
    P_a_kPa = P_3_kPa
    P_a_bar = P_3_bar
    try:
        h_a_J = CP.PropsSI('H', 'T', T3_K, 'Q', x_a, fluid)
        s_a_J = CP.PropsSI('S', 'T', T3_K, 'Q', x_a, fluid)
        h_a_kJ = h_a_J / 1000.0
        s_a_kJ = s_a_J / 1000.0
    except Exception:
        h_a_kJ = float('nan')
        s_a_kJ = float('nan')

    # State 4: Isenthalpic throttling expansion (h4 = h3, P4 = P1)
    P_4_kPa = P_1_kPa
    P_4_bar = P_1_bar
    h_4_kJ = h_3_kJ
    h_4_J = h_3_J
    T_4 = T_1
    try:
        s_4_J = CP.PropsSI('S', 'P', P_1_Pa, 'H', h_4_J, fluid)
        s_4_kJ = s_4_J / 1000.0
        x_4 = CP.PropsSI('Q', 'P', P_1_Pa, 'H', h_4_J, fluid)
    except Exception:
        s_4_kJ = float('nan')
        x_4 = float('nan')

    # Performance metrics
    w_in = h_2_kJ - h_1_kJ if (h_2_kJ and h_1_kJ) else float('nan')
    q_in = h_1_kJ - h_4_kJ if (h_1_kJ and h_4_kJ) else float('nan')
    q_out = h_2_kJ - h_3_kJ if (h_2_kJ and h_3_kJ) else float('nan')

    cop = (q_in / w_in) if (w_in and w_in > 0) else float('nan')
    cop_carnot = (T1_K / (T3_K - T1_K)) if (T3_K > T1_K) else float('nan')
    p_ratio = (P_2_kPa / P_1_kPa) if (P_1_kPa and P_1_kPa > 0) else float('nan')

    return {
        # State 1
        "T1": round(T_1, 2),
        "P1_kPa": round(P_1_kPa, 2),
        "P1_bar": round(P_1_bar, 3),
        "h1": round(h_1_kJ, 2),
        "s1": round(s_1_kJ, 4),

        # State 2
        "T2": round(T_2, 2),
        "P2_kPa": round(P_2_kPa, 2),
        "P2_bar": round(P_2_bar, 3),
        "h2": round(h_2_kJ, 2),
        "s2": round(s_2_kJ, 4),

        # State a
        "Ta": round(T_a, 2),
        "Pa_kPa": round(P_a_kPa, 2),
        "Pa_bar": round(P_a_bar, 3),
        "ha": round(h_a_kJ, 2),
        "sa": round(s_a_kJ, 4),

        # State 3
        "T3": round(T_3, 2),
        "P3_kPa": round(P_3_kPa, 2),
        "P3_bar": round(P_3_bar, 3),
        "h3": round(h_3_kJ, 2),
        "s3": round(s_3_kJ, 4),

        # State 4
        "T4": round(T_4, 2),
        "P4_kPa": round(P_4_kPa, 2),
        "P4_bar": round(P_4_bar, 3),
        "h4": round(h_4_kJ, 2),
        "s4": round(s_4_kJ, 4),
        "x4": round(x_4, 3),

        # Cycle Performance Outputs
        "w_in": round(w_in, 2),
        "q_in": round(q_in, 2),
        "q_out": round(q_out, 2),
        "cop": round(cop, 2),
        "cop_carnot": round(cop_carnot, 2),
        "p_ratio": round(p_ratio, 2)
    }
