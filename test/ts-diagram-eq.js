/** @type {PageData} */
const pageData = {
    "title": "Thermodynamic Temperature-Entropy (T-s) Diagram Evaluation",
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
                "Pure substance in thermodynamic equilibrium",
                "State fixed by temperature and pressure"
            ]
        },
        {
            "type": "equations",
            "content": [
                "s = \\text{PropsSI}('S', 'T', T, 'P', P, \\text{fluid})",
                "h = \\text{PropsSI}('H', 'T', T, 'P', P, \\text{fluid})"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "temperature" },
                { "symbol": "$P$", "definition": "pressure" },
                { "symbol": "$s$", "definition": "specific entropy" },
                { "symbol": "$h$", "definition": "specific enthalpy" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/3.1-eq.png",
        "alt": "Temperature-Entropy (T-s) diagram with saturation dome and isobars."
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Fluid",
                "choices": [
                    { "text": "Water (H₂O)", "value": "Water" },
                    { "text": "Refrigerant R134a", "value": "R134a" },
                    { "text": "Carbon Dioxide (CO₂)", "value": "CO2" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "temp",
                "text": "Temperature, $T$ [°C]",
                "min": 0,
                "max": 400,
                "initialValue": 150,
                "step": 5
            },
            {
                "type": "slider",
                "id": "pressure",
                "text": "Pressure, $P$ [bar]",
                "min": 0.5,
                "max": 50,
                "initialValue": 2.0,
                "step": 0.5
            }
        ],
        "outputs": [
            {
                "id": "entropy",
                "text": "Specific Entropy, $s$ [kJ/kg·K]",
                "type": "calculation",
                "value": "PropsSI('S', 'T', temp + 273.15, 'P', pressure * 1e5, fluid) / 1000",
                "decimals": 4
            },
            {
                "id": "enthalpy",
                "text": "Specific Enthalpy, $h$ [kJ/kg]",
                "type": "calculation",
                "value": "PropsSI('H', 'T', temp + 273.15, 'P', pressure * 1e5, fluid) / 1000",
                "decimals": 2
            }
        ],
        "outputColumns": 2
    },
    "plots": {
        "aspectRatio": 1.5,
        "customScripts": [
            "../assets/js/plots/ts-diagram.js"
        ],
        "settings": [
            [
                {
                    "customScript": "../assets/js/plots/ts-diagram.js",
                    "customRender": "tsDiagram",
                    "mode": "before",
                    "x": "entropy",
                    "y": "temp",
                    "xLabel": "Specific Entropy, $s \\text{ [kJ/kg·K]}$",
                    "yLabel": "Temperature, $T \\text{ [°C]}$",
                    "xMin": [0, 0.8, 0.8],
                    "xMax": [10, 2.0, 2.2],
                    "xTickInterval": [2, 0.2, 0.3],
                    "yMin": [0, -40, -60],
                    "yMax": [400, 140, 70],
                    "yTickInterval": [50, 20, 20],
                    "key": "fluid"
                }
            ]
        ],
        "text": "Extensible T-s diagram embedding saturation dome, constant quality lines, and isobar curves rendered via custom plot script (`ts-diagram.js`)."
    }
};
