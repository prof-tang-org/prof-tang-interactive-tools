/** @type {PageData} */
const pageData = {
    "title": "Isochoric Processes of Ideal Gases",
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
                "Isochoric (constant-volume) processes of ideal gases in a closed system"
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\frac{T}{p} = \\text{constant}",
                "\\frac{T_1}{p_1} = \\frac{T_2}{p_2}",
                "T_2 = T_1\\,\\frac{p_2}{p_1} \\qquad \\text{and} \\qquad p_2 = p_1\\,\\frac{T_2}{T_1}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "thermodynamic temperature" },
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$T_1, p_1$", "definition": "initial temperature and pressure" },
                { "symbol": "$T_2, p_2$", "definition": "final temperature and pressure" }
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
                "id": "p1",
                "text": "Initial pressure, $p_1$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 10,
                "initialValue": 400
            },
            {
                "type": "slider",
                "id": "p2",
                "text": "Final pressure, $p_2$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 10,
                "initialValue": 600
            }
        ],
        "outputs": [
            {
                "id": "T2",
                "text": "Final temperature, $T_2$ [K]",
                "type": "calculation",
                "value": "T1 * p2 / p1"
            }
        ],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 2,
        "settings": [
            {
                "x": "p2",
                "y": "T2",
                "xLabel": "$p_2$ [kPa]",
                "yLabel": "$T_2$ [K]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 100,
                "yMin": 0,
                "yMax": [2000, 10000],
                "yTickInterval": [250, 1000]
            }
        ],
        "text": "The line shows the final temperature $T_2$ vs the final pressure $p_2$ for the current initial state. **Drag the marked point** or use the sliders above to change the final state."
    }
};
