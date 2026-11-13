/** @type {PageData} */
const pageData = {
    "title": "Air-Standard Otto Cycle",
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
                "Cold-air-standard analysis: air is an ideal gas with constant specific heats at room temperature",
                // "Air molecular weight is 28.97 kg/kmol, with $c_v = 0.718$ kJ/(kg·K) and $k = 1.4$",
                // "State 1 to 2 and state 3 to 4 are isentropic; state 2 to 3 and state 4 to 1 are isochoric",
                // "$T_1 = 300$ K and $p_1 = 100$ kPa are fixed"
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\gamma = \\frac{V_1}{V_2} = \\frac{v_1}{v_2} = \\frac{V_4}{V_3} = \\frac{v_4}{v_3}",
                "T_2 = T_1 \\gamma^{k-1}, \\qquad T_4 = \\frac{T_3}{\\gamma^{k-1}}",
                "p_2 = p_1 \\gamma^k, \\qquad p_3 = p_2\\frac{T_3}{T_2}, \\qquad p_4 = \\frac{p_3}{\\gamma^k}",
                "q_{\\text{in}} = \\frac{Q_{\\text{in}}}{m} = u_3 - u_2 = c_v(T_3 - T_2), \\qquad q_{\\text{out}} = \\frac{Q_{\\text{out}}}{m} = u_4 - u_1 = c_v(T_4 - T_1)",
                "w_{\\text{net}} = \\frac{W_{\\text{net}}}{m} = \\frac{Q_{\\text{in}} - Q_{\\text{out}}}{m} = q_{\\text{in}} - q_{\\text{out}}",
                "\\eta = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = \\frac{\\frac{W_{\\text{net}}}{m}}{\\frac{Q_{\\text{in}}}{m}} = \\frac{w_{\\text{net}}}{q_{\\text{in}}} = 1 - \\frac{1}{\\gamma^{k-1}}",
                "\\text{mep} = \\frac{W_{\\text{net}}}{V_1 - V_2} = \\frac{\\frac{W_{\\text{net}}}{m}}{\\frac{V_1 - V_2}{m}} = \\frac{w_{\\text{net}}}{v_1 - v_2}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\gamma$", "definition": "compression ratio" },
                { "symbol": "$V$", "definition": "volume" },
                { "symbol": "$v$", "definition": "specific volume" },
                { "symbol": "$T$", "definition": "temperature" },
                { "symbol": "$p$", "definition": "pressure" },
                { "symbol": "$u$", "definition": "specific internal energy" },
                { "symbol": "$c_v$", "definition": "constant-volume specific heat" },

                // { "symbol": "$s$", "definition": "specific entropy relative to state 1" },
                { "symbol": "$Q_{\\text{in}}$", "definition": "heat added" },
                { "symbol": "$q_{\\text{in}}$", "definition": "specific heat added" },
                { "symbol": "$Q_{\\text{out}}$", "definition": "heat rejected" },
                { "symbol": "$q_{\\text{out}}$", "definition": "specific heat rejected" },
                { "symbol": "$W_{\\text{net}}$", "definition": "net work output" },
                { "symbol": "$w_{\\text{net}}$", "definition": "specific net work output" },
                { "symbol": "$\\eta$", "definition": "thermal efficiency" },
                { "symbol": "$\\text{mep}$", "definition": "mean effective pressure" }, 

            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/InternalCombustionEngine.png",
        "alt": "Air-Standard Otto cycle diagram."
    },
    "inputOutput": {
        "javascriptScript": {
            "path": "../me200/OttoCycle-CASA-calc1.js",
            "function": "calculate_cycle"
        },
        "inputs": [
            {
                "text": "Working fluid: ideal-gas air"
            },
            {
                "text": "$T_1 = 300$ [K]"
            },
             {
                "text": "$p_1 = 100$ [kPa]"
            },
            {
                "text": "$c_v = 0.718$ [kJ/(kg·K)]"
            }, 
            {
                "text": "$k = 1.4$ [-]"
            },                      
            {
                "type": "slider",
                "id": "gama",
                "text": "Compression Ratio, $\\gamma = v_1/v_2$ [-]",
                "min": 5,
                "max": 20,
                "initialValue": 10,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "T_3",
                "text": "Maximum Temperature, $T_3$ [K]",
                "min": 1500,
                "max": 2500,
                "initialValue": 2000,
                "step": 10
            }
        ],
        "outputs": [
            {
                "id": "eta",
                "text": "Thermal Efficiency, $\\eta_{\\text{th}}$ [-]",
                "decimals": 3
            },
            {
                "id": "w_net",
                "text": "Specific Net Work Output, $w_{\\text{net}}$ [kJ/kg]",
                "decimals": 3
            },
            {
                "id": "mep",
                "text": "Mean Effective Pressure, $\\text{mep}$ [kPa]",
                "decimals": 3
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            [
                {
                    "x": "gama",
                    "y": "eta",
                    "mode": "override",
                    "xLabel": "$s - s_1 \\text{ [kJ/(kg·K)]}$",
                    "yLabel": "$T \\text{ [K]}$",
                    "xMin": -0.2,
                    "xMax": 1.2,
                    "xTickInterval": 0.2,
                    "yMin": 0,
                    "yMax": 3000,
                    "yTickInterval": 500,
                    "showPoint": true,
                    "series": [
                        {
                            "points": "ts_cycle",
                            "pointsColor": "#2563eb",
                            "showPoints": false,
                            "lineWidth": 2
                        },
                        {
                            "points": "ts_states",
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            "pointLabels": [
                                { "text": "$1$", "offset": [-15, 0] },
                                { "text": "$2$", "offset": [-15, 0] },
                                { "text": "$3$", "offset": [8, 0] },
                                { "text": "$4$", "offset": [8, 0] },
                            ],
                            "showLines": false
                        }
                    ]
                },
                {
                    "x": "gama",
                    "y": "eta",
                    "mode": "override",
                    "xLabel": "$v \\text{ [m}^3\\text{/kg]}$",
                    "yLabel": "$p \\text{ [kPa]}$",
                    "xMin": -0.2,
                    "xMax": 1,
                    "xTickInterval": 0.2,
                    "yMin": 10,
                    "yMax": 30000,
                    "yLog": true,
                    "showPoint": true,
                    "series": [
                        {
                            "points": "pv_cycle",
                            "pointsColor": "#2563eb",
                            "showPoints": false,
                            "lineWidth": 2
                        },
                        {
                            "points": "pv_states",
                            "pointsColor": "#2563eb",
                            "pointRadius": 4,
                            "pointLabels": [
                                { "text": "$1$", "offset": [8, 0] },
                                { "text": "$2$", "offset": [-15, 0] },
                                { "text": "$3$", "offset": [-15, 0] },
                                { "text": "$4$", "offset": [8, 0] },
                            ],
                            "showLines": false
                        }
                    ]
                }
            ],
            [
                // {
                //     "x": "gama",
                //     "y": "eta",
                //     "mode": "override",
                //     "xLabel": "$\\gamma \\text{ [-]}$",
                //     "yLabel": "$\\eta \\text{ [-]}$",
                //     "xMin": 5,
                //     "xMax": 20,
                //     "xTickInterval": 5,
                //     "yMin": 0,
                //     "yMax": 1,
                //     "yTickInterval": 0.2,
                //     "showPoint": false,
                //     "series": [
                //         {
                //             "points": "eta_vs_gama",
                //             "pointsColor": "#2563eb",
                //             "showPoints": false,
                //             "lineWidth": 2
                //         },
                //         {
                //             "points": [["gama", "eta"]],
                //             "pointsColor": "#2563eb",
                //             "pointRadius": 6.5,
                //             "showLines": false
                //         }
                //     ]
                // },
                {
                    "x": "gama",
                    "y": "eta",
                    "xLabel": "$\\gamma \\text{ [-]}$",
                    "yLabel": "$\\eta \\text{ [-]}$",
                    "xMin": 2,
                    "xMax": 22,
                    "xTickInterval": 2,
                    "yMin": 0,
                    "yMax": 1,
                    "yTickInterval": 0.2,
                },
                {
                    "x": "gama",
                    "y": "w_net",
                    "xLabel": "$\\gamma \\text{ [-]}$",
                    "yLabel": "$w_{\\text{net}} \\text{ [kJ/kg]}$",
                    "xMin": 2,
                    "xMax": 22,
                    "xTickInterval": 2,
                    "yMin": 0,
                    "yMax": 1000,
                    "yTickInterval": 200,
                    "activeLabel": {
                        "text": "$T_3 = {T_3}$ K",
                        "offset": { "x": 40, "y": 8 }
                    },
                    "reference": [
                        {
                            "T_3": 1500,
                            "text": "$T_3 = 1500$ K",
                            "labelPosition": "below",
                            "offset": { "x": -30, "y": -10 }
                        },
                        {
                            "T_3": 2500,
                            "text": "$T_3 = 2500$ K",
                            "labelPosition": "above",
                            "offset": { "x": -30, "y": 9 }
                        }
                    ],
                    "showPoint": true,                    
                }
            ],
            [
                {
                    "x": "gama",
                    "y": "mep",
                    "xLabel": "$\\gamma \\text{ [-]}$",
                    "yLabel": "$\\text{mep} \\text{ [kPa]}$",
                    "xMin": 2,
                    "xMax": 22,
                    "xTickInterval": 2,
                    "yMin": 0,
                    "yMax": 1200,
                    "yTickInterval": 200,
                    "activeLabel": {
                        "text": "$T_3 = {T_3}$ K",
                        "offset": { "x": 40, "y": 8 }
                    },
                    "reference": [
                        {
                            "T_3": 1500,
                            "text": "$T_3 = 1500$ K",
                            "labelPosition": "below",
                            "offset": { "x": -30, "y": -9 }
                        },
                        {
                            "T_3": 2500,
                            "text": "$T_3 = 2500$ K",
                            "labelPosition": "above",
                            "offset": { "x": -30, "y": 7 }
                        }
                    ],
                    "showPoint": true,
                },
                {}
            ]
        ],
        // "text": "For specific net work and mep plots, dashed green and orange curves show $T_3 = 1500$ K and $T_3 = 2500$ K, respectively; the solid blue curve follows the selected $T_3$."
    }
};
