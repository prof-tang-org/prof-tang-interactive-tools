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
            "type": "assumptions",
            "content": [
                "Steady, incompressible, viscous, laminar flow over a large flat plate."
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\delta = 5 \\sqrt{\\frac{\\nu x}{U}} = \\frac{5 x}{\\sqrt{Re_x}}",
                "\\tau_w = 0.332 U^{3/2} \\sqrt{\\frac{\\rho \\mu}{x}} = 0.332 \\rho U^2 Re_x^{-1/2}",
                "Re_x = \\frac{\\rho U x}{\\mu} = \\frac{U x}{\\mu / \\rho} = \\frac{U x}{\\nu}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\delta$", "definition": "boundary layer thickness" },
                { "symbol": "$\\tau_w$", "definition": "wall shear stress" },
                { "symbol": "$Re_x$", "definition": "Reynolds number" },
                { "symbol": "$U$", "definition": "upstream/free stream velocity" },
                { "symbol": "$x$", "definition": "distance measured from the leading edge" },
                { "symbol": "$\\rho$", "definition": "density" },
                { "symbol": "$\\mu$", "definition": "dynamic viscosity" },
                { "symbol": "$\\nu$", "definition": "kinematic viscosity" }
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
                "min": 0.2,
                "max": 1,
                "initialValue": 0.6,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "x",
                "text": "Distance, $x$ [m]",
                "min": 0.03,
                "max": 0.2,
                "initialValue": 0.15,
                "step": 0.001
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
                "xMin": 0,
                "xMax": 0.2,
                "yMin": 0,
                "yMax": [6, 20],
                "yTickInterval": [1, 4],
                "key": "fluid",
                "reference": [
                    {
                        "U": 1.0,
                        "text": "$U = 1\\text{ m/s}$",
                        "labelPosition": "below"
                    }
                ]
            },
            {
                "x": "x",
                "y": "shear-stress",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$\\tau_w \\text{ [Pa]}$",
                "xMin": 0,
                "xMax": 0.2,
                "yMin": 0,
                "yMax": [2, 0.009],
                "yTickInterval": [0.2, 0.001],
                "key": "fluid",
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
