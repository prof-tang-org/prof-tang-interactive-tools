/** @type {PageData} */
const pageData = {
    "title": "Froude Number",
    "equationElements": [
        {
            "type": "header",
            "text": "Froude number"
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
            "text": "Fr = \\frac{v}{\\sqrt{gy}}"
        },
        {
            "type": "list",
            "header": "Symbols",
            "content": [
                {
                    "text": "$Fr$ — Froude number"
                },
                {
                    "text": "$c$ — wave speed of flow [m/s]"
                },
                {
                    "text": "$g$ — gravitational acceleration [m/s^2]"
                },
                {
                    "text": "$y$ — flow depth [m]"
                },
                {
                    "text": "$v$ — flow velocity [m/s]"
                }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational Acceleration $g$ [m/s²]",
                "value": 9.81
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "y",
                "text": "Flow Depth $y$ [m]",
                "min": 0.1,
                "max": 5,
                "initialValue": 0.5,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "v",
                "text": "Flow Velocity $v$ [m/s]",
                "min": 0.1,
                "max": 8,
                "initialValue": 1,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "id": "wave-speed",
                "text": "Wave Speed $c$ [m/s]",
                "type": "calculation",
                "value": "sqrt(g * y)"
            },
            {
                "id": "froude-number",
                "text": "Froude Number $Fr$",
                "type": "calculation",
                "value": "v / sqrt(g * y)"
            },
        ]
    },
    "plots": {
        "aspectRatio": 3,
        "settings": [
            {
                "y": "wave-speed",
                "x": "y",
                "yLabel": "$c \\text{ [m/s]}$",
                "xLabel": "$y \\text{ [m]}$",
                "xMin": 0,
                "xMax": 5,
                "yMin": 0,
                "yMax": 8,
            },
            {
                "y": "froude-number",
                "x": "v",
                "yLabel": "$Fr$",
                "xLabel": "$v \\text{ [m/s]}$",
                "xMin": 0,
                "xMax": 8,
                "yMin": 0,
                "yMax": 10
            }
        ],
        "text": "Drag the red dots to analyze the influence of flow depth and flow velocity on the wave speed and Froude number."
    }
}