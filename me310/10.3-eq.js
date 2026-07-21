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
            "type": "header",
            "text": "Wave speed"
        },
        {
            "type": "note",
            "text": "**Assumptions**: 1-D open channel flow"
        },
        {
            "type": "note",
            "text": "**Equation**"
        },
        {
            "type": "equation",
            "text": "c = \\sqrt{gy}"
        },
        {
            "type": "list",
            "header": "Variables",
            "content": [
                {
                    "text": "$c$ — wave speed [m/s]"
                },
                {
                    "text": "$g$ — gravitational acceleration [m/s²]"
                },
                {
                    "text": "$y$ — depth of open channel flow [m]"
                }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational acceleration ($g$)",
                "value": 9.81
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "y",
                "text": "Depth of open channel flow ($y$)",
                "min": 0.1,
                "max": 5,
                "initialValue": 2,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "text": "Wave speed ($c$)",
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
