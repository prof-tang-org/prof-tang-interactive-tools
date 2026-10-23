/** @type {PageData} */
const pageData = {
    "title": "Isobaric Processes of Ideal Gases",
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
                "Isobaric (constant-pressure) processes of ideal gases in a closed system"
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\frac{T}{V} = \\text{constant}",
                "\\frac{T_1}{V_1} = \\frac{T_2}{V_2}",
                "T_2 = T_1\\,\\frac{V_2}{V_1} \\qquad \\text{and} \\qquad V_2 = V_1\\,\\frac{T_2}{T_1}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "thermodynamic temperature" },
                { "symbol": "$V$", "definition": "volume" },
                { "symbol": "$T_1, V_1$", "definition": "initial temperature and volume" },
                { "symbol": "$T_2, V_2$", "definition": "final temperature and volume" }
            ]
        }
    ],
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "T1",
                "text": "Initial temperature, $T_1$ [K]",
                "min": 300,
                "max": 1000,
                "step": 10,
                "initialValue": 500
            },
            {
                "type": "slider",
                "id": "V1",
                "text": "Initial volume, $V_1$ [m³]",
                "min": 0.1,
                "max": 1,
                "step": 0.01,
                "initialValue": 0.4
            },
            {
                "type": "swap",
                "id": "spec",
                "text": "Specify the final state by",
                "options": [
                    {
                        "id": "V2",
                        "choiceText": "Final volume, V₂",
                        "text": "Final volume, $V_2$ [m³]",
                        "min": 0.1,
                        "max": 1,
                        "step": 0.01,
                        "initialValue": 0.6,
                        "formula": "V1 * T2 / T1"
                    },
                    {
                        "id": "T2",
                        "choiceText": "Final temperature, T₂",
                        "text": "Final temperature, $T_2$ [K]",
                        "min": 300,
                        "max": 1000,
                        "step": 1,
                        "initialValue": 750,
                        "formula": "T1 * V2 / V1"
                    }
                ],
                "initialChoiceIndex": 0
            }
        ],
        "outputs": [],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 2,
        "settings": [
            {
                "showWhen": "spec == 'V2'",
                "x": "V2",
                "y": "T2",
                "xLabel": "$V_2$ [m³]",
                "yLabel": "$T_2$ [K]",
                "xMin": 0,
                "xMax": 1,
                "xTickInterval": 0.1,
                "yMin": 0,
                "yMax": "T1 * 1 / V1 < 2000 ? 2000 : 10000",
                "yTickInterval": "T1 * 1 / V1 < 2000 ? 250 : 1000"
            },
            {
                "showWhen": "spec == 'T2'",
                "x": "T2",
                "y": "V2",
                "xLabel": "$T_2$ [K]",
                "yLabel": "$V_2$ [m³]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 100,
                "yMin": 0,
                "yMax": "V1 * 1000 / T1 < 0.5 ? 0.5 : 3.5",
                "yTickInterval": "V1 * 1000 / T1 < 0.5 ? 0.1 : 0.5"
            }
        ],
        "text": "The line shows the calculated final-state variable vs the specified one for the current initial state. **Drag the marked point** or use the sliders above to change the final state."
    }
};
