/** @type {PageData} */
const pageData = {
    "title": "Vapor Power Cycle with Superheat and Reheat",
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
                "Steady-state vapor power cycle using water as the working fluid",
                "Saturated liquid exits the condenser",
                "Negligible pressure drops in the steam generator, superheater, reheater, and condenser",
                "The two turbine stages have the same isentropic efficiency"
            ]
        },
        {
            "type": "equations",
            "content": [
                "q_{\\text{in}} = \\frac{\\dot{Q}_{\\text{in}}}{\\dot{m}} = (h_1 - h_6) + (h_3 - h_2)",
                "q_{\\text{out}} = \\frac{\\dot{Q}_{\\text{out}}}{\\dot{m}} = h_4 - h_5",
                "w_t = \\frac{\\dot{W}_{\\text{t}}}{\\dot{m}} = (h_1 - h_2) + (h_3 - h_4)",
                "w_p = \\frac{\\dot{W}_{\\text{p}}}{\\dot{m}} = h_6 - h_5",
                "w_{\\text{net}} = \\frac{\\dot{W}_{\\text{net}}}{\\dot{m}} = \\frac{\\dot{W}_{\\text{t}}-\\dot{W}_{\\text{p}}}{\\dot{m}} = w_t - w_p",
                "\\eta_t = \\frac{h_1-h_2}{h_1-h_{2s}} = \\frac{h_3-h_4}{h_3-h_{4s}}",
                "\\eta_p = \\frac{h_{6s}-h_5}{h_6-h_5}",
                "\\eta = \\frac{w_{\\text{net}}}{q_{\\text{in}}}",
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$h$", "definition": "specific enthalpy" },
                { "symbol": "$h_{2s}, h_{4s}, h_{6s}$", "definition": "specific enthalpy at the corresponding isentropic state" },
                { "symbol": "$\\dot{Q}_{\\text{in}}$", "definition": "heat added in the steam generator and reheater" },
                { "symbol": "$q_{\\text{in}}$", "definition": "specific heat added in the steam generator and reheater" },
                { "symbol": "$\\dot{Q}_{\\text{out}}$", "definition": "condenser heat rejection" },
                { "symbol": "$q_{\\text{out}}$", "definition": "specific heat rejected in the condenser" },
                { "symbol": "$\\dot{W}_{\\text{t}}$", "definition": "turbine work output" },
                { "symbol": "$w_t$", "definition": "specific turbine work output" },
                { "symbol": "$\\dot{W}_{\\text{p}}$", "definition": "pump work input" },
                { "symbol": "$w_p$", "definition": "specific pump work input" },
                { "symbol": "$\\dot{W}_{\\text{net}}$", "definition": "net work output" },
                { "symbol": "$w_{\\text{net}}$", "definition": "specific net work output" },
                { "symbol": "$\\eta_t$", "definition": "turbine isentropic efficiency" },
                { "symbol": "$\\eta_p$", "definition": "pump isentropic efficiency" },
                { "symbol": "$\\eta$", "definition": "thermal efficiency" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/3.1-eq.png",
        "alt": "Vapor power cycle with superheat and reheat."
    },
    "inputOutput": {
        "pythonScript": {
            "path": "../test/VPC-SH-RH-calc.py",
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
            },
            {
                "type": "slider",
                "id": "T1",
                "text": "State 1 Temperature, $T_1$ [°C]",
                "min": 400,
                "max": 500,
                "initialValue": 450,
                "step": 1
            },
            {
                "type": "slider",
                "id": "T3",
                "text": "State 3 Temperature, $T_3$ [°C]",
                "min": 400,
                "max": 500,
                "initialValue": 420,
                "step": 1
            },
            {
                "type": "slider",
                "id": "p_reheat",
                "text": "Reheat Pressure, $p_{\\text{reheat}}$ [kPa]",
                "min": 120,
                "max": 1500,
                "initialValue": 800,
                "step": 10
            },
            {
                "type": "slider",
                "id": "eta_t",
                "text": "Turbine Isentropic Efficiency, $\\eta_t$ [-]",
                "min": 0.6,
                "max": 1,
                "initialValue": 0.85,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "eta_p",
                "text": "Pump Isentropic Efficiency, $\\eta_p$ [-]",
                "min": 0.6,
                "max": 1,
                "initialValue": 0.8,
                "step": 0.01
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
                "decimals": 3
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
                "id": "p_reheat",
                "text": "Reheat Pressure, $p_{\\text{reheat}}$ [kPa]",
                "decimals": 3
            },
            {
                "id": "p_5",
                "text": "Condenser Pressure, $p_5$ [kPa]",
                "decimals": 3
            },
            // {
            //     "id": "p_ratio",
            //     "text": "Boiler-to-Condenser Pressure Ratio, $p_1/p_5$ [-]",
            //     "decimals": 2
            // },
            {
                "id": "T_2",
                "text": "State 2 Temperature, $T_2$ [°C]",
                "decimals": 2
            },
            {
                "id": "T_4",
                "text": "State 4 Temperature, $T_4$ [°C]",
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
                    "xMax": 11,
                    "xTickInterval": 1,
                    "yMin": 0,
                    "yMax": 500,
                    "yTickInterval": 100,
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
                            "pointColors": [
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none",
                                "none"
                            ],
                            "pointLabels": [
                                { "text": "$1$", "offset": [-15, 0] },
                                { "text": "$2$", "offset": [-15, 0] },
                                "",
                                { "text": "$3$", "offset": [8, 0] },
                                { "text": "$4$", "offset": [8, 0] },
                                "",
                                { "text": "$5$", "offset": [5, 8] },
                                { "text": "$6$", "offset": [-15, -5] },
                                "",
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
                            "pointColors": [
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none",
                                "none"
                            ],
                            "pointLabels": [
                                { "text": "$1$", "offset": [8, 0] },
                                { "text": "$2$", "offset": [-15, 0] },
                                "",
                                { "text": "$3$", "offset": [8, 0] },
                                { "text": "$4$", "offset": [8, 0] },
                                "",
                                { "text": "$5$", "offset": [-15, 0] },
                                { "text": "$6$", "offset": [-15, 0] },
                                "",
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
                    "yMax": 500,
                    "yTickInterval": 100,
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
                            "pointColors": [
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none",
                                "none"
                            ],
                            "pointLabels": [
                                { "text": "$1$", "offset": [-15, 0] },
                                { "text": "$2$", "offset": [-15, 0] },
                                "",
                                { "text": "$3$", "offset": [8, 0] },
                                { "text": "$4$", "offset": [8, 0] },
                                "",
                                { "text": "$5$", "offset": [5, 8] },
                                { "text": "$6$", "offset": [-15, -5] },
                                "",
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
