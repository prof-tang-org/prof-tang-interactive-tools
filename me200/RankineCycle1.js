/** @type {PageData} */
const pageData = {
    "title": "Ideal Rankine Cycle",
    "layout": {
        "grid": [
            {
                "desktop": "1.1fr 0.9fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.75fr 1.25fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Steady-state Rankine cycle using water as the working fluid",
                "Saturated vapor exits the boiler and saturated liquid exits the condenser",
                "Negligible pressure drops in the boiler and condenser",
                "The turbine and pump operate isentropically"
            ]
        },
        {
            "type": "equations",
            "content": [
                "q_{\\text{in}} = \\frac{\\dot{Q}_{\\text{in}}}{\\dot{m}} = h_1 - h_4",
                "q_{\\text{out}} = \\frac{\\dot{Q}_{\\text{out}}}{\\dot{m}} = h_2 - h_3",
                "w_t = \\frac{\\dot{W}_{\\text{t}}}{\\dot{m}} = h_1 - h_2",
                "w_p = \\frac{\\dot{W}_{\\text{p}}}{\\dot{m}} = h_4 - h_3",
                "w_{\\text{net}} = \\frac{\\dot{W}_{\\text{net}}}{\\dot{m}} = \\frac{\\dot{W}_{\\text{t}}-\\dot{W}_{\\text{p}}}{\\dot{m}} = w_t - w_p",
                "\\eta = \\frac{w_{\\text{net}}}{q_{\\text{in}}}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$h$", "definition": "specific enthalpy" },
                // { "symbol": "$s$", "definition": "specific entropy" },
                { "symbol": "$\\dot{Q}_{\\text{in}}$", "definition": "boiler heat absorption" },
                { "symbol": "$q_{\\text{in}}$", "definition": "specific heat added in the boiler" },
                { "symbol": "$\\dot{Q}_{\\text{out}}$", "definition": "condenser heat rejection" },
                { "symbol": "$q_{\\text{out}}$", "definition": "specific heat rejected in the condenser" },
                { "symbol": "$\\dot{W}_{\\text{t}}$", "definition": "turbine work output" },
                { "symbol": "$w_t$", "definition": "specific turbine work output" },
                { "symbol": "$\\dot{W}_{\\text{p}}$", "definition": "pump work input" },
                { "symbol": "$w_p$", "definition": "specific pump work input" },
                { "symbol": "$\\dot{W}_{\\text{net}}$", "definition": "net work output" },
                { "symbol": "$w_{\\text{net}}$", "definition": "specific net work output" },
                { "symbol": "$\\eta$", "definition": "thermal efficiency" },
                // { "symbol": "$x_2$", "definition": "vapor quality at the turbine exit" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/3.1-eq.png",
        "alt": "Ideal vapor-compression refrigeration cycle diagram."
    },    
    "inputOutput": {
        "javascriptScript": {
            "path": "../me200/RankineCycle-calc1.js",
            "function": "calculate_cycle"
        },
        "inputs": [
            {
                "text": "Working Fluid: Water"
            },
            {
                "type": "slider",
                "id": "T_boil",
                "text": "Boiling Temperature, $T_{\\text{boil}}$ [°C]",
                "min": 200,
                "max": 350,
                "initialValue": 300,
                "step": 1
            },
            {
                "type": "slider",
                "id": "T_cond",
                "text": "Condensation Temperature, $T_{\\text{cond}}$ [°C]",
                "min": 40,
                "max": 100,
                "initialValue": 50,
                "step": 1
            }
        ],
        "outputs": [
            {
                "id": "q_in",
                "text": "Specific Heat Added, $q_{\\text{in}}$ [kJ/kg]",
                "decimals": 3
            },
            {
                "id": "q_out",
                "text": "Specific Heat Rejected, $q_{\\text{out}}$ [kJ/kg]",
                "decimals": 3
            },
            {
                "id": "w_t",
                "text": "Specific Turbine Work, $w_t$ [kJ/kg]",
                "decimals": 3
            },
            {
                "id": "w_p",
                "text": "Specific Pump Work, $w_p$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "w_net",
                "text": "Specific Net Work, $w_{\\text{net}}$ [kJ/kg]",
                "decimals": 3
            },
            {
                "id": "eta",
                "text": "Thermal Efficiency, $\\eta$ [-]",
                "decimals": 2
            },
            {
                "id": "p_1",
                "text": "Boiler Pressure, $p_1$ [kPa]",
                "decimals": 3
            },
            {
                "id": "p_2",
                "text": "Condenser Pressure, $p_2$ [kPa]",
                "decimals": 3
            },
            // {
            //     "id": "p_ratio",
            //     "text": "Pressure Ratio, $p_1/p_2$ [-]",
            //     "decimals": 3
            // },
            {
                "id": "x_2",
                "text": "Turbine Exit Quality, $x_2$ [-]",
                "decimals": 2
            }
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            [
                {
                    "x": "s1",
                    "y": "T1",
                    "xLabel": "$s \\text{ [kJ/(kg·K)]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": -1,
                    "xMax": 9,
                    "xTickInterval": 1,
                    "yMin": 0,
                    "yMax": 400,
                    "yTickInterval": 50,
                    "series": [
                        {
                            "points": "ts_liquid",
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            "showPoints": false,
                            "lineWidth": 1.5
                        },
                        {
                            "points": "ts_vapor",
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            "showPoints": false,
                            "lineWidth": 1.5
                        },
                        {
                            "points": "ts_cycle",
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            "pointColors": ["#2563eb", "#2563eb", "#2563eb", "#2563eb", "none", "#2563eb"],
                            "pointLabels": [
                                { "text": "$1$", "offset": [8, 0] },
                                { "text": "$2$", "offset": [8, 0] },
                                { "text": "$3$", "offset": [5, 8] },
                                { "text": "$4$", "offset": [-15, -5] },
                                "",
                                ""
                            ]
                        }
                    ]
                },
                {
                    "x": "h1",
                    "y": "p_1",
                    "xLabel": "$h \\text{ [kJ/kg]}$",
                    "yLabel": "$p \\text{ [kPa]}$",
                    "xMin": -1000,
                    "xMax": 4000,
                    "xTickInterval": 1000,
                    "yMin": 1,
                    "yMax": 50000,
                    "yLog": true,
                    "series": [
                        {
                            "points": "ph_liquid",
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            "showPoints": false,
                            "lineWidth": 1.5
                        },
                        {
                            "points": "ph_vapor",
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            "showPoints": false,
                            "lineWidth": 1.5
                        },
                        {
                            "points": "ph_cycle",
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            "pointColors": ["#2563eb", "#2563eb", "#2563eb", "#2563eb", "none", "#2563eb"],
                            "pointLabels": [
                                { "text": "$1$", "offset": [8, 0] },
                                { "text": "$2$", "offset": [8, 0] },
                                { "text": "$3$", "offset": [-15, 0] },
                                { "text": "$4$", "offset": [-15, 0] },
                                "",
                                ""
                            ]
                        }
                    ]
                }
            ],
            [
                {
                    "x": "h1",
                    "y": "T1",
                    "xLabel": "$h \\text{ [kJ/kg]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": -1000,
                    "xMax": 4000,
                    "xTickInterval": 1000,
                    "yMin": 0,
                    "yMax": 400,
                    "yTickInterval": 50,
                    "series": [
                        {
                            "points": "th_liquid",
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            "showPoints": false,
                            "lineWidth": 1.5
                        },
                        {
                            "points": "th_vapor",
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            "showPoints": false,
                            "lineWidth": 1.5
                        },
                        {
                            "points": "th_cycle",
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            "pointColors": ["#2563eb", "#2563eb", "#2563eb", "#2563eb", "none", "#2563eb"],
                            "pointLabels": [
                                { "text": "$1$", "offset": [8, 0] },
                                { "text": "$2$", "offset": [8, 0] },
                                { "text": "$3$", "offset": [5, 8] },
                                { "text": "$4$", "offset": [-15, -5] },
                                "",
                                ""
                            ]
                        }
                    ]
                },
                {
                    "x": "T_boil",
                    "y": "eta",
                    "xLabel": "$T_{\\text{boil}} \\text{ [°C]}$",
                    "yLabel": "$\\eta \\text{ [-]}$",
                    "xMin": 200,
                    "xMax": 350,
                    "xTickInterval": 25,
                    "yMin": 0,
                    "yMax": 0.5,
                    "yTickInterval": 0.1,
                    "activeLabel": {
                        "text": "$T_{\\text{cond}} = {T_cond}$ °C",
                        "offset": { "x": 40, "y": 3 }
                    },
                    "reference": [
                        {
                            "T_cond": 40,
                            "text": "$T_{\\text{cond}} = 40$ °C",
                            "labelPosition": "above",
                            "offset": { "x": -30, "y": 10 }
                        },
                        {
                            "T_cond": 100,
                            "text": "$T_{\\text{cond}} = 100$ °C",
                            "labelPosition": "below",
                            "offset": { "x": -30, "y": 0 }
                        }
                    ]
                }
            ]
        ],
        "text": "Water properties are calculated using CoolProp."
    }
};
