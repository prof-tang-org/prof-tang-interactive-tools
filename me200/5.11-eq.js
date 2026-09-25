/** @type {PageData} */
const pageData = {
    "title": "Coefficient of Performance of Reversible Heat Pump Cycles",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            }
        ],
        "breakpoint": "1024px"
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Reversible heat pump cycle working between the given hot and cold reservoirs."
            ]
        },
        {
            "type": "header",
            "text": "Equation"
        },
        {
            "type": "equation",
            "text": "\\gamma = \\frac{Q_H}{W_R} = \\frac{Q_H}{Q_H - Q_C} = \\frac{T_H}{T_H - T_C}"
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\gamma$", "definition": "coefficient of performance of the reversible heat pump cycle" },
                { "symbol": "$Q_H$", "definition": "heat rejection to the hot reservoir" },
                { "symbol": "$Q_C$", "definition": "heat absorption from the cold reservoir" },
                { "symbol": "$W_R$", "definition": "work input to the reversible heat pump cycle" },
                { "symbol": "$T_H$", "definition": "thermodynamic temperature of the hot reservoir" },
                { "symbol": "$T_C$", "definition": "thermodynamic temperature of the cold reservoir" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/5.11-eq.png",
        "alt": "Reversible heat pump cycle schematic"
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "TC",
                "text": "Cold reservoir temperature, $T_C$ [K]",
                "min": 275,
                "max": 325,
                "step": 1,
                "initialValue": 298
            },
            {
                "type": "slider",
                "id": "TH",
                "text": "Hot reservoir temperature, $T_H$ [K]",
                "min": "max(335, TC + 10)",
                "max": 500,
                "step": 1,
                "initialValue": 400
            }
        ],
        "outputs": [
            {
                "id": "gamma",
                "text": "Coefficient of performance, $\\gamma$",
                "type": "calculation",
                "value": "TH > TC ? TH / (TH - TC) : 0",
                "decimals": 4
            }
        ]
    },
    "plots": {
        "aspectRatio": 2.86,
        "settings": [
            {
                "x": "TH",
                "y": "gamma",
                "xLabel": "$T_H$ [K]",
                "yLabel": "$\\gamma$",
                "xMin": 300,
                "xMax": 500,
                "xTickInterval": 50,
                "yMin": 0,
                "yMax": 35,
                "yTickInterval": 5,
                "activeLabel": "$T_C = {TC}$ K",
                "reference": [
                    { "TC": 275, "text": "$T_C = 275$ K", "labelPosition": "below" },
                    { "TC": 325, "text": "$T_C = 325$ K", "labelPosition": "above" }
                ]
            }
        ],
        "text": "The curve shows $\\gamma$ vs $T_H$ at the current $T_C$; the gray dashed curves show the envelope across the full $T_C$ range. **Drag the marked point** or use the sliders above to see how $\\gamma$ changes."
    }
};
