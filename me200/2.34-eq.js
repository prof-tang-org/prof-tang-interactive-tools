/** @type {PageData} */
const pageData = {
    "title": "Convection Heat Transfer",
    "layout": {
        "grid": [
            {
                "desktop": "1.3fr 0.8fr",
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
                "A fluid with a uniform bulk temperature flows over a surface maintained at a uniform temperature steadily.",
                "The convection heat transfer coefficient is constant."
            ]
        },
        {
            "type": "header",
            "text": "Equation"
        },
        {
            "type": "equation",
            "text": "\\dot{Q}_{\\text{conv}} = h\\,A\\,(T_s - T_\\infty)"
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\dot{Q}_{\\text{conv}}$", "definition": "heat transfer rate" },
                { "symbol": "$h$", "definition": "convection heat transfer coefficient" },
                { "symbol": "$A$", "definition": "area of the surface" },
                { "symbol": "$T_s,\\,T_\\infty$", "definition": "temperatures of the surface and the fluid, respectively" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/2.34-eq.png",
        "alt": "Convection heat transfer schematic"
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "T-inf",
                "text": "$T_\\infty$ — fluid temperature [K], fixed",
                "value": 300
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "h",
                "text": "Convection coefficient, $h$ [W/(m²·K)]",
                "min": 10,
                "max": 1000,
                "step": 10,
                "initialValue": 500
            },
            {
                "type": "slider",
                "id": "A",
                "text": "Surface area, $A$ [m²]",
                "min": 0.1,
                "max": 0.5,
                "step": 0.01,
                "initialValue": 0.3
            },
            {
                "type": "slider",
                "id": "Ts",
                "text": "Surface temperature, $T_s$ [K]",
                "min": 300,
                "max": 350,
                "step": 1,
                "initialValue": 325
            }
        ],
        "outputs": [
            {
                "id": "Q",
                "text": "Heat transfer rate, $\\dot{Q}_{\\text{conv}}$ [kW]",
                "type": "calculation",
                "value": "h * A * (Ts - T-inf) / 1000",
                "decimals": 3
            }
        ]
    },
    "plots": {
        "aspectRatio": 1,
        "settings": [
            [
                {
                    "x": "h",
                    "y": "Q",
                    "width": "33.33%",
                    "xLabel": "$h$ [W/(m²·K)]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 0,
                    "xMax": 1000,
                    "xTickInterval": 200,
                    "yMin": 0,
                    "yMax": "Q < 6 ? 6 : 30",
                    "yTickInterval": "Q < 6 ? 1.5 : 7.5"
                },
                {
                    "x": "A",
                    "y": "Q",
                    "width": "33.33%",
                    "xLabel": "$A$ [m²]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 0,
                    "xMax": 0.5,
                    "xTickInterval": 0.1,
                    "yMin": 0,
                    "yMax": "Q < 6 ? 6 : 30",
                    "yTickInterval": "Q < 6 ? 1.5 : 7.5"
                },
                {
                    "x": "Ts",
                    "y": "Q",
                    "width": "33.33%",
                    "xLabel": "$T_s$ [K]",
                    "yLabel": "$\\dot{Q}$ [kW]",
                    "xMin": 300,
                    "xMax": 350,
                    "xTickInterval": 10,
                    "yMin": 0,
                    "yMax": "Q < 6 ? 6 : 30",
                    "yTickInterval": "Q < 6 ? 1.5 : 7.5"
                }
            ]
        ],
        "text": "Each panel varies one variable across its full range while the other variables are held at current values. **Drag the marked point** or use the sliders above to see how the graphs and $\\dot{Q}_{\\text{conv}}$ change."
    }
};
