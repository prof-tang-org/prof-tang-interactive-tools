const maxH = "max(0.06*l*pow(V,2)/(D*2*g), f*10*pow(V,2)/(D*2*g), f*l*pow(V,2)/(0.01*2*g), f*l*25/(D*2*g))";
const yMaxExpr = `${maxH} < 0.5 ? 0.5 : (${maxH} < 5 ? 5 : (${maxH} < 50 ? 50 : 80))`;
const yTickExpr = `${maxH} < 0.5 ? 0.1 : (${maxH} < 5 ? 1 : (${maxH} < 50 ? 10 : 20))`;

/** @type {PageData} */
const pageData = {
    "title": "Major Head Loss",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "2fr 1fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "equations",
            "content": [
                "h_{L,\\text{major}} = f \\frac{l}{D} \\frac{V^2}{2g}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$h_{L,\\text{major}}$", "definition": "major head loss" },
                { "symbol": "$f$", "definition": "friction factor" },
                { "symbol": "$l$", "definition": "length of pipe" },
                { "symbol": "$D$", "definition": "inner diameter of pipe" },
                { "symbol": "$V$", "definition": "mean velocity" },
                { "symbol": "$g$", "definition": "gravitational acceleration" }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational Acceleration, $g$ [m/s²]",
                "value": 9.81
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "f",
                "text": "Friction Factor, $f$",
                "min": 0.01,
                "max": 0.06,
                "initialValue": 0.025,
                "step": 0.001
            },
            {
                "type": "slider",
                "id": "l",
                "text": "Length of Pipe, $l$ [m]",
                "min": 1,
                "max": 10,
                "initialValue": 6,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "D",
                "text": "Inner Diameter of Pipe, $D$ [m]",
                "min": 0.01,
                "max": 0.1,
                "initialValue": 0.04,
                "step": 0.001
            },
            {
                "type": "slider",
                "id": "V",
                "text": "Mean Velocity, $V$ [m/s]",
                "min": 1,
                "max": 5,
                "initialValue": 2,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "id": "h_L_major",
                "text": "Major Head Loss, $h_{L,\\text{major}}$ [m]",
                "type": "calculation",
                "value": "f * l * pow(V, 2) / (D * 2 * g)"
            }
        ]
    },
    "plots": {
        "aspectRatio": 2.75,
        "settings": [
            {
                "x": "f",
                "y": "h_L_major",
                "xLabel": "$f$",
                "yLabel": "$h_{L,\\text{major}} \\text{ [m]}$",
                "xMin": 0,
                "xMax": 0.06,
                "xTickInterval": 0.01,
                "yMin": 0,
                "yMax": yMaxExpr,
                "yTickInterval": yTickExpr
            },
            {
                "x": "l",
                "y": "h_L_major",
                "xLabel": "$l \\text{ [m]}$",
                "yLabel": "$h_{L,\\text{major}} \\text{ [m]}$",
                "xMin": 0,
                "xMax": 10,
                "xTickInterval": 2,
                "yMin": 0,
                "yMax": yMaxExpr,
                "yTickInterval": yTickExpr
            },
            {
                "x": "D",
                "y": "h_L_major",
                "xLabel": "$D \\text{ [m]}$",
                "yLabel": "$h_{L,\\text{major}} \\text{ [m]}$",
                "xMin": 0,
                "xMax": 0.1,
                "xTickInterval": 0.02,
                "yMin": 0,
                "yMax": yMaxExpr,
                "yTickInterval": yTickExpr
            },
            {
                "x": "V",
                "y": "h_L_major",
                "xLabel": "$V \\text{ [m/s]}$",
                "yLabel": "$h_{L,\\text{major}} \\text{ [m]}$",
                "xMin": 0,
                "xMax": 5,
                "xTickInterval": 1,
                "yMin": 0,
                "yMax": yMaxExpr,
                "yTickInterval": yTickExpr
            }
        ],
        "text": "Drag the point or change the inputs to analyze how the major head loss ($h_{L,\\text{major}}$) varies with friction factor $f$, length of pipe $l$, inner diameter of pipe $D$, and mean velocity $V$. Note that all plots share the same dynamic Y-axis scale based on the maximum head loss across all four plots: $[0, 0.5]\\text{ m}$ if $h_{L,\\text{major,max}} < 0.5\\text{ m}$, $[0, 5]\\text{ m}$ if $0.5\\text{ m} \\le h_{L,\\text{major,max}} < 5\\text{ m}$, $[0, 50]\\text{ m}$ if $5\\text{ m} \\le h_{L,\\text{major,max}} < 50\\text{ m}$, and $[0, 80]\\text{ m}$ if $h_{L,\\text{major,max}} \\ge 50\\text{ m}$."
    }
};
