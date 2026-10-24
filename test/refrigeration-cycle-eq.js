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
                "desktop": "0.8fr 1.2fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Steady-state operation of an ideal vapor-compression refrigeration cycle",
                "Isentropic compression in the compressor (1 → 2)",
                "Constant pressure heat rejection in condenser and heat addition in evaporator",
                "Isenthalpic throttling expansion across the expansion valve (3 → 4)",
                "Saturated vapor exits the evaporator (state 1) and saturated liquid exits the condenser (state 3)"
            ]
        },
        {
            "type": "equations",
            "content": [
                "q_{\\text{in}} = h_1 - h_4",
                "w_{\\text{in}} = h_2 - h_1",
                "q_{\\text{out}} = h_2 - h_3",
                "\\text{COP}_R = \\frac{q_{\\text{in}}}{w_{\\text{in}}} = \\frac{h_1 - h_4}{h_2 - h_1}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                {
                    "symbol": "$T$",
                    "definition": "temperature"
                },
                {
                    "symbol": "$P$",
                    "definition": "pressure"
                },
                {
                    "symbol": "$h$",
                    "definition": "specific enthalpy"
                },
                {
                    "symbol": "$s$",
                    "definition": "specific entropy"
                },
                {
                    "symbol": "$q_{\\text{in}}$",
                    "definition": "refrigeration cooling capacity"
                },
                {
                    "symbol": "$w_{\\text{in}}$",
                    "definition": "compressor work input"
                },
                {
                    "symbol": "$q_{\\text{out}}$",
                    "definition": "condenser heat rejection"
                },
                {
                    "symbol": "$\\text{COP}_R$",
                    "definition": "coefficient of performance"
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
            "path": "../test/refrigeration-cycle-calc.py",
            "function": "calculate_cycle"
        },
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Refrigerant",
                "choices": [
                    {
                        "text": "R134a (1,1,1,2-Tetrafluoroethane)",
                        "value": "R134a"
                    },
                    {
                        "text": "R1234yf (HFO Refrigerant)",
                        "value": "R1234yf"
                    },
                    {
                        "text": "Propane (R290)",
                        "value": "Propane"
                    },
                    {
                        "text": "Ammonia (R717)",
                        "value": "Ammonia"
                    },
                    {
                        "text": "Carbon Dioxide (R744)",
                        "value": "CO2"
                    }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "T_evap",
                "text": "Evaporator Temp, $T_1 = T_{\\text{evap}}$ [°C]",
                "min": -25,
                "max": 20,
                "initialValue": 10,
                "step": 1
            },
            {
                "type": "slider",
                "id": "T_cond",
                "text": "Condenser Temp, $T_3 = T_{\\text{cond}}$ [°C]",
                "min": 25,
                "max": 65,
                "initialValue": 40,
                "step": 1
            }
        ],
        "outputs": [
            {
                "id": "cop",
                "text": "COP, $\\text{COP}_R$ [-]",
                "decimals": 2
            },
            {
                "id": "q_in",
                "text": "Cooling Capacity, $q_{\\text{in}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "w_in",
                "text": "Compressor Work, $w_{\\text{in}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "p_ratio",
                "text": "Pressure Ratio, $P_2 / P_1$ [-]",
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
                "id": "T2",
                "text": "Compressor Exit Temp, $T_2$ [°C]",
                "decimals": 1
            },
            {
                "id": "x4",
                "text": "Evaporator Inlet Quality, $x_4$ [-]",
                "decimals": 3
            }
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.45,
        // Each inner array is a row; each object in that row is a separate plot.
        // This page has T-s and p-h side by side, then T-h on the next row.
        // Axis labels, bounds, ticks, and log scaling belong to the plot object.
        "settings": [
            [
                {
                    "x": "s",
                    "y": "T",
                    "xLabel": "$s \\text{ [kJ/(kg?K)]}$",
                    "yLabel": "$T \\text{ [?C]}$",
                    "xMin": 0.8,
                    "xMax": 2,
                    "xTickInterval": 0.2,
                    "yMin": -10,
                    "yMax": 70,
                    "yTickInterval": 20,
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
                                        6
                                    ]
                                },
                                {
                                    "text": "$2$",
                                    "offset": [
                                        8,
                                        6
                                    ]
                                },
                                "",
                                {
                                    "text": "$3$",
                                    "offset": [
                                        -24,
                                        6
                                    ]
                                },
                                {
                                    "text": "$4$",
                                    "offset": [
                                        -24,
                                        6
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
                    "xMin": 150,
                    "xMax": 500,
                    "xTickInterval": 50,
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
                                        6
                                    ]
                                },
                                {
                                    "text": "$2$",
                                    "offset": [
                                        8,
                                        6
                                    ]
                                },
                                "",
                                {
                                    "text": "$3$",
                                    "offset": [
                                        -24,
                                        6
                                    ]
                                },
                                {
                                    "text": "$4$",
                                    "offset": [
                                        -24,
                                        6
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
                    "yLabel": "$T \\text{ [?C]}$",
                    "xMin": 150,
                    "xMax": 500,
                    "xTickInterval": 50,
                    "yMin": -10,
                    "yMax": 70,
                    "yTickInterval": 20,
                    "aspectRatio": 2.2,
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
                                        6
                                    ]
                                },
                                {
                                    "text": "$2$",
                                    "offset": [
                                        8,
                                        6
                                    ]
                                },
                                "",
                                {
                                    "text": "$3$",
                                    "offset": [
                                        -24,
                                        6
                                    ]
                                },
                                {
                                    "text": "$4$",
                                    "offset": [
                                        -24,
                                        6
                                    ]
                                },
                                ""
                            ]
                        }
                    ]
                },
                {}
            ],
        ],
        "text": "Saturation curves and cycle states calculated in Python; each diagram composes styled series on shared axes."
    }
};
