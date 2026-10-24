/** @type {PageData} */
const pageData = {
    "title": "Ideal Vapor-Compression Refrigeration Cycle",
    "layout": {
        "grid": [
            {
                "desktop": "1.1fr 0.9fr",
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
                "Steady-state operation of an ideal vapor-compression refrigeration cycle",
                "Isentropic compression in the compressor (1 → 2)",
                "Constant pressure heat rejection in condenser and heat addition in evaporator",
                "Isenthalpic throttling expansion across the expansion valve (3 → 4)",
                "Saturated vapor exits the evaporator (state 1) and saturated liquid exits the condenser (state 3)"
            ]
        },
        {
            "type": "equations",
            "content": [
                "q_{\\text{in}} = h_1 - h_4",
                "w_{\\text{in}} = h_2 - h_1",
                "q_{\\text{out}} = h_2 - h_3",
                "\\text{COP}_R = \\frac{q_{\\text{in}}}{w_{\\text{in}}} = \\frac{h_1 - h_4}{h_2 - h_1}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "temperature" },
                { "symbol": "$P$", "definition": "pressure" },
                { "symbol": "$h$", "definition": "specific enthalpy" },
                { "symbol": "$s$", "definition": "specific entropy" },
                { "symbol": "$q_{\\text{in}}$", "definition": "refrigeration cooling capacity" },
                { "symbol": "$w_{\\text{in}}$", "definition": "compressor work input" },
                { "symbol": "$q_{\\text{out}}$", "definition": "condenser heat rejection" },
                { "symbol": "$\\text{COP}_R$", "definition": "coefficient of performance" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/3.1-eq.png",
        "alt": "Ideal vapor-compression refrigeration cycle diagram."
    },
    "inputOutput": {
        "pythonScript": {
            "path": "../test/refrigeration-cycle-calc.py",
            "function": "calculate_cycle"
        },
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Refrigerant",
                "choices": [
                    { "text": "R134a (1,1,1,2-Tetrafluoroethane)", "value": "R134a" },
                    { "text": "R1234yf (HFO Refrigerant)", "value": "R1234yf" },
                    { "text": "Propane (R290)", "value": "Propane" },
                    { "text": "Ammonia (R717)", "value": "Ammonia" },
                    { "text": "Carbon Dioxide (R744)", "value": "CO2" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "T_evap",
                "text": "Evaporator Temp, $T_1 = T_{\\text{evap}}$ [°C]",
                "min": -25,
                "max": 20,
                "initialValue": 10,
                "step": 1
            },
            {
                "type": "slider",
                "id": "T_cond",
                "text": "Condenser Temp, $T_3 = T_{\\text{cond}}$ [°C]",
                "min": 25,
                "max": 65,
                "initialValue": 40,
                "step": 1
            }
        ],
        "outputs": [
            {
                "id": "cop",
                "text": "COP, $\\text{COP}_R$ [-]",
                "decimals": 2
            },
            {
                "id": "q_in",
                "text": "Cooling Capacity, $q_{\\text{in}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "w_in",
                "text": "Compressor Work, $w_{\\text{in}}$ [kJ/kg]",
                "decimals": 2
            },
            {
                "id": "p_ratio",
                "text": "Pressure Ratio, $P_2 / P_1$ [-]",
                "decimals": 2
            },
            {
                "id": "P1_kPa",
                "text": "Evaporator Pressure, $P_1$ [kPa]",
                "decimals": 1
            },
            {
                "id": "P2_kPa",
                "text": "Condenser Pressure, $P_2$ [kPa]",
                "decimals": 1
            },
            {
                "id": "T2",
                "text": "Compressor Exit Temp, $T_2$ [°C]",
                "decimals": 1
            },
            {
                "id": "x4",
                "text": "Evaporator Inlet Quality, $x_4$ [-]",
                "decimals": 3
            }
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.45,
        "customScripts": [
            "../assets/js/plots/ts-diagram.js",
            "../assets/js/plots/ph-diagram.js"
        ],
        "customScriptFunctions": [
            ["tsDiagram"],
            ["phDiagram", "thDiagram"]
        ],
        "settings": [
            [
                {
                    "customScript": "../assets/js/plots/ts-diagram.js",
                    "customRender": "tsDiagram",
                    "customScriptFunctions": ["tsDiagram"],
                    "mode": "before",
                    "x": "s",
                    "y": "T",
                    "xLabel": "$s \\text{ [kJ/(kg·K)]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": 0.8,
                    "xMax": 2.0,
                    "xTickInterval": 0.2,
                    "yMin": -20,
                    "yMax": 80,
                    "yTickInterval": 20,
                    "key": "fluid",
                    "points": [
                        ["s1", "T1"],
                        ["s2", "T2"],
                        ["sa", "Ta"],
                        ["s3", "T3"],
                        ["s4", "T4"],
                        ["s1", "T1"]
                    ],
                    "pointLabels": [
                        { "text": "$1$", "location": "bottom right", "color": "#0284c7" },
                        { "text": "$2$", "location": "top right", "color": "#ef4444" },
                        "",
                        { "text": "$3$", "location": "top left", "color": "#10b981" },
                        { "text": "$4$", "location": "bottom left", "color": "#f59e0b" },
                        ""
                    ],
                    "pointColors": [
                        "#0284c7",
                        "#ef4444",
                        "none",
                        "#10b981",
                        "#f59e0b",
                        "none"
                    ],
                    "pointSegmentColors": [
                        "#ef4444",
                        "#ef4444",
                        "#10b981",
                        "#f59e0b",
                        "#0284c7"
                    ]
                },
                {
                    "customScript": "../assets/js/plots/ph-diagram.js",
                    "customRender": "phDiagram",
                    "customScriptFunctions": ["phDiagram"],
                    "mode": "before",
                    "pressureUnit": "kPa",
                    "x": "h",
                    "y": "P",
                    "xLabel": "$h \\text{ [kJ/kg]}$",
                    "yLabel": "$p \\text{ [kPa]}$",
                    "xMin": 150,
                    "xMax": 500,
                    "xTickInterval": 50,
                    "yMin": 100,
                    "yMax": 2500,
                    "yTickInterval": 400,
                    "key": "fluid",
                    "points": [
                        ["h1", "P1_kPa"],
                        ["h2", "P2_kPa"],
                        ["ha", "Pa_kPa"],
                        ["h3", "P3_kPa"],
                        ["h4", "P4_kPa"],
                        ["h1", "P1_kPa"]
                    ],
                    "pointLabels": [
                        { "text": "$1$", "location": "bottom right", "color": "#0284c7" },
                        { "text": "$2$", "location": "top right", "color": "#ef4444" },
                        "",
                        { "text": "$3$", "location": "top left", "color": "#10b981" },
                        { "text": "$4$", "location": "bottom left", "color": "#f59e0b" },
                        ""
                    ],
                    "pointColors": [
                        "#0284c7",
                        "#ef4444",
                        "none",
                        "#10b981",
                        "#f59e0b",
                        "none"
                    ],
                    "pointSegmentColors": [
                        "#ef4444",
                        "#ef4444",
                        "#10b981",
                        "#f59e0b",
                        "#0284c7"
                    ]
                }
            ],
            [
                {
                    "customScript": "../assets/js/plots/ph-diagram.js",
                    "customRender": "thDiagram",
                    "customScriptFunctions": ["thDiagram"],
                    "mode": "before",
                    "x": "h",
                    "y": "T",
                    "xLabel": "$h \\text{ [kJ/kg]}$",
                    "yLabel": "$T \\text{ [°C]}$",
                    "xMin": 150,
                    "xMax": 500,
                    "xTickInterval": 50,
                    "yMin": -20,
                    "yMax": 80,
                    "yTickInterval": 20,
                    "key": "fluid",
                    "points": [
                        ["h1", "T1"],
                        ["h2", "T2"],
                        ["ha", "Ta"],
                        ["h3", "T3"],
                        ["h4", "T4"],
                        ["h1", "T1"]
                    ],
                    "pointLabels": [
                        { "text": "$1$", "location": "bottom right", "color": "#0284c7" },
                        { "text": "$2$", "location": "top right", "color": "#ef4444" },
                        "",
                        { "text": "$3$", "location": "top left", "color": "#10b981" },
                        { "text": "$4$", "location": "bottom left", "color": "#f59e0b" },
                        ""
                    ],
                    "pointColors": [
                        "#0284c7",
                        "#ef4444",
                        "none",
                        "#10b981",
                        "#f59e0b",
                        "none"
                    ],
                    "pointSegmentColors": [
                        "#ef4444",
                        "#ef4444",
                        "#10b981",
                        "#f59e0b",
                        "#0284c7"
                    ],
                    "aspectRatio": 2.2
                }
            ]
        ],
        "text": "Ideal vapor-compression refrigeration cycle diagrams (T-s, p-h, T-h) computed via Python calculation engine (`refrigeration-cycle-calc.py`) and rendered with D3.js point segments."
    }
};
