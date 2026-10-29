/** @type {PageData} */
const pageData = {
    "title": "Isentropic Process T-p Relation of Ideal Gases with Constant Specific Heats",
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
                "Isentropic process of an ideal gas with constant specific heats"
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\frac{T_2}{T_1} = \\left(\\frac{p_2}{p_1}\\right)^{(k-1)/k}",
                "T_2 = T_1\\left(\\frac{p_2}{p_1}\\right)^{(k-1)/k} \\qquad \\text{and} \\qquad p_2 = p_1\\left(\\frac{T_2}{T_1}\\right)^{k/(k-1)}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "thermodynamic temperature" },
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$k$", "definition": "specific heat ratio, $c_p / c_v$" },
                { "symbol": "$T_1, p_1$", "definition": "initial temperature and pressure" },
                { "symbol": "$T_2, p_2$", "definition": "final temperature and pressure" }
            ]
        }
    ],
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "k",
                "text": "Specific heat ratio, $k = c_p/c_v$",
                "choices": [
                    { "text": "1.67 — monatomic (e.g., He, Ne, Ar)", "value": "1.67" },
                    { "text": "1.4 — diatomic (e.g., air, N₂, O₂)", "value": "1.4" },
                    { "text": "1.33 — triatomic", "value": "1.33" }
                ],
                "initialChoiceIndex": 1,
                "notes": "Refer to the isentropic flow functions table for an ideal gas (Fluid Mechanics)."
            },
            {
                "type": "slider",
                "id": "T1",
                "text": "Initial temperature, $T_1$ [K]",
                "min": 300,
                "max": 1000,
                "step": 10,
                "initialValue": 500
            },
            {
                "type": "slider",
                "id": "p1",
                "text": "Initial pressure, $p_1$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 10,
                "initialValue": 400
            },
            {
                "type": "swap",
                "id": "spec",
                "text": "Specify the final state by",
                "options": [
                    {
                        "id": "p2",
                        "choiceText": "Final pressure, p₂",
                        "text": "Final pressure, $p_2$ [kPa]",
                        "min": 100,
                        "max": 1000,
                        "step": 1,
                        "initialValue": 800,
                        "formula": "p1 * pow(T2 / T1, k / (k - 1))"
                    },
                    {
                        "id": "T2",
                        "choiceText": "Final temperature, T₂",
                        "text": "Final temperature, $T_2$ [K]",
                        "min": 300,
                        "max": 1000,
                        "step": 1,
                        "initialValue": 700,
                        "formula": "T1 * pow(p2 / p1, (k - 1) / k)"
                    }
                ],
                "initialChoiceIndex": 0
            }
        ],
        "outputs": [],
        "outputColumns": 1
    },
    "plots": {
        "aspectRatio": 1.6,
        "settings": [
            {
                "showWhen": "spec == 'p2'",
                "x": "p2",
                "y": "T2",
                "xLabel": "$p_2$ [kPa]",
                "yLabel": "$T_2$ [K]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 200,
                "yMin": 0,
                "yMax": "T1 * pow(1000 / p1, (k - 1) / k) < 500 ? 500 : (T1 * pow(1000 / p1, (k - 1) / k) < 1500 ? 1500 : 3000)",
                "yTickInterval": "T1 * pow(1000 / p1, (k - 1) / k) < 500 ? 100 : 500",
                "points": [["p1", "T1"]],
                "pointColors": ["#111"],
                "pointLabels": [{ "text": "State 1", "location": "top right", "color": "#111" }]
            },
            {
                "showWhen": "spec == 'T2'",
                "x": "T2",
                "y": "p2",
                "xLabel": "$T_2$ [K]",
                "yLabel": "$p_2$ [kPa]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 100,
                "yMin": 0,
                "yMax": "p1 * pow(1000 / T1, k / (k - 1)) < 500 ? 500 : (p1 * pow(1000 / T1, k / (k - 1)) < 5000 ? 5000 : (p1 * pow(1000 / T1, k / (k - 1)) < 50000 ? 50000 : 150000))",
                "yTickInterval": "p1 * pow(1000 / T1, k / (k - 1)) < 500 ? 100 : (p1 * pow(1000 / T1, k / (k - 1)) < 5000 ? 1000 : (p1 * pow(1000 / T1, k / (k - 1)) < 50000 ? 10000 : 30000))",
                "points": [["T1", "p1"]],
                "pointColors": ["#111"],
                "pointLabels": [{ "text": "State 1", "location": "top right", "color": "#111" }]
            }
        ],
        "text": "The curve shows the calculated final-state variable vs the specified one for the current initial state and $k$; the black dot marks state 1. **Drag the marked point** or use the sliders above to change the final state."
    }
};
