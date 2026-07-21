/** @type {import('../typedefs.js').PageData} */
const pageData = {
    "title": "Polytropic Process Work of a Closed System",
    "layout": {
        "grid": [
            {
                "desktop": "1.4fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Polytropic process work equation for a closed system"
        },
        {
            "type": "equation",
            "text": "\\text{Polytropic process: } pV^n = \\text{constant}"
        },
        {
            "type": "equation",
            "text": "W = \\begin{cases} p_1 V_1 \\ln\\left(\\frac{V_2}{V_1}\\right) & \\text{if } n = 1.0 \\\\ \\frac{p_2 V_2 - p_1 V_1}{1 - n} & \\text{if } n \\neq 1.0 \\end{cases}"
        },
        {
            "type": "list",
            "header": "Symbols",
            "content": [
                {
                    "text": "$W$ — work done by the gas"
                },
                {
                    "text": "$V_1$ — initial volume"
                },
                {
                    "text": "$V_2$ — final volume"
                },
                {
                    "text": "$p$ — absolute pressure"
                },
                {
                    "text": "$n$ — polytropic index"
                }
            ]
        },
        {
            "type": "note",
            "text": "Note: $p_1V_1 = p_2V_2$ for $n = 1.0$"
        }
    ],
    "derivationElements": [
        {
            "type": "header",
            "text": "Derivation"
        },
        {
            "type": "note",
            "text": "The work associated with the change in the volume of a closed system due to the movement of its boundary can be evaluated by:"
        },
        {
            "type": "note",
            "text": "$$\\displaystyle W = \\int_{V_1}^{V_2} p \\, dV$$"
        },
        {
            "type": "note",
            "text": [
                "For $n = 1.0$:",
                "$$\\displaystyle W = \\int_{V_1}^{V_2} \\frac{\\text{constant}}{V} dV = \\text{constant} \\ln\\left(\\frac{V_2}{V_1}\\right) = p_1V_1 \\ln\\left(\\frac{V_2}{V_1}\\right)$$",
                "For $n \\neq 1.0$:",
                "$$\\displaystyle \\begin{aligned} W &= \\int_{V_1}^{V_2} \\frac{\\text{constant}}{V^n} \\, dV \\\\"
                + "&= \\frac{\\text{constant}(V_2^{1-n} - V_1^{1-n})}{1-n} \\\\"
                + "&= \\frac{(p_2V_2^n)V_2^{1-n} - (p_1V_1^n)V_1^{1-n}}{1-n} \\\\"
                + "&= \\frac{p_2 V_2 - p_1 V_1}{1 - n} \\end{aligned}$$"
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
                "id": "pressure-1",
                "text": "Initial pressure $p_1$ [kPa]",
                "value": 100
            },
            {
                "id": "volume-1",
                "text": "Initial volume $V_1$ [m$^3$]",
                "value": 0.1
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "polytropic-n",
                "text": "Polytropic index $n$",
                "min": 0,
                "max": 2,
                "initialValue": 1.3,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "volume-2",
                "text": "Final volume $V_2$ [m$^3$]",
                "min": 0.05,
                "max": 0.2,
                "initialValue": 0.15,
                "step": 0.001
            }
        ],
        "outputs": [
            {
                "text": "Final pressure $p_2$ [kPa]",
                "id": "pressure-2",
                "type": "calculation",
                "value": "pressure-1 * pow(volume-1 / volume-2, polytropic-n)"
            },
            {
                "text": "Work $W$ [kJ]",
                "id": "work",
                "type": "calculation",
                "value": "abs(polytropic-n - 1.0) < 1e-4 ? (pressure-1 * volume-1 * log(volume-2 / volume-1)) : ((pressure-1 * pow(volume-1 / volume-2, polytropic-n) * volume-2 - pressure-1 * volume-1) / (1 - polytropic-n))"
            }
        ],
        "outputColumns": 2
    },
    "plots": {
        "aspectRatio": 2.375,
        "settings": [
            {
                "y": "pressure-2",
                "x": "volume-2",
                "yLabel": "$p_2 \\text{ [}\\text{kPa}\\text{]}$",
                "xLabel": "$V_2 \\text{ [}\\text{m}^\\text{3}\\text{]}$",
                "xMin": 0.0,
                "xMax": 0.2,
                "yMin": 0,
                "yMax": 450,
                "activeLabel": "$n = {polytropic-n}$",
                "reference": [
                    {
                        "polytropic-n": 0,
                        "text": "$n = 0$"
                    },
                    {
                        "polytropic-n": 2,
                        "text": "$n = 2$"
                    }
                ]
            },
            {
                "y": "work",
                "x": "volume-2",
                "yLabel": "$W \\text{ [}\\text{kJ}\\text{]}$",
                "xLabel": "$V_2 \\text{ [}\\text{m}^\\text{3}\\text{]}$",
                "xMin": 0.0,
                "xMax": 0.2,
                "yMin": -10,
                "yMax": 10,
                "activeLabel": "$n = {polytropic-n}$",
                "reference": [
                    {
                        "polytropic-n": 0,
                        "text": "$n = 0$"
                    },
                    {
                        "polytropic-n": 2,
                        "text": "$n = 2$"
                    }
                ]
            }
        ],
        "text": "Curves show how pressure and work change with volume for different polytropic indices. Drag the red point to see values at different final volumes."
    }
};