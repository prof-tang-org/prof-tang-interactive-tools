/** @type {PageData} */
const pageData = {
    "title": "Prandtl-Blasius Boundary Layer Solution",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.8fr 1.2fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Prandtl-Blasius boundary layer solution"
        },
        {
            "type": "note",
            "text": "**Assumptions**: Steady, incompressible, viscous, laminar flow over a large flat plate."
        },
        {
            "type": "note",
            "text": "**Equations**"
        },
        {
            "type": "equation",
            "text": "\\delta = 5 \\sqrt{\\frac{\\nu x}{U}} = \\frac{5 x}{\\sqrt{Re_x}}"
        },
        {
            "type": "equation",
            "text": "\\tau_w = 0.332 U^{3/2} \\sqrt{\\frac{\\rho \\mu}{x}} = 0.332 \\rho U^2 Re_x^{-1/2}"
        },
        {
            "type": "equation",
            "text": "Re_x = \\frac{\\rho U x}{\\mu} = \\frac{U x}{\\nu}"
        },
        {
            "type": "list",
            "header": "Variables",
            "content": [
                {
                    "text": "$\\delta$ — boundary layer thickness"
                },
                {
                    "text": "$\\tau_w$ — wall shear stress"
                },
                {
                    "text": "$Re_x$ — Reynolds number"
                },
                {
                    "text": "$U$ — upstream/free stream velocity"
                },
                {
                    "text": "$x$ — distance measured from the leading edge"
                },
                {
                    "text": "$\\rho$ — density"
                },
                {
                    "text": "$\\mu$ — dynamic viscosity"
                },
                {
                    "text": "$\\nu$ — kinematic viscosity"
                }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/9.15-eq.png",
        "alt": "Schematic of flow over a flat plate showing the development of a boundary layer from the leading edge."
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Fluid Type",
                "choices": [
                    {
                        "text": "Water",
                        "value": "water"
                    },
                    {
                        "text": "Air",
                        "value": "air"
                    }
                ]
            },
            {
                "type": "slider",
                "id": "U",
                "text": "Upstream Velocity, $U$ [m/s]",
                "min": 0.1,
                "max": 1,
                "initialValue": 0.6,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "x",
                "text": "Distance, $x$ [m]",
                "min": 0.01,
                "max": 0.2,
                "initialValue": 0.15,
                "step": 0.01
            }
        ],
        "outputs": [
            {
                "text": "Fluid Density, $\\rho$ [kg/m³]",
                "id": "rho",
                "type": "map",
                "value": [998.2, 1.204],
                "key": "fluid"
            },
            {
                "text": "Dynamic Viscosity, $\\mu$ [Pa·s]",
                "id": "mu",
                "type": "map",
                "value": [1.002e-3, 1.820e-5],
                "key": "fluid"
            },
            {
                "text": "Kinematic Viscosity, $\\nu$ [m²/s]",
                "id": "nu",
                "type": "calculation",
                "value": "mu / rho"
            },
            {
                "text": "Reynolds Number, $Re_x$",
                "id": "reynolds",
                "type": "calculation",
                "value": "U * x / nu"
            },
            {
                "text": "Boundary Layer Thickness, $\\delta$ [mm]",
                "id": "delta-mm",
                "type": "calculation",
                "value": "5 * x / sqrt(reynolds) * 1000"
            },
            {
                "text": "Wall Shear Stress, $\\tau_w$ [Pa]",
                "id": "shear-stress",
                "type": "calculation",
                "value": "0.332 * pow(U, 1.5) * sqrt(rho * mu / x)"
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            {
                "x": "x",
                "y": "delta-mm",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$\\delta \\text{ [mm]}$",
                "xMin": 0.01,
                "xMax": 0.2,
                "yMin": 0,
                "yMax": [2.5, 10],
                "yTickInterval": [0.5, 2],
                "reference": [
                    {
                        "U": 1.0,
                        "text": "$U = 1\\text{ m/s}$",
                        "labelPosition": "above"
                    }
                ]
            },
            {
                "x": "x",
                "y": "shear-stress",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$\\tau_w \\text{ [Pa]}$",
                "xMin": 0.01,
                "xMax": 0.2,
                "yMin": 0,
                "yMax": [0.004, 0.8],
                "yTickInterval": [0.0005, 0.1],
                "reference": [
                    {
                        "U": 1.0,
                        "text": "$U = 1\\text{ m/s}$",
                        "labelPosition": "above"
                    }
                ]
            }
        ],
        "text": "Drag the point or change the inputs to analyze how boundary layer thickness $\\delta$ and wall shear stress $\\tau_w$ vary along the plate ($x$). Note the dynamic Y-scaling when toggling between Water and Air! The dashed line represents the reference state at $U = 1\\text{ m/s}$."
    }
};
