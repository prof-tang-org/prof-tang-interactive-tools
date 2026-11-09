"""Interactive vapor-compression cycle model with superheat, subcooling,
and compressor isentropic efficiency.

CoolProp supplies the state properties; the renderer consumes the returned
plot coordinates and cycle metrics.
"""

import CoolProp.CoolProp as CP
from functools import lru_cache  # ADAPTATION: adds caching; absent from the reference.


# ADAPTATION: this block originally ran after the cycle-state calculations.
# Move it into a helper so changing cycle temperatures does not rerun it.
# Keep the reference saturation loop unchanged, but run it once per cached fluid.
# The fixed -30 to 90 C range and 1 C step are still those of the reference.
# Cached arrays are only read by calculate_cycle; do not modify them there.
@lru_cache(maxsize=16)
def saturation_curves(fld):
    # To find the data of the saturated liquid line and the saturated vapor line

    # Temperature
    T_lowerlimit = -30 # temperature, [C]
    T_higherlimit = 90 #temperature, [C]

    # Steps for T
    deltaT = 1 # [C]

    # Initialization
    i = 0
    T_l = [T_lowerlimit] # [C]
    T_v = [T_lowerlimit] # [C]
    P_l = [CP.PropsSI('P','T',T_l[i]+273.15,'Q',0,fld)/1000] # pressure, [kPa]
    P_v = [CP.PropsSI('P','T',T_v[i]+273.15,'Q',1,fld)/1000] # pressure, [kPa]
    s_l = [CP.PropsSI('S','T',T_l[i]+273.15,'Q',0,fld)/1000] # specific entropy, [kJ/(kg-K)]
    s_v = [CP.PropsSI('S','T',T_v[i]+273.15,'Q',1,fld)/1000] # specific entropy, [kJ/(kg-K)]
    h_l = [CP.PropsSI('H','T',T_l[i]+273.15,'Q',0,fld)/1000] # specific enthalpy, [kJ/kg]
    h_v = [CP.PropsSI('H','T',T_v[i]+273.15,'Q',1,fld)/1000] # specific enthalpy, [kJ/kg]

    while i < T_higherlimit-T_lowerlimit:

        i = i+1
        T_l.append(0),T_v.append(0),P_l.append(0),P_v.append(0),
        s_l.append(0),s_v.append(0),h_l.append(0),h_v.append(0)

        # For subcooled liquid
        T_l[i] = T_l[i-1]+deltaT # [C]
        T_v[i] = T_v[i-1]+deltaT # [C]
        P_l[i] = CP.PropsSI('P','T',T_l[i]+273.15,'Q',0,fld)/1000 # pressure, [kPa]
        P_v[i] = CP.PropsSI('P','T',T_v[i]+273.15,'Q',1,fld)/1000 # pressure, [kPa]
        s_l[i] = CP.PropsSI('S','T',T_l[i]+273.15,'Q',0,fld)/1000 # specific entropy, [kJ/(kg-K)]
        s_v[i] = CP.PropsSI('S','T',T_v[i]+273.15,'Q',1,fld)/1000 # specific entropy, [kJ/(kg-K)]
        h_l[i] = CP.PropsSI('H','T',T_l[i]+273.15,'Q',0,fld)/1000 # specific enthalpy, [kJ/kg]
        h_v[i] = CP.PropsSI('H','T',T_v[i]+273.15,'Q',1,fld)/1000 # specific enthalpy, [kJ/kg]

    # ADAPTATION: return the arrays that were top-level variables in the reference.
    return T_l, T_v, P_l, P_v, s_l, s_v, h_l, h_v


