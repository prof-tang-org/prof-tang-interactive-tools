"""
ph-diagram.py
Custom plot script in Python for generating thermodynamic P-h (Pressure-Enthalpy) diagrams.
Uses CoolProp to calculate saturation dome (saturated liquid and vapor curves) and quality lines.
Compatible with templates/renderer.js 'points' mode.
"""

import math
import CoolProp.CoolProp as CP

# Cache computed curves per fluid to ensure smooth 60fps interaction during slider dragging
_DOME_CACHE = {}

def phDiagram(ctx):
    """
    Compute P-h saturation dome and quality curves for the current fluid.
    Returns a multi-series structure formatted for renderer.js 'points' mode:
    [
        { "points": [[h, P], ...], "color": "#0284c7", "name": "Saturated Liquid (x=0)" },
        { "points": [[h, P], ...], "color": "#ef4444", "name": "Saturated Vapor (x=1)" },
        ...
    ]
    """
    # Extract fluid from interactive state (supports dict or JsProxy)
    try:
        if hasattr(ctx, 'state'):
            fluid = str(ctx.state['fluid']) if 'fluid' in ctx.state else getattr(ctx.state, 'fluid', 'Water')
        else:
            fluid = 'Water'
    except Exception:
        fluid = 'Water'

    if fluid in _DOME_CACHE:
        return _DOME_CACHE[fluid]

    # Air is a mixture that doesn't have standard pure saturation curves in PropsSI
    if str(fluid).lower() == 'air':
        _DOME_CACHE[fluid] = []
        return []

    try:
        T_crit = CP.PropsSI('TCRIT', '', 0, '', 0, fluid)
        T_min = CP.PropsSI('TMIN', '', 0, '', 0, fluid)
        if math.isnan(T_crit) or math.isnan(T_min):
            return []

        # Determine reasonable physical lower temperature bound above freezing / triple point
        if fluid == 'Water':
            T_start = 273.16 + 0.1
        elif fluid == 'R134a':
            T_start = max(T_min, 190.0)
        elif fluid == 'CO2':
            T_start = max(T_min, 216.6)
        else:
            T_start = max(T_min, 180.0)

        T_end = T_crit - 0.15
        steps = 60

        liquid_curve = []
        vapor_curve = []
        quality_curves = {
            0.2: [],
            0.4: [],
            0.6: [],
            0.8: []
        }

        for i in range(steps + 1):
            frac = i / float(steps)
            # Power distribution packs more resolution near the critical point
            T = T_start + (T_end - T_start) * (frac ** 1.35)

            P = CP.PropsSI('P', 'T', T, 'Q', 0, fluid)
            hf = CP.PropsSI('H', 'T', T, 'Q', 0, fluid)
            hg = CP.PropsSI('H', 'T', T, 'Q', 1, fluid)

            if not (math.isnan(P) or math.isnan(hf) or math.isnan(hg)):
                P_bar = P / 1e5
                hf_kJ = hf / 1000.0
                hg_kJ = hg / 1000.0

                liquid_curve.append([round(hf_kJ, 2), round(P_bar, 3)])
                vapor_curve.append([round(hg_kJ, 2), round(P_bar, 3)])

                for q in quality_curves:
                    hq_kJ = hf_kJ + q * (hg_kJ - hf_kJ)
                    quality_curves[q].append([round(hq_kJ, 2), round(P_bar, 3)])

        P_crit_bar = CP.PropsSI('PCRIT', '', 0, '', 0, fluid) / 1e5
        h_crit_kJ = CP.PropsSI('H', 'T', T_crit, 'Q', 0, fluid) / 1000.0
        crit_pt = [round(h_crit_kJ, 2), round(P_crit_bar, 3)]

        # Append critical point to liquid curve and prepend to reversed vapor curve
        sat_liquid = liquid_curve + [crit_pt]
        sat_vapor = [crit_pt] + list(reversed(vapor_curve))

        series_list = [
            {
                "points": sat_liquid,
                "color": "#0284c7",
                "strokeWidth": 2.5,
                "name": "sat_liquid"
            },
            {
                "points": sat_vapor,
                "color": "#ef4444",
                "strokeWidth": 2.5,
                "name": "sat_vapor"
            }
        ]

        # Add constant quality dashed lines inside the dome
        for q, pts in quality_curves.items():
            pts_with_crit = pts + [crit_pt]
            series_list.append({
                "points": pts_with_crit,
                "color": "#94a3b8",
                "dashed": True,
                "strokeWidth": 1.2,
                "opacity": 0.65,
                "name": f"quality_{int(q * 100)}"
            })

        _DOME_CACHE[fluid] = series_list
        return series_list

    except Exception as err:
        print(f"[ph-diagram.py] Error generating P-h diagram for {fluid}:", err)
        return []
