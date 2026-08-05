/** @type {PageData} */
const pageData = {
    "title": "Minor Head Loss",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
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
            "type": "equations",
            "content": [
                "h_{L,\\text{minor}} = K_L \\frac{v^2}{2g}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$h_{L,\\text{minor}}$", "definition": "minor head loss" },
                { "symbol": "$K_L$", "definition": "loss coefficient" },
                { "symbol": "$v$", "definition": "mean velocity" },
                { "symbol": "$g$", "definition": "gravitational acceleration" }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational Acceleration, $g$ [m/s²]",
                "value": 9.81
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "K_L",
                "text": "Loss Coefficient, $K_L$",
                "min": 0,
                "max": 1,
                "initialValue": 0.3,
                "step": 0.05
            },
            {
                "type": "slider",
                "id": "v",
                "text": "Mean Velocity, $v$ [m/s]",
                "min": 1,
                "max": 5,
                "initialValue": 2,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "id": "h_L_minor",
                "text": "Minor Head Loss, $h_{L,\\text{minor}}$ [m]",
                "type": "calculation",
                "value": "K_L * pow(v, 2) / (2 * g)"
            }
        ]
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            {
                "x": "K_L",
                "y": "h_L_minor",
                "xLabel": "$K_L$",
                "yLabel": "$h_{L,\\text{minor}} \\text{ [m]}$",
                "xMin": 0,
                "xMax": 1,
                "yMin": 0,
                "yMax": "(pow(v, 2) / (2 * g)) < 0.3 ? 0.3 : 1.4",
                "yTickInterval": "(pow(v, 2) / (2 * g)) < 0.3 ? 0.05 : 0.2"
            },
            {
                "x": "v",
                "y": "h_L_minor",
                "xLabel": "$v \\text{ [m/s]}$",
                "yLabel": "$h_{L,\\text{minor}} \\text{ [m]}$",
                "xMin": 0,
                "xMax": 5,
                "yMin": 0,
                "yMax": "(K_L * pow(5, 2) / (2 * g)) < 0.3 ? 0.3 : 1.4",
                "yTickInterval": "(K_L * pow(5, 2) / (2 * g)) < 0.3 ? 0.05 : 0.2"
            }
        ],
        "text": "Drag the point or change the inputs to analyze how the minor head loss ($h_{L,\\text{minor}}$) varies with loss coefficient $K_L$ and mean velocity $v$."
    }
};
