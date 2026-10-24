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
                "\\rho = \\text{PropsSI}('D', 'T', T, 'P', P, \\text{fluid})",
                "h = \\text{PropsSI}('H', 'T', T, 'P', P, \\text{fluid})",
                "s = \\text{PropsSI}('S', 'T', T, 'P', P, \\text{fluid})"
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
        "pythonScript": "../me200/coolprop-test-eq.py",
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
                "decimals": 3
            },
            {
                "id": "enthalpy",
                "text": "Specific Enthalpy, $h$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "entropy",
                "text": "Specific Entropy, $s$ [kJ/kg·K]",
                "decimals": 4
            }
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.5,
        "customScripts": [
            "../assets/js/plots/ts-diagram.js",
            "../assets/js/plots/ph-diagram.js"
        ],
        "customScriptFunctions": [
            ["tsDiagram"],
            ["phDiagram"]
        ],
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
                    "yMin": 0.5,
                    "yMax": 1000,
                    "yLog": true,
                    "yTickInterval": 200,
                    "key": "fluid"
                },
                {
                    "customScript": "../assets/js/plots/ts-diagram.js",
                    "customRender": "tsDiagram",
                    "customScriptFunctions": ["tsDiagram"],
                    "mode": "before",
                    "x": "entropy",
                    "y": "temp",
                    "xLabel": "$s \\text{ [kJ/kg·K]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": [0, 0.8, 0.8],
                    "xMax": [10, 2.0, 2.2],
                    "xTickInterval": [2, 0.2, 0.3],
                    "yMin": [0, -40, -60],
                    "yMax": [400, 140, 70],
                    "yTickInterval": [50, 20, 20],
                    "key": "fluid",
                    "points": [
                        ["sf(40, fluid)", 40],
                        ["sf(temp, fluid)", "temp"],
                        ["sg(temp, fluid)", "temp"],
                        ["sg(40, fluid)", "PropsSI('T', 'S', sg(40, fluid), 'P', pressure * 1e5, fluid)"],
                        ["sg(40, fluid)", 40],
                        ["sf(40, fluid)", 40]
                    ],
                    "pointLabels": [
                        { "text": "$1$", "offsetX": "-0.5", "offsetY": "20", "color": "#ef4444" },
                        { "text": "$2$", "location": "top left", "color": "#ea580c" },
                        { "text": "$3$", "location": "top right", "color": "#0284c7" },
                        { "text": "$4$", "location": "bottom right", "color": "#6366f1" },
                        { "text": "$5$", "location": "top left", "color": "#ea580c" },
                        ""
                    ],
                    "pointColors": [
                        "#ef4444",
                        "#ea580c",
                        "#0284c7",
                        "#6366f1",
                        "#ef4444"
                    ],
                    "pointSegmentColors": [
                        "#ef4444",
                        "#ea580c",
                        "#0284c7",
                        "#6366f1"
                    ]
                }
            ],
            [
                {
                    "customScript": "../assets/js/plots/ph-diagram.js",
                    "customRender": "phDiagram",
                    "customScriptFunctions": ["phDiagram"],
                    "mode": "points",
                    "x": "enthalpy",
                    "y": "pressure",
                    "xLabel": "Specific Enthalpy, $h \\text{ [kJ/kg]}$",
                    "yLabel": "Pressure, $P \\text{ [bar]}$",
                    "xMin": [0, 100, 0, 100],
                    "xMax": [3500, 550, 600, 600],
                    "xTickInterval": [500, 50, 100, 100],
                    "yMin": [0, 0, 0, 0],
                    "yMax": [60, 50, 60, 80],
                    "yTickInterval": [10, 10, 10, 10],
                    "key": "fluid",
                    "aspectRatio": 2.2
                }
            ]
        ],
        "text": "Demonstration of CoolProp properties calculated via Python calculation engine (`coolprop-test-eq.py`), custom T-s diagram script (`ts-diagram.js`), and P-h diagram script (`ph-diagram.js`)."
    }
};
