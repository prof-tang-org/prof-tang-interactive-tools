/** @type {PageData} */
const pageData = {
    "title": "Polytropic Process Work of a Closed System with Ideal Gas",
    "layout": {
        "grid": [
            {
                "desktop": "1.4fr 0.8fr",
                "mobile": "100%"
            },
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
                "Ideal gas in a closed system",
                "Polytropic process"
            ]
        },
        {
            "type": "equations",
            "content": [
                "W = \\frac{mR(T_2 - T_1)}{1 - n} = \\frac{mRT_1\\left[\\left(\\frac{V_1}{V_2}\\right)^{n-1} - 1\\right]}{1 - n} \\quad \\text{for } n \\neq 1",
                "W = mRT \\ln\\frac{V_2}{V_1} \\quad \\text{for } n = 1"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$W$", "definition": "work done by the gas" },
                { "symbol": "$m$", "definition": "mass of the gas" },
                { "symbol": "$R$", "definition": "gas constant" },
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$V_1$", "definition": "initial volume" },
                { "symbol": "$V_2$", "definition": "final volume" },
                { "symbol": "$T_1$", "definition": "initial thermodynamic temperature" },
                { "symbol": "$T_2$", "definition": "final thermodynamic temperature" },
                { "symbol": "$T$", "definition": "thermodynamic temperature of the isothermal process, $n = 1$" },
                { "symbol": "$n$", "definition": "polytropic index" }
            ]
        }
    ],
    "derivationElements": [
        {
            "type": "header",
            "text": "Derivation"
        },
        {
            "type": "note",
            "text": [
                "The work due to the boundary movement of a closed system undergoing a process 1-2:",
                "$$\\displaystyle W = \\int_1^2 p \\, dV = \\frac{p_2 V_2 - p_1 V_1}{1 - n} \\quad \\text{for } n \\neq 1 \\qquad (1)$$",
                "$$\\displaystyle W = \\int_1^2 p \\, dV = p_1 V_1 \\ln\\frac{V_2}{V_1} \\quad \\text{for } n = 1 \\qquad (2)$$",
                "Please refer to the polytropic process work of a closed system for the development of Eqs. (1) and (2)."
            ]
        },
        {
            "type": "note",
            "text": [
                "For ideal gases,",
                "$$\\displaystyle pV = mRT \\qquad (3)$$",
                "For polytropic processes,",
                "$$\\displaystyle p_1 V_1^n = p_2 V_2^n \\quad \\text{and} \\quad \\frac{p_2}{p_1} = \\left(\\frac{V_1}{V_2}\\right)^n \\qquad (4)$$",
                "Thus, combining Eqs. (3) and (4) to get the expression for ideal gas polytropic processes,",
                "$$\\displaystyle \\frac{T_2}{T_1} = \\frac{p_2 V_2 / (mR)}{p_1 V_1 / (mR)} = \\frac{p_2}{p_1} \\frac{V_2}{V_1} = \\left(\\frac{V_1}{V_2}\\right)^n \\frac{V_2}{V_1} = \\left(\\frac{V_1}{V_2}\\right)^{n-1} \\qquad (5)$$"
            ]
        },
        {
            "type": "note",
            "text": [
                "Substitution of Eqs. (3) and (5) into Eqs. (1) and (2) gives",
                "$$\\displaystyle \\begin{aligned} W = \\int_1^2 p \\, dV &= \\frac{p_2 V_2 - p_1 V_1}{1 - n} = \\frac{mRT_2 - mRT_1}{1 - n} \\\\ &= \\frac{mR(T_2 - T_1)}{1 - n} = \\frac{mRT_1\\left(\\frac{T_2}{T_1} - 1\\right)}{1 - n} \\\\ &= \\frac{mRT_1\\left[\\left(\\frac{V_1}{V_2}\\right)^{n-1} - 1\\right]}{1 - n} \\quad \\text{for } n \\neq 1 \\end{aligned}$$",
                "$$\\displaystyle W = \\int_1^2 p \\, dV = p_1 V_1 \\ln\\frac{V_2}{V_1} = mRT \\ln\\frac{V_2}{V_1} \\quad \\text{for } n = 1$$",
                "($n = 1$ for ideal gases $\\rightarrow mRT_1 = p_1 V_1 = p_2 V_2 = mRT_2 \\rightarrow T_1 = T_2 = T$), making the process isothermal."
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/2.17-eq.png",
        "alt": "Piston-cylinder Assembly with Polytropic Process"
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "fluid",
                "text": "Working fluid",
                "value": "Ideal-gas air in a piston-cylinder assembly"
            },
            {
                "id": "p1",
                "text": "Initial pressure, $p_1$ [kPa]",
                "value": 100
            },
            {
                "id": "V1",
                "text": "Initial volume, $V_1$ [m³]",
                "value": 0.1
            },
            {
                "id": "T1",
                "text": "Initial temperature, $T_1$ [K]",
                "value": 300
            }
        ],
        "inputColumns": 3,
        "inputs": [
            {
                "type": "slider",
                "id": "n",
                "text": "Polytropic index, $n$",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "initialValue": 1.3
            },
            {
                "type": "slider",
                "id": "V2",
                "text": "Final volume, $V_2$ [m³]",
                "min": 0.05,
                "max": 0.2,
                "step": 0.001,
                "initialValue": 0.15
            }
        ],
        "outputs": [
            {
                "id": "M",
                "text": "Molar mass, $M$ [kg/kmol]",
                "type": "calculation",
                "value": "28.97"
            },
            {
                "id": "R",
                "text": "Gas constant, $R$ [J/(kg·K)]",
                "type": "calculation",
                "value": "287"
            },
            {
                "id": "m",
                "text": "Mass, $m$ [kg]",
                "type": "calculation",
                "value": "p1 * 1000 * V1 / (R * T1)"
            },
            {
                "id": "T2",
                "text": "Final temperature, $T_2$ [K]",
                "type": "calculation",
                "value": "T1 * pow(V1 / V2, n - 1)"
            },
            {
                "id": "p2",
                "text": "Final pressure, $p_2$ [kPa]",
                "type": "calculation",
                "value": "p1 * pow(V1 / V2, n)"
            },
            {
                "id": "W",
                "text": "Work, $W$ [kJ]",
                "type": "calculation",
                "value": "abs(n - 1.0) < 1e-4 ? (p1 * V1 * log(V2 / V1)) : (p1 * V1 * (pow(V1 / V2, n - 1) - 1) / (1 - n))"
            }
        ],
        "outputColumns": 3,
    
    },
    "plots": {
        "aspectRatio": 1.1,
        "settings": [
            [
                {
                    "x": "V2",
                    "y": "T2",
                    "xLabel": "$V_2 \\text{ [m³]}$",
                    "yLabel": "$T_2 \\text{ [K]}$",
                    "xMin": 0,
                    "xMax": 0.2,
                    "xTickInterval": 0.05,
                    "yMin": 0,
                    "yMax": 700,
                    "yTickInterval": 100,
                    "activeLabel": "$n = {n}$",
                    "reference": [
                        { "n": 0, "text": "$n = 0$" },
                        { "n": 2, "text": "$n = 2$" }
                    ]
                },
                {
                    "x": "V2",
                    "y": "p2",
                    "xLabel": "$V_2 \\text{ [m³]}$",
                    "yLabel": "$p_2 \\text{ [kPa]}$",
                    "xMin": 0,
                    "xMax": 0.2,
                    "xTickInterval": 0.05,
                    "yMin": 0,
                    "yMax": 450,
                    "yTickInterval": 50,
                    "activeLabel": {
                        "text": "$n = {n}$",
                        "offset": { "x": 0, "y": -2 }
                    },
                    "reference": [
                        { "n": 0, "text": "$n = 0$" },
                        { "n": 2, "text": "$n = 2$" }
                    ]
                },
                {
                    "mode": "standard",
                    "x": "V2",
                    "y": "W",
                    "xLabel": "$V_2 \\text{ [m³]}$",
                    "yLabel": "$W \\text{ [kJ]}$",
                    "xMin": 0,
                    "xMax": 0.2,
                    "xTickInterval": 0.05,
                    "yMin": -12,
                    "yMax": 12,
                    "yTickInterval": 4,
                    "activeLabel": "$n = {n}$",
                    "reference": [
                        { "n": 0, "text": "$n = 0$" },
                        { "n": 2, "text": "$n = 2$" }
                    ],
                    "points": [[0, 0], [0.2, 0]],
                    "showPoints": false,
                    "pointsColor": "#9ca3af",
                    "lineWidth": 1
                }
            ]
        ],
        "text": "Curves show how temperature, pressure, and work change with volume for different polytropic indices. **Drag the marked point** on any plot or use the sliders above to see values at different final volumes."
    }
};
