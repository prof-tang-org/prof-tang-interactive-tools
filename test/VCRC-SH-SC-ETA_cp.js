/** @type {PageData} */
const pageData = {
    "title": "Vapor-Compression Refrigeration Cycle with Superheat, Subcooling, and Compressor Efficiency",
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
                "Steady-state vapor-compression refrigeration cycle with evaporator superheat, condenser subcooling, and non-isentropic compression",
                "Negligible pressure drops in the evaporator and condenser"
            ]
        },
        {
            "type": "equations",
            "content": [
                "q_{\\text{in}} = \\frac{\\dot{Q}_{\\text{in}}}{\\dot{m}} = h_1 - h_4",
                "q_{\\text{out}} = \\frac{\\dot{Q}_{\\text{out}}}{\\dot{m}} = h_2 - h_3",
                "w_{\\text{in}} = \\frac{\\dot{W}_{\\text{in}}}{\\dot{m}} = h_2 - h_1",
                "\\eta_{cp} = \\frac{h_{2s} - h_1}{h_2 - h_1}",
                "\\text{COP}_R = \\frac{\\dot{Q}_{\\text{in}}}{\\dot{W}_{\\text{in}}} = \\frac{\\dot{Q}_{\\text{in}}/\\dot{m}}{\\dot{W}_{\\text{in}}/\\dot{m}} = \\frac{h_1 - h_4}{h_2 - h_1}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                {
                    "symbol": "$h$",
                    "definition": "specific enthalpy"
                },
                {
                    "symbol": "$h_{2s}$",
                    "definition": "compressor exit enthalpy for isentropic compression"
                },
                {
                    "symbol": "$\\dot{m}$",
                    "definition": "mass flow rate"
                },
                {
                    "symbol": "$\\dot{Q}_{\\text{in}}$",
                    "definition": "refrigeration cooling capacity"
                },
                {
                    "symbol": "$q_{\\text{in}}$",
                    "definition": "specific refrigeration cooling capacity"
                },
                {
                    "symbol": "$\\dot{Q}_{\\text{out}}$",
                    "definition": "condenser heat rejection"
                },
                {
                    "symbol": "$q_{\\text{out}}$",
                    "definition": "specific condenser heat rejection"
                },
                {
                    "symbol": "$\\dot{W}_{\\text{in}}$",
                    "definition": "compressor work input"
                },
                {
                    "symbol": "$w_{\\text{in}}$",
                    "definition": "specific compressor work input"
                },
                {
                    "symbol": "$\\eta_{cp}$",
                    "definition": "compressor isentropic efficiency"
                },
                {
                    "symbol": "$\\text{COP}_R$",
                    "definition": "refrigeration coefficient of performance"
                },
                // {
                //     "symbol": "$SH$",
                //     "definition": "evaporator-exit superheat"
                // },
                // {
                //     "symbol": "$SC$",
                //     "definition": "condenser-exit subcooling"
                // },
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/3.1-eq.png",
        "alt": "Ideal vapor-compression refrigeration cycle diagram."
    },
    "inputOutput": {
        // Load this Python file through Pyodide and call calculate_cycle(inputs)
        // when inputs change. The dictionary includes values keyed by input IDs,
        // e.g. inputs['fluid'], inputs['T_evap'], inputs['T_cond'], inputs['SH'],
        // inputs['SC'], and inputs['eta_cp'].
        // Returned dictionary keys become renderer variables, including lists.
        // Only keys listed in outputs below get visible output cards; plot-only
        // lists such as ts_liquid and ts_cycle do not need output entries.
        "pythonScript": {
            "path": "../test/VCRC-SH-SC-ETA_cp-calc.py",
            "function": "calculate_cycle"
        },
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Refrigerant",
                "choices": [
                    {
                        "text": "R290 (Propane)",
                        "value": "Propane"
                    },
                    {
                        "text": "R134a",
                        "value": "R134a"
                    },
                    {
                        "text": "R1234yf",
                        "value": "R1234yf"
                    },
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "T_evap",
                "text": "Evaporator Saturation Temp, $T_{\\text{evap}}$ [°C]",
                "min": -20,
                "max": 15,
                "initialValue": 10,
                "step": 0.5
            },
            {
                "type": "slider",
                "id": "T_cond",
                "text": "Condenser Saturation Temp, $T_{\\text{cond}}$ [°C]",
                "min": 30,
                "max": 55,
                "initialValue": 45,
                "step": 0.5
            },
            {
                "type": "slider",
                "id": "SH",
                "text": "Evaporator-Exit Superheat, $SH$ [°C]",
                "min": 0,
                "max": 10,
                "initialValue": 7,
                "step": 0.5
            },
            {
                "type": "slider",
                "id": "SC",
                "text": "Condenser-Exit Subcooling, $SC$ [°C]",
                "min": 0,
                "max": 10,
                "initialValue": 5,
                "step": 0.5
            },
            {
                "type": "slider",
                "id": "eta_cp",
                "text": "Compressor Isentropic Efficiency, $\\eta_{cp}$ [-]",
                "min": 0.6,
                "max": 1,
                "initialValue": 0.7,
                "step": 0.01
            }
        ],
        "outputs": [
            {
                "id": "q_in",
                "text": "Specific Refrigeration Cooling Capacity, $q_{\\text{in}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "q_out",
                "text": "Specific Condenser Heat Rejection, $q_{\\text{out}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "w_in",
                "text": "Specific Compressor Work, $w_{\\text{in}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "cop",
                "text": "Ref. Coefficient of Performance, $\\text{COP}_R$ [-]",
                "decimals": 2
            },
            {
                "id": "P1_kPa",
                "text": "Evaporator Pressure, $P_1$ [kPa]",
                "decimals": 2
            },
            {
                "id": "P2_kPa",
                "text": "Condenser Pressure, $P_2$ [kPa]",
                "decimals": 3
            },
            {
                "id": "p_ratio",
                "text": "Pressure Ratio, $P_2 / P_1$ [-]",
                "decimals": 2
            },
            // {
            //     "id": "T2",
            //     "text": "Compressor Exit Temp, $T_2$ [°C]",
            //     "decimals": 1
            // },
            {
                "id": "x4",
                "text": "Evaporator Inlet Quality, $x_4$ [-]",
                "decimals": 3
            }
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.5,
        // Each inner array is a row; each object in that row is a separate plot.
        // This page has T-s and p-h side by side, followed by T-h and COP plots.
        // Axis labels, bounds, ticks, and log scaling belong to the plot object.
        "settings": [
            [
                {
                    "x": "s",
                    "y": "T",
                    "xLabel": "$s \\text{ [kJ/(kg·K)]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": 0.5,
                    "xMax": 3,
                    "xTickInterval": 0.5,
                    "yMin": -40,
                    "yMax": 100,
                    "yTickInterval": 20,
                    // "aspectRatio": 2.2,
                    // Series are layers on these SAME axes, drawn in array order:
                    // liquid curve, vapor curve, then cycle on top of both.
                    // With series, coordinates come from points rather than an
                    // input sweep; x/y above identify the axes, not list lookups.
                    "series": [
                        {
                            // Resolve the Python return key 'ts_liquid' to a list
                            // of [x, y] pairs, e.g. [[s0, T0], [s1, T1], ...].
                            // A literal list of pairs is also accepted here.
                            "points": "ts_liquid",
                            // Uniform color for lines, markers, and labels unless
                            // overridden by per-point/segment/label colors.
                            "pointsColor": "#16a34a",
                            "dashed": true,
                            // Connect the coordinates without drawing markers.
                            // showLines: false instead makes a scatter layer.
                            "showPoints": false,
                            // Line width and marker radius are specified in pixels.
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
                            // Literal coordinate list: strings resolve to Python
                            // output variables, so these points still update with
                            // the inputs. Numbers can also be used, e.g. [1.7, 10].
                            // Equivalent to points: "ts_cycle" returned by Python.
                            "points": [
                                ["s1", "T1"],
                                ["s2", "T2"],
                                ["sa", "Ta"],
                                ["sb", "Tb"],
                                ["s3", "T3"],
                                ["s4", "T4"],
                                ["sc", "Tc"],
                                ["s1", "T1"]
                            ],
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            // Entries follow Python's point order: 1, 2, a, b, 3, 4, 1.
                            // 'none' hides a marker while keeping connecting lines.
                            // pointSegmentColors can separately color each segment.
                            "pointColors": [
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none"
                            ],
                            // Labels use the same point order; '' omits a label.
                            // offset: [dx, dy] moves the label in screen pixels:
                            // positive dx is right, positive dy is down.
                            // Optional anchor (left/center/right) and align
                            // (top/middle/bottom) control alignment at that offset.
                            "pointLabels": [
                                {
                                    "text": "$1$",
                                    "offset": [
                                        8,
                                        0
                                    ]
                                },
                                {
                                    "text": "$2$",
                                    "offset": [
                                        8,
                                        0
                                    ]
                                },
                                "",
                                "",
                                {
                                    "text": "$3$",
                                    "offset": [
                                        -15,
                                        0
                                    ]
                                },
                                {
                                    "text": "$4$",
                                    "offset": [
                                        -15,
                                        0
                                    ]
                                },
                                "",
                                ""
                            ]
                        }
                    ]
                },
                {
                    "x": "h",
                    "y": "P",
                    "xLabel": "$h \\text{ [kJ/kg]}$",
                    "yLabel": "$p \\text{ [kPa]}$",
                    "xMin": 100,
                    "xMax": 800,
                    "xTickInterval": 100,
                    "yMin": 100,
                    "yMax": 3000,
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
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none"
                            ],
                            "pointLabels": [
                                {
                                    "text": "$1$",
                                    "offset": [
                                        8,
                                        0
                                    ]
                                },
                                {
                                    "text": "$2$",
                                    "offset": [
                                        8,
                                        0
                                    ]
                                },
                                "",
                                "",
                                {
                                    "text": "$3$",
                                    "offset": [
                                        -15,
                                        0
                                    ]
                                },
                                {
                                    "text": "$4$",
                                    "offset": [
                                        -15,
                                        0
                                    ]
                                },
                                "",
                                ""
                            ]
                        }
                    ]
                }
            ],
            [
                {
                    "x": "h",
                    "y": "T",
                    "xLabel": "$h \\text{ [kJ/kg]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": 100,
                    "xMax": 800,
                    "xTickInterval": 100,
                    "yMin": -40,
                    "yMax": 100,
                    "yTickInterval": 20,
                    // "aspectRatio": 2.2,
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
                                "none",
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "none"
                            ],
                            "pointLabels": [
                                {
                                    "text": "$1$",
                                    "offset": [
                                        8,
                                        0
                                    ]
                                },
                                {
                                    "text": "$2$",
                                    "offset": [
                                        8,
                                        0
                                    ]
                                },
                                "",
                                "",
                                {
                                    "text": "$3$",
                                    "offset": [
                                        -15,
                                        0
                                    ]
                                },
                                {
                                    "text": "$4$",
                                    "offset": [
                                        -15,
                                        0
                                    ]
                                },
                                "",
                                ""
                            ]
                        }
                    ]
                },
                {
                    "x": "T_evap",
                    "y": "cop",
                    "xLabel": "$T_{evap} \\text{ [°C]}$",
                    "yLabel": "$COP_R \\text{ [-]}$",
                    "xMin": -25,
                    "xMax": 20,
                    "xTickInterval": 5,
                    "yMin": 0,
                    "yMax": 20,
                    "yTickInterval": 5,
                    "activeLabel":
                        {"text": "$T_{cond} = {T_cond}$ °C",
                        "offset": { "x": 40, "y": -5 },
                        },
                    "reference": [
                        { "T_cond": 30, "text": "$T_{cond} = 30$ °C", "labelPosition": "above", "offset": { "x": -50, "y": 18 } },
                        { "T_cond": 55, "text": "$T_{cond} = 55$ °C", "labelPosition": "below", "offset": { "x": -50, "y": 0 } }
                    ]
                }
            ],
        ],
        "text": "All properties used in this simulation come from the CoolProp database."
    }
};
