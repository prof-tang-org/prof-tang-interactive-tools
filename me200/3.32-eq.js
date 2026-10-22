/** @type {PageData} */
const pageData = {
    "title": "Equation of State of Ideal Gases",
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
                "The gas behaves as an ideal gas"
            ]
        },
        {
            "type": "equations",
            "content": [
                "pv = RT",
                "'where the gas constant is:'",
                "R = \\frac{\\bar R}{M}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$v$", "definition": "specific volume" },
                { "symbol": "$T$", "definition": "thermodynamic temperature" },
                { "symbol": "$R$", "definition": "gas constant" },
                { "symbol": "$\\bar R$", "definition": "universal gas constant" },
                { "symbol": "$M$", "definition": "molar mass" }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "Rbar",
                "text": "Universal gas constant, $\\bar R$ [J/(kmol·K)]",
                "value": 8314
            }
        ],
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
                "id": "T",
                "text": "Temperature, $T$ [K]",
                "min": 300,
                "max": 1000,
                "step": 1,
                "initialValue": 500
            },
            {
                "type": "slider",
                "id": "p",
                "text": "Absolute pressure, $p$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 1,
                "initialValue": 300
            }
        ],
        "outputs": [
            {
                "id": "M",
                "text": "Molar mass, $M$ [kg/kmol]",
                "type": "map",
                "key": "gas",
                "value": [28.97, 32.00, 28.01, 44.01],
                "decimals": 2
            },
            {
                "id": "R",
                "text": "Gas constant, $R$ [J/(kg·K)]",
                "type": "calculation",
                "value": "Rbar / M",
                "decimals": 2
            },
            {
                "id": "v",
                "text": "Specific volume, $v$ [m³/kg]",
                "type": "calculation",
                "value": "R * T / (p * 1000)",
                "decimals": 4
            }
        ],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 2.25,
        "settings": [
            [
                {
                    "x": "T",
                    "y": "v",
                    "width": "90%",
                    "xLabel": "$T$ [K]",
                    "yLabel": "$v$ [m³/kg]",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": 0,
                    "yMax": 3,
                    "yTickInterval": 0.5,
                    "activeLabel": "$p = {p}$ kPa",
                    "reference": [
                        { "p": 100, "text": "$p = 100$ kPa" },
                        { "p": 1000, "text": "$p = 1000$ kPa" }
                    ]
                }
            ],
            [
                {
                    "x": "p",
                    "y": "v",
                    "width": "90%",
                    "xLabel": "$p$ [kPa]",
                    "yLabel": "$v$ [m³/kg]",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": 0,
                    "yMax": 3,
                    "yTickInterval": 0.5,
                    "activeLabel": "$T = {T}$ K",
                    "reference": [
                        { "T": 300, "text": "$T = 300$ K" },
                        { "T": 1000, "text": "$T = 1000$ K" }
                    ]
                }
            ]
        ],
        "text": "All properties are computed from the ideal gas law $pv = RT$. Dashed gray curves show the limits of the input range. **Drag the marked point** on either plot or use the inputs above to change the state."
    }
};
