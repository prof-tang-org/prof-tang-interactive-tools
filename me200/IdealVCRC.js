/** @type {PageData} */
const pageData = {
    "title": "Ideal Vapor-Compression Refrigeration Cycle",
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
                "Steady-state operation of an ideal vapor-compression refrigeration cycle"
            ]
        },
        {
            "type": "equations",
            "content": [
                "q_{\\text{in}} = \\frac{\\dot{Q}_{\\text{in}}}{\\dot{m}} = h_1 - h_4",
                "q_{\\text{out}} = \\frac{\\dot{Q}_{\\text{out}}}{\\dot{m}} = h_2 - h_3",
                "w_{\\text{in}} = \\frac{\\dot{W}_{\\text{in}}}{\\dot{m}} = h_2 - h_1",
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
                    "symbol": "$\\text{COP}_R$",
                    "definition": "refrigeration coefficient of performance"
                }
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
        // e.g. inputs['fluid'], inputs['T_evap'], and inputs['T_cond'].
        // Returned dictionary keys become renderer variables, including lists.
        // Only keys listed in outputs below get visible output cards; plot-only
        // lists such as ts_liquid and ts_cycle do not need output entries.
        "pythonScript": {
            "path": "../test/IdealVCRC-calc.py",
            // "path": "../test/refrigeration-cycle-calc-no-cache.py",
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
                        "text": "R134a (1,1,1,2-Tetrafluoroethane)",
                        "value": "R134a"
                    },
                    {
                        "text": "R1234yf (HFO Refrigerant)",
                        "value": "R1234yf"
                    }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "T_evap",
                "text": "Evaporator Temp, $T_1 = T_{\\text{evap}}$ [°C]",
                "min": -20,
                "max": 15,
                "initialValue": 10,
                "step": 0.5
            },
            {
                "type": "slider",
                "id": "T_cond",
                "text": "Condenser Temp, $T_3 = T_{\\text{cond}}$ [°C]",
                "min": 30,
                "max": 55,
                "initialValue": 45,
                "step": 0.5
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
                "decimals": 1
            },
            {
                "id": "P2_kPa",
                "text": "Condenser Pressure, $P_2$ [kPa]",
                "decimals": 1
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
        // This page has T-s and p-h side by side, then T-h on the next row.
        // Axis labels, bounds, ticks, and log scaling belong to the plot object.
        "settings": [
            [
                {
                    "x": "s",
                    "y": "T",
                    "xLabel": "$s \\text{ [kJ/(kg·K)]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": 0.8,
                    "xMax": 2.6,
                    "xTickInterval": 0.2,
                    "yMin": -40,
                    "yMax": 80,
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
                                ["s3", "T3"],
                                ["s4", "T4"],
                                ["s1", "T1"]
                            ],
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            // Entries follow Python's point order: 1, 2, a, 3, 4, 1.
                            // 'none' hides a marker while keeping connecting lines.
                            // pointSegmentColors can separately color each segment.
                            "pointColors": [
                                "#2563eb",
                                "#2563eb",
                                "none",
                                "#2563eb",
                                "#2563eb",
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
                    "xMax": 700,
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
                                "#2563eb",
                                "#2563eb",
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
                    "xMax": 700,
                    "xTickInterval": 100,
                    "yMin": -40,
                    "yMax": 80,
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
                                "#2563eb",
                                "#2563eb",
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
                        { "T_cond": 30, "text": "$T_{cond} = 30$ °C", "labelPosition": "below", "at": { "x": -10, "y": 8 } },
                        { "T_cond": 55, "text": "$T_{cond} = 55$ °C", "labelPosition": "above", "at": { "x": -10, "y": 1.8 } }
                    ]
                }
            ],
        ],
        "text": "All properties used in this simulation come from the CoolProp database."
    }
};
