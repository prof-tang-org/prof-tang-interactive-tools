/** @type {PageData} */
const pageData = {
    "title": "1-D Heat Transfer by Conduction",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.9fr",
                "mobile": "100%"
            }
        ],
        "breakpoint": "1024px"
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": []
        },
        {
            "type": "equations",
            "content": [
                "\\dot{Q}_{\\text{cond},x} = -kA\\,\\frac{T_2 - T_1}{L}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\dot{Q}_{\\text{cond},x}$", "definition": "heat transfer rate" },
                { "symbol": "$k$", "definition": "thermal conductivity of wall material" },
                { "symbol": "$A$", "definition": "wall area normal to the direction of heat transfer" },
                { "symbol": "$L$", "definition": "wall thickness in the direction of heat transfer" },
                { "symbol": "$T_1,\\,T_2$", "definition": "temperatures of the wall surfaces" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/2.31-eq.png",
        "alt": "Plane wall conduction schematic"
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "T2",
                "text": "$T_2$ — surface temperature [K], fixed",
                "value": 300
            }
        ],
        "inputs": [
            {
                "type": "slider-dropdown",
                "id": "k",
                "text": "Thermal conductivity, $k$ [W/(m·K)]",
                "min": 0.1,
                "max": 60,
                "step": 0.1,
                "initialValue": 52,
                "initialChoiceIndex": 1,
                "choices": [
                    { "text": "Custom (0.1–60 W/(m·K))", "value": "custom" },
                    { "text": "Carbon steel — 52 W/(m·K)", "value": "52" },
                    { "text": "Stainless steel — 15 W/(m·K)", "value": "15" },
                    { "text": "Concrete — 1 W/(m·K)", "value": "1" },
                    { "text": "Hard woods — 0.16 W/(m·K)", "value": "0.16" }
                ]
            },
            {
                "type": "slider",
                "id": "A",
                "text": "Wall area, $A$ [m²]",
                "min": 0.1,
                "max": 0.5,
                "step": 0.01,
                "initialValue": 0.3
            },
            {
                "type": "slider",
                "id": "L",
                "text": "Wall thickness, $L$ [m]",
                "min": 0.1,
                "max": 0.5,
                "step": 0.01,
                "initialValue": 0.2
            },
            {
                "type": "slider",
                "id": "T1",
                "text": "$T_1$ — surface temperature [K]",
                "min": 300,
                "max": 350,
                "step": 1,
                "initialValue": 330
            }
        ],
        "outputs": [
            {
                "id": "Q",
                "text": "Heat transfer rate, $\\dot{Q}_{\\text{cond},x}$ [kW]",
                "type": "calculation",
                "value": "k * A * (T1 - T2) / L / 1000",
                "decimals": 3
            }
        ]
    },
    "plots": {
        "aspectRatio": 1.6,
        "settings": [
            [
                {
                    "x": "k",
                    "y": "Q",
                    "width": "50%",
                    "xLabel": "$k$ [W/(m·K)]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 0.1,
                    "xMax": 60,
                    "xTickInterval": 10,
                    "yMin": 0,
                    "yMax": [0.1, 1, 4, 16]
                },
                {
                    "x": "A",
                    "y": "Q",
                    "width": "50%",
                    "xLabel": "$A$ [m²]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 0.1,
                    "xMax": 0.5,
                    "xTickInterval": 0.1,
                    "yMin": 0,
                    "yMax": [0.1, 1, 4, 16]
                }
            ],
            [
                {
                    "x": "L",
                    "y": "Q",
                    "width": "50%",
                    "xLabel": "$L$ [m]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 0.1,
                    "xMax": 0.5,
                    "xTickInterval": 0.1,
                    "yMin": 0,
                    "yMax": [0.1, 1, 4, 16]
                },
                {
                    "x": "T1",
                    "y": "Q",
                    "width": "50%",
                    "xLabel": "$T_1$ [K]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 300,
                    "xMax": 350,
                    "xTickInterval": 12.5,
                    "yMin": 0,
                    "yMax": [0.1, 1, 4, 16]
                }
            ]
        ],
        "text": "Each panel varies one variable across its full range while the other variables are held at current values. **Drag the marked point** or use the sliders above to see how the graphs and $\\dot{Q}_{\\text{cond},x}$ change."
    }
};
