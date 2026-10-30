/** @type {PageData} */
const pageData = {
    "title": "Isentropic Process p-v Relation of Ideal Gases with Constant Specific Heats",
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
                "\\frac{p_2}{p_1} = \\left(\\frac{v_1}{v_2}\\right)^{k}",
                "v_2 = v_1\\left(\\frac{p_1}{p_2}\\right)^{1/k} \\qquad \\text{and} \\qquad p_2 = p_1\\left(\\frac{v_1}{v_2}\\right)^{k}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$v$", "definition": "specific volume" },
                { "symbol": "$p$", "definition": "absolute pressure" },
                { "symbol": "$k$", "definition": "specific heat ratio, $c_p / c_v$" },
                { "symbol": "$p_1, v_1$", "definition": "initial pressure and specific volume" },
                { "symbol": "$p_2, v_2$", "definition": "final pressure and specific volume" }
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
                "id": "p1",
                "text": "Initial pressure, $p_1$ [kPa]",
                "min": 100,
                "max": 1000,
                "step": 10,
                "initialValue": 300
            },
            {
                "type": "slider",
                "id": "v1",
                "text": "Initial specific volume, $v_1$ [m³/kg]",
                "min": 0.1,
                "max": 1,
                "step": 0.01,
                "initialValue": 0.4
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
                        "initialValue": 600,
                        "formula": "p1 * pow(v1 / v2, k)"
                    },
                    {
                        "id": "v2",
                        "choiceText": "Final specific volume, v₂",
                        "text": "Final specific volume, $v_2$ [m³/kg]",
                        "min": 0.1,
                        "max": 1,
                        "step": 0.01,
                        "initialValue": 0.8,
                        "formula": "v1 * pow(p1 / p2, 1 / k)"
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
                "y": "v2",
                "xLabel": "$p_2$ [kPa]",
                "yLabel": "$v_2$ [m³/kg]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 200,
                "yMin": 0,
                "yMax": "v1 * pow(p1 / 100, 1 / k) < 0.8 ? 0.8 : 6",
                "yTickInterval": "v1 * pow(p1 / 100, 1 / k) < 0.8 ? 0.2 : 1",
                "points": [["p1", "v1"]],
                "pointColors": ["#111"],
                "pointLabels": [{ "text": "State 1", "location": "top right", "color": "#111" }]
            },
            {
                "showWhen": "spec == 'v2'",
                "x": "v2",
                "y": "p2",
                "xLabel": "$v_2$ [m³/kg]",
                "yLabel": "$p_2$ [kPa]",
                "xMin": 0,
                "xMax": 1,
                "xTickInterval": 0.2,
                "yMin": 0,
                "yMax": "p1 * pow(v1 / 0.1, k) < 1000 ? 1000 : (p1 * pow(v1 / 0.1, k) < 10000 ? 10000 : 50000)",
                "yTickInterval": "p1 * pow(v1 / 0.1, k) < 1000 ? 200 : (p1 * pow(v1 / 0.1, k) < 10000 ? 2000 : 10000)",
                "points": [["v1", "p1"]],
                "pointColors": ["#111"],
                "pointLabels": [{ "text": "State 1", "location": "top right", "color": "#111" }]
            }
        ],
        "text": "The curve shows the calculated final-state variable vs the specified one for the current initial state and $k$; the black dot marks state 1. **Drag the marked point** or use the sliders above to change the final state."
    }
};
