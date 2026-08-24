/** @type {PageData} */
const pageData = {
    "title": "Sound Speed of Ideal Gases",
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
                "Isentropic flow of an ideal gas with constant specific heats"
            ]
        },
        {
            "type": "equations",
            "content": [
                "c = \\sqrt{kRT}, \\text{where } R = \\frac{\\bar{R}}{M}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$c$", "definition": "sound speed" },
                { "symbol": "$k$", "definition": "specific heat ratio" },
                { "symbol": "$R$", "definition": "gas constant" },
                { "symbol": "$\\bar{R}$", "definition": "universal gas constant" },
                { "symbol": "$M$", "definition": "molar mass" },
                { "symbol": "$T$", "definition": "temperature" }
            ]
        }
    ],
    // "schematic": {
    //     "src": "../assets/me310/11.47-eq.svg",
    //     "alt": "Schematic for sound speed of ideal gases"
    // },
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "gas",
                "text": "Gas",
                "choices": [
                    { "text": "Air", "value": "air" },
                    { "text": "Oxygen (O₂)", "value": "o2" },
                    { "text": "Nitrogen (N₂)", "value": "n2" },
                    { "text": "Hydrogen (H₂)", "value": "h2" },
                    { "text": "Helium (He)", "value": "he" },
                    { "text": "Neon (Ne)", "value": "ne" },
                    { "text": "Argon (Ar)", "value": "ar" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "temperature",
                "text": "Temperature, $T$ [K]",
                "min": 200,
                "max": 1000,
                "initialValue": 300,
                "step": 1
            }
        ],
        "outputs": [
            {
                "text": "$k$",
                "id": "specific-heat-ratio",
                "type": "map",
                "value": [1.4, 1.4, 1.4, 1.4, 1.67, 1.67, 1.67],
                "key": "gas"
            },
            {
                "text": "$M \\text{ [kg/kmol]}$",
                "id": "molar-mass",
                "type": "map",
                "value": [28.97, 32.00, 28.01, 2.016, 4.003, 20.18, 39.95],
                "key": "gas"
            },
            {
                "text": "$R \\text{ [J/(kg·K)]}$",
                "id": "gas-constant",
                "type": "calculation",
                "value": "8314 / molar-mass"
            },
            {
                "text": "$c \\text{ [m/s]}$",
                "id": "sound-speed",
                "type": "calculation",
                "value": "sqrt(specific-heat-ratio * gas-constant * temperature)"
            }
        ],
        "outputColumns": 2
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            {
                "x": "temperature",
                "y": "sound-speed",
                "xLabel": "$T \\text{ [K]}$",
                "yLabel": "$c \\text{ [m/s]}$",
                "xMin": 200,
                "xMax": 1000,
                "yMin": 0,
                "yMax": 2500,
                "xTickInterval": 100,
                "yTickInterval": 500
            }
        ],
        "text": "Adjust the temperature ($T$) or select a different gas to see the change in the sound speed ($c$)."
    }
};
