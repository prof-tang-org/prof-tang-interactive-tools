/** @type {PageData} */
const pageData = {
    "title": "Entrance Length of a Flow in a Circular Pipe",
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
            "type": "assumptions",
            "content": [
                "Steady, incompressible flow",
                "Circular pipe geometry"
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\frac{l_e}{D} = \\begin{cases} 0.06 Re_D & \\text{for laminar flow, } Re_D < 2100 \\\\ 4.4 Re_D^{1/6} & \\text{for turbulent flow, } Re_D > 4000 \\end{cases}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$l_e$", "definition": "entrance length" },
                { "symbol": "$D$", "definition": "inner diameter of pipe" },
                { "symbol": "$Re_D$", "definition": "Reynolds number" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/8.1-eq.svg",
        "alt": "Schematic of fluid flow entering a circular pipe, showing the development of velocity profile along the entrance length le."
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "regime",
                "text": "Flow Regime",
                "choices": [
                    {
                        "text": "Laminar (Re_D < 2100)",
                        "value": "laminar"
                    },
                    { "text": "Turbulent (Re_D > 4000)", "value": "turbulent" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "reynolds",
                "text": "Reynolds Number, $Re_D$",
                "min": "regime === 'laminar' ? 10 : 4000",
                "max": "regime === 'laminar' ? 2100 : 1e6",
                "initialValue": 1000,
                "step": "regime === 'laminar' ? 10 : 100",
                "notation": "scientific"
            }
        ],
        "outputs": [
            {
                "id": "le_D",
                "text": "Entrance Length Ratio, $l_e / D$",
                "type": "calculation",
                "value": "reynolds <= 2100 ? 0.06 * reynolds : (reynolds >= 4000 ? 4.4 * pow(reynolds, 1/6) : NaN)"
            }
        ],
        "dottedRange": {
            "variable": "reynolds",
            "min": 2100.1,
            "max": 3999.9
        }
    },
    "plots": {
        "aspectRatio": 2,
        "settings": [
            {
                "x": "reynolds",
                "y": "le_D",
                "xLabel": "$Re_D$",
                "yLabel": "$l_e / D$",
                "xMin": 10,
                "xMax": 1e6,
                "yMin": 0.1,
                "yMax": 200,
                "xLog": true,
                "yLog": true,
                "reference": [
                    {
                        "text": ""
                    }
                ]
            }
        ],
        "text": "Drag the point or change the inputs to analyze how the entrance length ratio ($l_e / D$) varies with the Reynolds number ($Re_D$) on a log-log scale. The transition region ($2100 \\le Re_D \\le 4000$) represents a gap where the flow regime transitions from laminar to turbulent."
    }
};