# ADAPTATION: the renderer calls this function with an input dictionary on updates.
# The reference executed once at module level with hard-coded input values.
def calculate_cycle(inputs):
    # Fluid of interest
    fld = str(inputs.get('fluid', 'R134a')) # [-]; reference used fld = 'R134a'

    ##############################################################################
    ##############################################################################

    # To find out the T, P, s, and h data for the diagrams

    # Known
    T_evap = float(inputs.get('T_evap', 10)) # evaporating saturation temperature, [C]
    T_cond = float(inputs.get('T_cond', 45)) # condensing saturation temperature, [C]
    SH = float(inputs.get('SH', 7)) # evaporator-exit superheat, [C]
    SC = float(inputs.get('SC', 5)) # condenser-exit subcooling, [C]
    eta_cp = float(inputs.get('eta_cp', 0.7)) # compressor isentropic efficiency, [-]

    # State 1: superheated vapor at evaporator pressure.
    P_1 = CP.PropsSI('P','T',T_evap+273.15,'Q',1,fld)/1000 # pressure, [kPa]
    T_1 = T_evap + SH # temperature, [C]
    h_1 = CP.PropsSI('H','T',T_1+273.15,'P',P_1*1000,fld)/1000 # specific enthalpy, [kJ/kg]
    s_1 = CP.PropsSI('S','T',T_1+273.15,'P',P_1*1000,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # State 3: subcooled liquid at condenser pressure.
    P_3 = CP.PropsSI('P','T',T_cond+273.15,'Q',0,fld)/1000 # pressure, [kPa]
    T_3 = T_cond - SC # temperature, [C]
    h_3 = CP.PropsSI('H','T',T_3+273.15,'P',P_3*1000,fld)/1000 # specific enthalpy, [kJ/kg]
    s_3 = CP.PropsSI('S','T',T_3+273.15,'P',P_3*1000,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # State 2: actual compressor outlet from isentropic efficiency.
    P_2 = P_3 # pressure, [kPa]
    h_2s = CP.PropsSI('H','P',P_2*1000,'S',s_1*1000,fld)/1000 # isentropic enthalpy, [kJ/kg]
    h_2 = h_1 + (h_2s - h_1) / eta_cp # specific enthalpy, [kJ/kg]
    T_2 = CP.PropsSI('T','P',P_2*1000,'H',h_2*1000,fld)-273.15 # temperature, [C]
    s_2 = CP.PropsSI('S','P',P_2*1000,'H',h_2*1000,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # State 4: throttling valve outlet; enthalpy remains constant.
    P_4 = P_1 # pressure, [kPa]
    h_4 = h_3 # specific enthalpy, [kJ/kg]
    T_4 = CP.PropsSI('T','P',P_4*1000,'H',h_4*1000,fld)-273.15 # temperature, [C]
    s_4 = CP.PropsSI('S','P',P_4*1000,'H',h_4*1000,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # Saturated vapor and liquid at condenser pressure, for the cycle plots.
    T_a = T_cond
    P_a = P_3
    h_a = CP.PropsSI('H','T',T_a+273.15,'Q',1,fld)/1000
    s_a = CP.PropsSI('S','T',T_a+273.15,'Q',1,fld)/1000
    T_b = T_cond
    P_b = P_3
    h_b = CP.PropsSI('H','T',T_b+273.15,'Q',0,fld)/1000
    s_b = CP.PropsSI('S','T',T_b+273.15,'Q',0,fld)/1000
    T_c = T_evap
    P_c = P_1
    h_c = CP.PropsSI('H','T',T_c+273.15,'Q',1,fld)/1000
    s_c = CP.PropsSI('S','T',T_c+273.15,'Q',1,fld)/1000

    # Arrays follow the plotted cycle path 1 -> 2 -> a -> b -> 3 -> 4 -> 1.
    T = [T_1,T_2,T_a,T_b,T_3,T_4,T_c,T_1]
    P = [P_1,P_2,P_a,P_b,P_3,P_4,P_c,P_1]
    s = [s_1,s_2,s_a,s_b,s_3,s_4,s_c,s_1]
    h = [h_1,h_2,h_a,h_b,h_3,h_4,h_c,h_1]


    ##############################################################################
    ##############################################################################

    # ADAPTATION: the reference printed T, P, s, h here, then ran the saturation
    # block inline. Omit printing and obtain the same arrays from the cached helper.
    # Saturation curves depend only on the refrigerant, so slider changes reuse them.
    T_l, T_v, P_l, P_v, s_l, s_v, h_l, h_v = saturation_curves(fld)

    ##############################################################################
    ##############################################################################


    # ADAPTATION: everything below packages or adds outputs for the web page.
    # This replaces the reference's plt.plot/annotate/axis/label/show calls.
    # Styling, labels, and axis settings now live in IdealVCRC.js.
    # Adapt the reference arrays to the renderer's list-of-points interface.
    # zip(s, T) pairs matching entries: (s[0], T[0]), (s[1], T[1]), etc.
    # map(list, ...) converts each pair from a tuple to a list, and the outer
    # list(...) collects them into [[s[0], T[0]], [s[1], T[1]], ...].
    # The other diagrams use the same conversion with their x and y arrays.
    result = {
        "ts_cycle": list(map(list, zip(s, T))),
        "ph_cycle": list(map(list, zip(h, P))),
        "th_cycle": list(map(list, zip(h, T))),
        "ts_liquid": list(map(list, zip(s_l, T_l))),
        "ts_vapor": list(map(list, zip(s_v, T_v))),
        "ph_liquid": list(map(list, zip(h_l, P_l))),
        "ph_vapor": list(map(list, zip(h_v, P_v))),
        "th_liquid": list(map(list, zip(h_l, T_l))),
        "th_vapor": list(map(list, zip(h_v, T_v))),
    }
    # ADAPTATION: expose individual state properties as renderer variable IDs;
    # the reference kept these as Python variables only. Also add pressure in bar.
    # Walk through the state names and their matching properties together.
    # Each iteration adds named outputs such as T1, P1_kPa, s1, and h1.
    # zip stops at the six named states, omitting the repeated state 1 at the
    # end of the arrays (that extra point only closes the plotted cycle).
    for state, temperature, pressure, entropy, enthalpy in zip(
            ('1', '2', 'a', 'b', '3', '4', 'c'), T, P, s, h):
        result.update({
            'T' + state: temperature,
            'P' + state + '_kPa': pressure,
            'P' + state + '_bar': pressure / 100,
            's' + state: entropy,
            'h' + state: enthalpy,
        })

    # ADAPTATION: these performance metrics and the state-4 quality calculation
    # are additions to the reference, used by the interactive page's output cards.
    w_in = h_2 - h_1
    q_in = h_1 - h_4
    result.update({
        'w_in': w_in,
        'q_in': q_in,
        'q_out': h_2 - h_3,
        'cop': q_in / w_in,
        'cop_carnot': (T_evap + 273.15) / (T_cond - T_evap),
        'p_ratio': P_2 / P_1,
        'eta_cp': eta_cp,
        'x4': CP.PropsSI('Q', 'P', P_4 * 1000, 'H', h_4 * 1000, fld),
    })
    return result
