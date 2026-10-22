/** @type {PageData} */
const pageData = {
    "title": "Isothermal Processes of Ideal Gases",
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
                "Isothermal (constant-temperature) processes of ideal gases in a closed system"
            ]
        },
        {
            "type": "equations",
            "content": [
                "pV = \\text{constant}",
                "p_1 V_1 = p_2 V_2",
                "V_2 = V_1\\,\\frac{p_1}{p_2} \\qquad \\text{and} \\qquad p_2 = p_1\\,\\frac{V_1}{V_2}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$V$", "definition": "volume" },
                { "symbol": "$p_1, V_1$", "definition": "initial pressure and volume" },
                { "symbol": "$p_2, V_2$", "definition": "final pressure and volume" }
            ]
        }
    ],
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "p1",
                "text": "Initial pressure, $p_1$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 10,
                "initialValue": 300
            },
            {
                "type": "slider",
                "id": "V1",
                "text": "Initial volume, $V_1$ [m³]",
                "min": 0.1,
                "max": 1,
                "step": 0.01,
                "initialValue": 0.3
            },
            {
                "type": "slider",
                "id": "p2",
                "text": "Final pressure, $p_2$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 10,
                "initialValue": 450
            }
        ],
        "outputs": [
            {
                "id": "V2",
                "text": "Final volume, $V_2$ [m³]",
                "type": "calculation",
                "value": "V1 * p1 / p2"
            }
        ],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 2,
        "settings": [
            {
                "x": "p2",
                "y": "V2",
                "xLabel": "$p_2$ [kPa]",
                "yLabel": "$V_2$ [m³]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 100,
                "yMin": 0,
                "yMax": [1, 10],
                "yTickInterval": [0.2, 2]
            }
        ],
        "text": "The curve shows the final volume $V_2$ vs the final pressure $p_2$ for the current initial state. **Drag the marked point** or use the sliders above to change the final state."
    }
};
