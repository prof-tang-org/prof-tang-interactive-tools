/** @type {PageData} */
const pageData = {
    "title": "Isentropic Process T-v Relation of Ideal Gases with Constant Specific Heats",
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
                "\\frac{T_2}{T_1} = \\left(\\frac{v_1}{v_2}\\right)^{k-1}",
                "T_2 = T_1\\left(\\frac{v_1}{v_2}\\right)^{k-1} \\qquad \\text{and} \\qquad v_2 = v_1\\left(\\frac{T_1}{T_2}\\right)^{1/(k-1)}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "thermodynamic temperature" },
                { "symbol": "$v$", "definition": "specific volume" },
                { "symbol": "$k$", "definition": "specific heat ratio, $c_p / c_v$" },
                { "symbol": "$T_1, v_1$", "definition": "initial temperature and specific volume" },
                { "symbol": "$T_2, v_2$", "definition": "final temperature and specific volume" }
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
                        "id": "v2",
                        "choiceText": "Final specific volume, v₂",
                        "text": "Final specific volume, $v_2$ [m³/kg]",
                        "min": 0.1,
                        "max": 1,
                        "step": 0.01,
                        "initialValue": 0.8,
                        "formula": "v1 * pow(T1 / T2, 1 / (k - 1))"
                    },
                    {
                        "id": "T2",
                        "choiceText": "Final temperature, T₂",
                        "text": "Final temperature, $T_2$ [K]",
                        "min": 300,
                        "max": 1000,
                        "step": 1,
                        "initialValue": 800,
                        "formula": "T1 * pow(v1 / v2, k - 1)"
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
                "showWhen": "spec == 'v2'",
                "mode": "standard",
                "x": "v2",
                "y": "T2",
                "xLabel": "$v_2$ [m³/kg]",
                "yLabel": "$T_2$ [K]",
                "xMin": 0,
                "xMax": 1,
                "xTickInterval": 0.2,
                "yMin": 0,
                "yMax": "T1 * pow(v1 / 0.1, k - 1) < 1000 ? 1000 : 5000",
                "yTickInterval": "T1 * pow(v1 / 0.1, k - 1) < 1000 ? 200 : 1000",
                "points": [["v1", "T1"]],
                "pointColors": ["#111"],
                "pointLabels": [{ "text": "State 1", "location": "top right", "color": "#111" }]
            },
            {
                "showWhen": "spec == 'T2'",
                "mode": "standard",
                "x": "T2",
                "y": "v2",
                "xLabel": "$T_2$ [K]",
                "yLabel": "$v_2$ [m³/kg]",
                "xMin": 0,
                "xMax": 1000,
                "xTickInterval": 100,
                "yMin": 0,
                "yMax": "v1 * pow(T1 / 300, 1 / (k - 1)) < 0.5 ? 0.5 : (v1 * pow(T1 / 300, 1 / (k - 1)) < 5 ? 5 : 50)",
                "yTickInterval": "v1 * pow(T1 / 300, 1 / (k - 1)) < 0.5 ? 0.1 : (v1 * pow(T1 / 300, 1 / (k - 1)) < 5 ? 1 : 10)",
                "points": [["T1", "v1"]],
                "pointColors": ["#111"],
                "pointLabels": [{ "text": "State 1", "location": "top right", "color": "#111" }]
            }
        ],
        "text": "The curve shows the calculated final-state variable vs the specified one for the current initial state and $k$; the black dot marks state 1. **Drag the marked point** or use the sliders above to change the final state."
    }
};
