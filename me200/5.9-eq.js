/** @type {PageData} */
const pageData = {
    "title": "Thermal Efficiency of Reversible Power Cycles",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.5fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.8fr 1.3fr",
                "mobile": "100%"
            }
        ],
        "breakpoint": "1024px"
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Reversible power cycle working between the given hot and cold reservoirs."
            ]
        },
        {
            "type": "header",
            "text": "Equation"
        },
        {
            "type": "equation",
            "text": "\\eta = \\frac{W_R}{Q_H} = \\frac{Q_H - Q_C}{Q_H} = \\frac{T_H - T_C}{T_H} = 1 - \\frac{T_C}{T_H}"
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\eta$", "definition": "thermal efficiency of the reversible power cycle" },
                { "symbol": "$Q_H$", "definition": "heat absorption from the hot reservoir" },
                { "symbol": "$Q_C$", "definition": "heat rejection to the cold reservoir" },
                { "symbol": "$W_R$", "definition": "work output of the reversible power cycle" },
                { "symbol": "$T_H$", "definition": "thermodynamic temperature of the hot reservoir" },
                { "symbol": "$T_C$", "definition": "thermodynamic temperature of the cold reservoir" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/5.9-eq.png",
        "alt": "Carnot power cycle schematic"
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
                "min": "max(325, TC + 1)",
                "max": 2000,
                "step": 1,
                "initialValue": 1000
            }
        ],
        "outputs": [
            {
                "id": "eta",
                "text": "Thermal efficiency, $\\eta$",
                "type": "calculation",
                "value": "TH > TC ? (TH - TC) / TH : 0",
                "decimals": 4
            }
        ]
    },
    "plots": {
        "aspectRatio": 1.6,
        "settings": [
            {
                "x": "TH",
                "y": "eta",
                "xLabel": "$T_H$ [K]",
                "yLabel": "$\\eta$",
                "xMin": 0,
                "xMax": 2000,
                "xTickInterval": 250,
                "yMin": 0,
                "yMax": 1,
                "yTickInterval": 0.1,
                "activeLabel": "$T_C = {TC}$ K",
                "reference": [
                    { "TC": 275, "text": "$T_C = 275$ K", "labelPosition": "above" },
                    { "TC": 325, "text": "$T_C = 325$ K", "labelPosition": "below" }
                ]
            }
        ],
        "text": "The curve shows $\\eta$ vs $T_H$ at the current $T_C$; the gray dashed curves show the envelope across the full $T_C$ range. **Drag the marked point** or use the sliders above to see how $\\eta$ changes."
    }
};
