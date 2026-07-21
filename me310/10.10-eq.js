/** @type {PageData} */
const pageData = {
    "title": "Specific Energy and Two Possible Flow States",
    "layout": {
        "grid": [
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            },
            {
                "desktop": "1fr 1.2fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Specific energy of an open-channel flow"
        },
        {
            "type": "note",
            "text": "**Equations**"
        },
        {
            "type": "equation",
            "text": "E = y + \\frac{q^2}{2gy^2}"
        },
        {
            "type": "equation",
            "text": "E_1 + z_1 = E_2 + z_2"
        },
        {
            "type": "list",
            "header": "Variables",
            "content": [
                {
                    "text": "$E$ — specific energy [m]"
                },
                {
                    "text": "$y$ — depth of open-channel flow [m]"
                },
                {
                    "text": "$q$ — flow rate per unit width [m²/s]"
                },
                {
                    "text": "$g$ — gravitational acceleration [m/s²]"
                },
                {
                    "text": "$z$ — elevation of the channel bottom [m]"
                },
                {
                    "text": "$y_c$ — critical depth [m]"
                },
                {
                    "text": "$z_c$ — maximum bump height to maintain subcritical flow without choking [m]"
                }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/10.10-eq.png",
        "alt": "Schematic of open-channel flow over a bump, showing depths and elevations at section 1, crest, and section 2."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational acceleration ($g$)",
                "value": 9.81
            },
            {
                "id": "z-1",
                "text": "Bottom elevation at section 1 ($z_1$)",
                "value": 0
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "q",
                "text": "Flow rate per unit width ($q$)",
                "min": 0.5,
                "max": 0.8,
                "initialValue": 0.6,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "y-1",
                "text": "Upstream Depth ($y_1$)",
                "min": 0.5,
                "max": 1.0,
                "initialValue": 0.7,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "z-2",
                "text": "Downstream Bump Height ($z_2$)",
                "min": 0.01,
                "max": "floor((y-1 + (q * q) / (2 * g * y-1 * y-1) + z-1 - 1.5 * pow(q * q / g, 1 / 3)) * 100) / 100",
                "initialValue": 0.2,
                "step": 0.01
            }
        ],
        "outputs": [
            {
                "text": "Upstream Velocity ($V_1$)",
                "id": "v-1",
                "type": "calculation",
                "value": "q / y-1"
            },
            {
                "text": "Upstream Froude Number ($Fr_1$)",
                "id": "froude-1",
                "type": "calculation",
                "value": "v-1 / sqrt(g * y-1)"
            },
            {
                "text": "Upstream Specific Energy ($E_1$)",
                "id": "E-1",
                "type": "calculation",
                "value": "y-1 + (v-1 * v-1) / (2 * g)"
            },
            {
                "text": "Critical Depth ($y_c$)",
                "id": "y-c",
                "type": "calculation",
                "value": "pow(q * q / g, 1 / 3)"
            },
            {
                "text": "Min Specific Energy ($E_{min}$)",
                "id": "E-min",
                "type": "calculation",
                "value": "1.5 * y-c"
            },
            {
                "text": "Max Bump Height ($z_c$)",
                "id": "z-c",
                "type": "calculation",
                "value": "E-1 + z-1 - E-min"
            },
            {
                "text": "Downstream Specific Energy ($E_2$)",
                "id": "E-2",
                "type": "calculation",
                "value": "E-1 + z-1 - z-2"
            },
            {
                "text": "State 2': Subcritical Depth ($y_{2'}$)",
                "id": "y2-prime",
                "type": "calculation",
                "value": "(() => { const E2Val = E-2; const qVal = q; const gVal = g; const EminVal = E-min; let yc = pow(qVal * qVal / gVal, 1 / 3); let E2Clamped = E2Val < EminVal ? EminVal : E2Val; let low = yc; let high = E2Clamped; const f = y => y * y * y - E2Clamped * y * y + (qVal * qVal) / (2 * gVal); for (let i = 0; i < 50; i++) { let mid = (low + high) / 2; if (f(low) * f(mid) < 0) { high = mid; } else { low = mid; } } return (low + high) / 2; })()"
            },
            {
                "text": "State 2': Subcritical Velocity ($V_{2'}$)",
                "id": "v2-prime",
                "type": "calculation",
                "value": "q / y2-prime"
            },
            {
                "text": "State 2': Froude Number ($Fr_{2'}$)",
                "id": "froude-2-prime",
                "type": "calculation",
                "value": "v2-prime / sqrt(g * y2-prime)"
            },
            {
                "text": "State 2': Water Level ($y_{2'} + z_2$)",
                "id": "wl2-prime",
                "type": "calculation",
                "value": "y2-prime + z-2"
            },
            {
                "text": "State 2'': Supercritical Depth ($y_{2''}$)",
                "id": "y2-double-prime",
                "type": "calculation",
                "value": "(() => { const E2Val = E-2; const qVal = q; const gVal = g; const EminVal = E-min; let yc = pow(qVal * qVal / gVal, 1 / 3); let E2Clamped = E2Val < EminVal ? EminVal : E2Val; let low = yc == 0 ? 0 : 1e-8; let high = yc; const f = y => y * y * y - E2Clamped * y * y + (qVal * qVal) / (2 * gVal); for (let i = 0; i < 50; i++) { let mid = (low + high) / 2; if (f(low) * f(mid) < 0) { high = mid; } else { low = mid; } } return (low + high) / 2; })()"
            },
            {
                "text": "State 2'': Supercritical Velocity ($V_{2''}$)",
                "id": "v2-double-prime",
                "type": "calculation",
                "value": "q / y2-double-prime"
            },
            {
                "text": "State 2'': Froude Number ($Fr_{2''}$)",
                "id": "froude-2-double-prime",
                "type": "calculation",
                "value": "v2-double-prime / sqrt(g * y2-double-prime)"
            },
            {
                "text": "State 2'': Water Level ($y_{2''} + z_2$)",
                "id": "wl2-double-prime",
                "type": "calculation",
                "value": "y2-double-prime + z-2"
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "aspectRatio": 2.5,
        "settings": [
            {
                "x": "y-1",
                "y": "E-1",
                "xLabel": "Flow Depth $y$ [m]",
                "yLabel": "Specific Energy $E$ [m]",
                "xMin": 0.1,
                "xMax": 1.2,
                "yMin": 0,
                "yMax": 1.5,
                "xTickInterval": 0.2,
                "yTickInterval": 0.3
            },
            {
                "x": "z-2",
                "y": "y2-prime",
                "xLabel": "Bump Height $z_2$ [m]",
                "yLabel": "Downstream Depth $y_2$ [m]",
                "xMin": 0.01,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": 1.2,
                "xTickInterval": 0.1,
                "yTickInterval": 0.2
            }
        ],
        "text": "Left: Specific Energy curve showing $E_1$ as a function of upstream depth $y_1$ (independent of bump height). Right: Downstream subcritical flow depth $y_{2'}$ as a function of bump height $z_2$ (the physical solution corresponding to subcritical upstream flow)."
    }
};
