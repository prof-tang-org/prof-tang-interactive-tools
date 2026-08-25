const pageData = {
    "title": "Mach Number of Ideal Gas Isentropic Flows",
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
                "Ma = \\frac{V}{c} =  \\frac{V}{\\sqrt{kRT}}, \\text{where } R = \\frac{ \\bar{R}}{M}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$Ma$", "definition": "Mach number" },
                { "symbol": "$V$", "definition": "velocity of the gas" },
                { "symbol": "$c$", "definition": "speed of sound in the gas" },
                { "symbol": "$k$", "definition": "specific heat ratio" },
                { "symbol": "$R$", "definition": "gas constant" },
                { "symbol": "$T$", "definition": "absolute temperature" }
            ]
        }
    ],
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "gas",
                "text": "Gas",
                "choices": [
                    {
                        "text": "Air",
                        "value": "air"
                    },
                    {
                        "text": "Oxygen (O₂)",
                        "value": "o2"
                    },
                    {
                        "text": "Nitrogen (N₂)",
                        "value": "n2"
                    },
                    {
                        "text": "Hydrogen (H₂)",
                        "value": "h2"
                    },
                    {
                        "text": "Helium (He)",
                        "value": "he"
                    },
                    {
                        "text": "Neon (Ne)",
                        "value": "ne"
                    },
                    {
                        "text": "Argon (Ar)",
                        "value": "ar"
                    }
                ]
            },
            {
                "type": "slider",
                "id": "V",
                "text": "Velocity, $V$ [m/s]",
                "min": 0,
                "max": 1000,
                "initialValue": 500,
                "step": 1
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
                "value": [28.97, 32, 28.01, 2.016, 4.003, 20.18, 39.95],
                "key": "gas"
            },
            {
                "text": "$R \\text{ [kJ/(kg⋅K)]}$",
                "id": "gas-constant",
                "type": "calculation",
                "value": "8314 / molar-mass"
            },
            {
                "text": "$c \\text{ [m/s]}$",
                "id": "sound-speed",
                "type": "calculation",
                "value": "sqrt(specific-heat-ratio * gas-constant * temperature)"
            },
            {
                "text": "$Ma$",
                "id": "mach-number",
                "type": "calculation",
                "value": "V / sound-speed"
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "settings": [
            {
                "y": "mach-number",
                "x": "V",
                "yLabel": "$Ma$",
                "xLabel": "$V \\text{ [m/s]}$",
                "xMin": 0,
                "xMax": 1000,
                "yMin": 0,
                "yMax": [1.5, 4],  // once it becomes greater than 1.5, it jumps to 4 
                "yTickInterval": [0.3, 0.5]
            },
            {
                "y": "mach-number",
                "x": "temperature",
                "yLabel": "$Ma$",
                "xLabel": "$T \\text{ [K]}$",
                "xMin": 200,
                "xMax": 1000,
                "yMin": 0,
                "yMax": [1.5, 4],
                // link tick interval in renderer
                "yTickInterval": [0.3, 0.5]
            },
        ],
        "text": "Adjust velocity on the left plot and temperature on the right plot independently. Note, changing one changes the behavior of the other!"
    }
}