/** @type {PageData} */
const pageData = {
    "title": "Wave Speed",
    "layout": {
        "grid": [
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.6fr 1.5fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "1-D open channel flow"
            ]
        },
        {
            "type": "equations",
            "content": [
                "c = \\sqrt{gy}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$c$", "definition": "wave speed" },
                { "symbol": "$g$", "definition": "gravitational acceleration" },
                { "symbol": "$y$", "definition": "depth of open channel flow" }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational acceleration, $g$ [m/s²]",
                "value": 9.81
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "y",
                "text": "Depth of open channel flow, $y$ [m]",
                "min": 0.1,
                "max": 5,
                "initialValue": 2,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "text": "Wave speed, $c$ [m/s]",
                "id": "wave-speed",
                "type": "calculation",
                "value": "sqrt(g * y)"
            }
        ]
    },
    "plots": {
        "aspectRatio": 1.8,
        "settings": [
            {
                "x": "y",
                "y": "wave-speed",
                "xLabel": "$y \\text{ [m]}$",
                "yLabel": "$c \\text{ [m/s]}$",
                "xMin": 0,
                "xMax": 5,
                "yMin": 0,
                "yMax": 8,
                "xTickInterval": 1,
                "yTickInterval": 2
            }
        ],
        "text": "Adjust the depth of open channel flow ($y$) to see its impact on the wave speed ($c$)."
    }
};
