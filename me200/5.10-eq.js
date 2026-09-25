/** @type {PageData} */
const pageData = {
    "title": "Coefficient of Performance of Reversible Refrigeration Cycles",
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
                "Reversible refrigeration cycle working between the given hot and cold reservoirs."
            ]
        },
        {
            "type": "header",
            "text": "Equation"
        },
        {
            "type": "equation",
            "text": "\\beta = \\frac{Q_C}{W_R} = \\frac{Q_C}{Q_H - Q_C} = \\frac{T_C}{T_H - T_C}"
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\beta$", "definition": "coefficient of performance of the reversible refrigeration cycle" },
                { "symbol": "$Q_H$", "definition": "heat rejection to the hot reservoir" },
                { "symbol": "$Q_C$", "definition": "heat absorption from the cold reservoir" },
                { "symbol": "$W_R$", "definition": "work input to the reversible refrigeration cycle" },
                { "symbol": "$T_H$", "definition": "thermodynamic temperature of the hot reservoir" },
                { "symbol": "$T_C$", "definition": "thermodynamic temperature of the cold reservoir" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/5.10-eq.png",
        "alt": "Carnot refrigeration cycle schematic"
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "TH",
                "text": "Hot reservoir temperature, $T_H$ [K]",
                "min": 275,
                "max": 325,
                "step": 1,
                "initialValue": 298
            },
            {
                "type": "slider",
                "id": "TC",
                "text": "Cold reservoir temperature, $T_C$ [K]",
                "min": 0,
                "max": "min(TH - 10, 265)",
                "step": 1,
                "initialValue": 200
            }
        ],
        "outputs": [
            {
                "id": "beta",
                "text": "Coefficient of performance, $\\beta$",
                "type": "calculation",
                "value": "TH > TC && TC > 0 ? TC / (TH - TC) : 0",
                "decimals": 4
            }
        ]
    },
    "plots": {
        "aspectRatio": 2.86,
        "settings": [
            {
                "x": "TC",
                "y": "beta",
                "xLabel": "$T_C$ [K]",
                "yLabel": "$\\beta$",
                "xMin": 0,
                "xMax": 300,
                "xTickInterval": 50,
                "yMin": 0,
                "yMax": 30,
                "yTickInterval": 5,
                "activeLabel": "$T_H = {TH}$ K",
                "reference": [
                    { "TH": 275, "text": "$T_H = 275$ K", "labelPosition": "above" },
                    { "TH": 325, "text": "$T_H = 325$ K", "labelPosition": "below" }
                ]
            }
        ],
        "text": "The curve shows $\\beta$ vs $T_C$ at the current $T_H$; the gray dashed curves show the envelope across the full $T_H$ range. **Drag the marked point** or use the sliders above to see how $\\beta$ changes."
    }
};
