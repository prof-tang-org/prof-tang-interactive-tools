/** @type {PageData} */
const pageData = {
    "title": "Isobaric Processes of Ideal Gases",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
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
                "type": "slider",
                "id": "V2",
                "text": "Final volume, $V_2$ [m³]",
                "min": 0.1,
                "max": 1,
                "step": 0.01,
                "initialValue": 0.6
            }
        ],
        "outputs": [
            {
                "id": "T2",
                "text": "Final temperature, $T_2$ [K]",
                "type": "calculation",
                "value": "T1 * V2 / V1"
            }
        ],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 2,
        "settings": [
            {
                "x": "V2",
                "y": "T2",
                "xLabel": "$V_2$ [m³]",
                "yLabel": "$T_2$ [K]",
                "xMin": 0,
                "xMax": 1,
                "xTickInterval": 0.1,
                "yMin": 0,
                "yMax": [2000, 10000],
                "yTickInterval": [250, 1000]
            }
        ],
        "text": "The line shows the final temperature $T_2$ vs the final volume $V_2$ for the current initial state. **Drag the marked point** or use the sliders above to change the final state."
    }
};
