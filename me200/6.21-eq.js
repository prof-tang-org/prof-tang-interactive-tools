/** @type {PageData} */
const pageData = {
    "title": "Changes in Specific Entropy of Ideal Gases with Constant Specific Heats",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Ideal gases with constant specific heats"
            ]
        },
        {
            "type": "equations",
            "content": [
                "s_2 - s_1 = s(T_2, v_2) - s(T_1, v_1) = c_v \\ln\\frac{T_2}{T_1} + R \\ln\\frac{v_2}{v_1}",
                "s_2 - s_1 = s(T_2, p_2) - s(T_1, p_1) = c_p \\ln\\frac{T_2}{T_1} - R \\ln\\frac{p_2}{p_1}",
                "R = \\frac{\\bar R}{M}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$s$", "definition": "specific entropy" },
                { "symbol": "$T$", "definition": "thermodynamic temperature" },
                { "symbol": "$v$", "definition": "specific volume" },
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$R$", "definition": "gas constant" },
                { "symbol": "$\\bar R$", "definition": "universal gas constant" },
                { "symbol": "$M$", "definition": "molar mass" },
                { "symbol": "$c_v$", "definition": "constant-volume specific heat" },
                { "symbol": "$c_p$", "definition": "constant-pressure specific heat" },
                { "symbol": "subscript 1", "definition": "state 1" },
                { "symbol": "subscript 2", "definition": "state 2" }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "M",
                "text": "Molar mass, $M$ [kg/kmol]",
                "type": "calculation",
                "value": "gas == 'air' ? 28.97 : (gas == 'o2' ? 32.00 : (gas == 'n2' ? 28.01 : 44.01))"
            },
            {
                "id": "R",
                "text": "Gas constant, $R$ [J/(kg·K)]",
                "type": "calculation",
                "value": "8314 / M"
            },
            {
                "id": "cv",
                "text": "$c_v$ [kJ/(kg·K)]",
                "type": "calculation",
                "value": "gas == 'air' ? 0.718 : (gas == 'o2' ? 0.658 : (gas == 'n2' ? 0.743 : 0.657))"
            },
            {
                "id": "cp",
                "text": "$c_p$ [kJ/(kg·K)]",
                "type": "calculation",
                "value": "gas == 'air' ? 1.005 : (gas == 'o2' ? 0.918 : (gas == 'n2' ? 1.039 : 0.846))"
            }
        ],
        "inputColumns": 2,
        "inputs": [
            {
                "type": "dropdown",
                "id": "gas",
                "text": "Gas",
                "choices": [
                    { "text": "Air", "value": "air" },
                    { "text": "O₂", "value": "o2" },
                    { "text": "N₂", "value": "n2" },
                    { "text": "CO₂", "value": "co2" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "T1",
                "text": "Initial temperature, $T_1$ [K]",
                "min": 300,
                "max": 1000,
                "step": 1,
                "initialValue": 300
            },
            {
                "type": "slider",
                "id": "T2",
                "text": "Final temperature, $T_2$ [K]",
                "min": 300,
                "max": 1000,
                "step": 1,
                "initialValue": 500
            },
            {
                "type": "swap",
                "id": "spec",
                "text": "Specify states by",
                "carryOver": false,
                "options": [
                    {
                        "id": "v",
                        "choiceText": "Specific volume, v",
                        "variables": [
                            {
                                "id": "v1",
                                "text": "Initial specific volume, $v_1$ [m³/kg]",
                                "min": 0.1,
                                "max": 3,
                                "step": 0.01,
                                "initialValue": 0.8,
                                "formula": "R * T1 / (p1 * 1000)"
                            },
                            {
                                "id": "v2",
                                "text": "Final specific volume, $v_2$ [m³/kg]",
                                "min": 0.1,
                                "max": 3,
                                "step": 0.01,
                                "initialValue": 0.5,
                                "formula": "R * T2 / (p2 * 1000)"
                            }
                        ]
                    },
                    {
                        "id": "p",
                        "choiceText": "Pressure, p",
                        "variables": [
                            {
                                "id": "p1",
                                "text": "Initial pressure, $p_1$ [kPa]",
                                "min": 100,
                                "max": 1000,
                                "step": 1,
                                "initialValue": 100,
                                "formula": "R * T1 / (v1 * 1000)"
                            },
                            {
                                "id": "p2",
                                "text": "Final pressure, $p_2$ [kPa]",
                                "min": 100,
                                "max": 1000,
                                "step": 1,
                                "initialValue": 200,
                                "formula": "R * T2 / (v2 * 1000)"
                            }
                        ]
                    }
                ],
                "initialChoiceIndex": 0
            }
        ],
        "outputs": [
            {
                "id": "ds",
                "text": "$s_2 - s_1$ [kJ/(kg·K)]",
                "type": "calculation",
                "value": "spec == 'p' ? (cp * log(T2 / T1) - R / 1000 * log(p2 / p1)) : (cv * log(T2 / T1) + R / 1000 * log(v2 / v1))"
            }
        ],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 1.3,
        "settings": [
            [
                {
                    "mode": "standard",
                    "x": "T1",
                    "y": "ds",
                    "xLabel": "$T_1 \\text{ [K]}$",
                    "yLabel": "$s_2 - s_1 \\text{ [kJ/(kg·K)]}$",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": -2,
                    "yMax": 2,
                    "yTickInterval": 1,
                    "points": [[0, 0], [1000, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1,
                    "dashed": true
                },
                {
                    "showWhen": "spec == 'v'",
                    "mode": "standard",
                    "x": "v1",
                    "y": "ds",
                    "xLabel": "$v_1 \\text{ [m³/kg]}$",
                    "yLabel": "$s_2 - s_1 \\text{ [kJ/(kg·K)]}$",
                    "xMin": 0,
                    "xMax": 3,
                    "xTickInterval": 0.5,
                    "yMin": -2,
                    "yMax": 2,
                    "yTickInterval": 1,
                    "points": [[0, 0], [3, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1,
                    "dashed": true
                },
                {
                    "showWhen": "spec == 'p'",
                    "mode": "standard",
                    "x": "p1",
                    "y": "ds",
                    "xLabel": "$p_1 \\text{ [kPa]}$",
                    "yLabel": "$s_2 - s_1 \\text{ [kJ/(kg·K)]}$",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": -2,
                    "yMax": 2,
                    "yTickInterval": 1,
                    "points": [[0, 0], [1000, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1,
                    "dashed": true
                }
            ],
            [
                {
                    "mode": "standard",
                    "x": "T2",
                    "y": "ds",
                    "xLabel": "$T_2 \\text{ [K]}$",
                    "yLabel": "$s_2 - s_1 \\text{ [kJ/(kg·K)]}$",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": -2,
                    "yMax": 2,
                    "yTickInterval": 1,
                    "points": [[0, 0], [1000, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1,
                    "dashed": true
                },
                {
                    "showWhen": "spec == 'v'",
                    "mode": "standard",
                    "x": "v2",
                    "y": "ds",
                    "xLabel": "$v_2 \\text{ [m³/kg]}$",
                    "yLabel": "$s_2 - s_1 \\text{ [kJ/(kg·K)]}$",
                    "xMin": 0,
                    "xMax": 3,
                    "xTickInterval": 0.5,
                    "yMin": -2,
                    "yMax": 2,
                    "yTickInterval": 1,
                    "points": [[0, 0], [3, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1,
                    "dashed": true
                },
                {
                    "showWhen": "spec == 'p'",
                    "mode": "standard",
                    "x": "p2",
                    "y": "ds",
                    "xLabel": "$p_2 \\text{ [kPa]}$",
                    "yLabel": "$s_2 - s_1 \\text{ [kJ/(kg·K)]}$",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": -2,
                    "yMax": 2,
                    "yTickInterval": 1,
                    "points": [[0, 0], [1000, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1,
                    "dashed": true
                }
            ]
        ],
        "text": "Each curve varies a single input while holding the other inputs fixed at their current values. **Drag the marked point** on any plot or use the inputs above to change the current state."
    }
};
