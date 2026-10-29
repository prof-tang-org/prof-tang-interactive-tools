"""Reference refrigeration calculations with an interactive input/output interface.

The state equations, variable names, and saturation loop follow
reference-refridgeration-cycle.py; plotting is handled by the JS renderer.

Changes from the reference are marked ADAPTATION below:
1. Wrap the script in functions and read interactive inputs instead of constants.
2. Move the original saturation block into a cached helper (same equations/loop).
3. Return plot coordinates and named outputs instead of printing or using Matplotlib.
4. Calculate extra performance metrics for the page's output cards.
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
    # ADAPTATION: read slider values; defaults preserve the reference's 10 C / 40 C.
    T_1 = float(inputs.get('T_evap', 10)) # temperature, [C]
    x_1 = 1 # vapor quality, [-]
    T_3 = float(inputs.get('T_cond', 40)) # temperature, [C]
    x_3 = 0 # vapor quality, [-]

    # ORIGINAL CALCULATIONS: state equations and plot arrays below are unchanged.
    # State 1
    P_1 = CP.PropsSI('P','T',T_1+273.15,'Q',x_1,fld)/1000 # pressure, [kPa]
    h_1 = CP.PropsSI('H','T',T_1+273.15,'Q',x_1,fld)/1000 # specific enthalpy, [kJ/kg]
    s_1 = CP.PropsSI('S','T',T_1+273.15,'Q',x_1,fld)/1000 # specific entropy, [kJ/(kg-K)]


    # State 3
    P_3 = CP.PropsSI('P','T',T_3+273.15,'Q',x_3,fld)/1000 # pressure, [kPa]
    h_3 = CP.PropsSI('H','T',T_3+273.15,'Q',x_3,fld)/1000 # specific enthalpy, [kJ/kg]
    s_3 = CP.PropsSI('S','T',T_3+273.15,'Q',x_3,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # State 2
    P_2 = P_3 # pressure, [kPa]
    s_2 = s_1 # specific entropy, [kJ/(kg-K)]
    T_2 = CP.PropsSI('T','P',P_2*1000,'S',s_2*1000,fld)-273.15 # temperature, [C]
    h_2 = CP.PropsSI('H','P',P_2*1000,'S',s_2*1000,fld)/1000 # specific enthalpy, [kJ/kg]

    # State 4
    P_4 = P_1 # pressure, [kPa]
    h_4 = h_3 # specific enthalpy, [kJ/kg]
    T_4 = CP.PropsSI('T','P',P_4*1000,'H',h_4*1000,fld)-273.15 # temperature, [C]
    s_4 = CP.PropsSI('S','P',P_4*1000,'H',h_4*1000,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # State a: saturated vapor at condensing pressure
    x_a = 1 # vapor quality, [-]
    T_a = T_3 # temperature, [C]
    P_a = P_3 # pressure, [kPa]
    h_a = CP.PropsSI('H','T',T_a+273.15,'Q',x_a,fld)/1000 # specific enthalpy, [kJ/kg]
    s_a = CP.PropsSI('S','T',T_a+273.15,'Q',x_a,fld)/1000 # specific entropy, [kJ/(kg-K)]

    # Arrays for plotting the diagrams
    T = [T_1,T_2,T_a,T_3,T_4,T_1]
    P = [P_1,P_2,P_a,P_3,P_4,P_1]
    s = [s_1,s_2,s_a,s_3,s_4,s_1]
    h = [h_1,h_2,h_a,h_3,h_4,h_1]


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
    # Styling, labels, and axis settings now live in refrigeration-cycle-eq.js.
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
    # zip stops at the five state names, omitting the repeated state 1 at the
    # end of the arrays (that extra point only closes the plotted cycle).
    for state, temperature, pressure, entropy, enthalpy in zip(
            ('1', '2', 'a', '3', '4'), T, P, s, h):
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
        'cop_carnot': (T_1 + 273.15) / (T_3 - T_1),
        'p_ratio': P_2 / P_1,
        'x4': CP.PropsSI('Q', 'P', P_4 * 1000, 'H', h_4 * 1000, fld),
    })
    return result
