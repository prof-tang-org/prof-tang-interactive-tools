/** @type {PageData} */
const pageData = {
    "title": "Thermophysical Properties Evaluation using CoolProp",
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
                "Pure substance in single-phase or two-phase thermodynamic equilibrium",
                "State fixed by temperature and pressure"
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\rho = \\text{PropSI}('D', 'T', T, 'P', P, \\text{fluid})",
                "h = \\text{PropSI}('H', 'T', T, 'P', P, \\text{fluid})",
                "s = \\text{PropSI}('S', 'T', T, 'P', P, \\text{fluid})"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "temperature" },
                { "symbol": "$P$", "definition": "pressure" },
                { "symbol": "$\\rho$", "definition": "density" },
                { "symbol": "$h$", "definition": "specific enthalpy" },
                { "symbol": "$s$", "definition": "specific entropy" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/3.1-eq.png",
        "alt": "Thermophysical property evaluation using CoolProp database."
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
                    { "text": "Air", "value": "Air" },
                    { "text": "Carbon Dioxide (CO₂)", "value": "CO2" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "temp",
                "text": "Temperature, $T$ [°C]",
                "min": 10,
                "max": 300,
                "initialValue": 100,
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
                "id": "rho",
                "text": "Density, $\\rho$ [kg/m³]",
                "type": "calculation",
                "value": "PropSI('D', 'T', temp + 273.15, 'P', pressure * 1e5, fluid)",
                "decimals": 3
            },
            {
                "id": "enthalpy",
                "text": "Specific Enthalpy, $h$ [kJ/kg]",
                "type": "calculation",
                "value": "PropSI('H', 'T', temp + 273.15, 'P', pressure * 1e5, fluid) / 1000",
                "decimals": 2
            },
            {
                "id": "entropy",
                "text": "Specific Entropy, $s$ [kJ/kg·K]",
                "type": "calculation",
                "value": "PropSI('S', 'T', temp + 273.15, 'P', pressure * 1e5, fluid) / 1000",
                "decimals": 4
            }
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            [
                {
                    "x": "temp",
                    "y": "rho",
                    "xLabel": "$T \\text{ [°C]}$",
                    "yLabel": "$\\rho \\text{ [kg/m³]}$",
                    "xMin": 10,
                    "xMax": 300,
                    "xTickInterval": 50,
                    "yMin": 0,
                    "yMax": 1000,
                    "yTickInterval": 200,
                    "key": "fluid"
                }
            ]
        ],
        "text": "Demonstration of CoolProp PropSI() dynamic property evaluation for thermophysical calculations."
    }
};
