/** @type {PageData} */
const pageData = {
    "title": "Radiation Heat Transfer",
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
                "Radiation exchange between a small surface and a large surrounding surface, i.e., a large enclosure.",
                "Both surfaces are maintained at uniform, constant temperatures."
            ]
        },
        {
            "type": "header",
            "text": "Equation"
        },
        {
            "type": "equation",
            "text": "\\dot{Q}_{\\text{rad}} = \\varepsilon\\,\\sigma\\,A\\,\\bigl(T_s^4 - T_{\\text{sur}}^4\\bigr)"
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\dot{Q}_{\\text{rad}}$", "definition": "heat transfer rate" },
                { "symbol": "$\\varepsilon$", "definition": "emissivity of the small surface" },
                { "symbol": "$\\sigma$", "definition": "Stefan–Boltzmann constant, $5.67\\times10^{-8}\\ \\text{W/(m}^2\\text{·K}^4\\text{)}$" },
                { "symbol": "$A$", "definition": "area of the small surface" },
                { "symbol": "$T_s,\\,T_{\\text{sur}}$", "definition": "thermodynamic temperatures of the small surface and the large surrounding surface, respectively" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/2.33-eq.png",
        "alt": "Radiation heat transfer schematic"
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "T-sur",
                "text": "$T_{\\text{sur}}$ — surrounding temperature [K], fixed",
                "value": 300
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "eps",
                "text": "Emissivity, $\\varepsilon$ [-]",
                "min": 0.1,
                "max": 1,
                "step": 0.01,
                "initialValue": 0.5
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
                "max": 500,
                "step": 1,
                "initialValue": 400
            }
        ],
        "outputs": [
            {
                "id": "Q",
                "text": "Heat transfer rate, $\\dot{Q}_{\\text{rad}}$ [W]",
                "type": "calculation",
                "value": "eps * 5.67e-8 * A * (pow(Ts, 4) - pow(T-sur, 4))",
                "decimals": 2
            }
        ]
    },
    "plots": {
        "aspectRatio": 1,
        "settings": [
            [
                {
                    "x": "eps",
                    "y": "Q",
                    "width": "33.33%",
                    "xLabel": "$\\varepsilon$ [-]",
                    "yLabel": "$\\dot{Q}$ [W]",
                    "xMin": 0,
                    "xMax": 1,
                    "xTickInterval": 0.2,
                    "yMin": 0,
                    "yMax": [100, 400, 1600],
                    "yTickInterval": [25, 100, 400]
                },
                {
                    "x": "A",
                    "y": "Q",
                    "width": "33.33%",
                    "xLabel": "$A$ [m²]",
                    "yLabel": "$\\dot{Q}$ [W]",
                    "xMin": 0,
                    "xMax": 0.5,
                    "xTickInterval": 0.1,
                    "yMin": 0,
                    "yMax": [100, 400, 1600],
                    "yTickInterval": [25, 100, 400]
                },
                {
                    "x": "Ts",
                    "y": "Q",
                    "width": "33.33%",
                    "xLabel": "$T_s$ [K]",
                    "yLabel": "$\\dot{Q}$ [W]",
                    "xMin": 300,
                    "xMax": 500,
                    "xTickInterval": 50,
                    "yMin": 0,
                    "yMax": [100, 400, 1600],
                    "yTickInterval": [25, 100, 400]
                }
            ]
        ],
        "text": "Each panel varies one variable across its full range while the other variables are held at current values. **Drag the marked point** or use the sliders above to see how the graphs and $\\dot{Q}_{\\text{rad}}$ change."
    }
};
