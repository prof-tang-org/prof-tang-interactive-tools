/** @type {PageData} */
const pageData = {
    "title": "Terminal Velocity of Small Spherical Particles",
    "layout": {
        "grid": [
            { "desktop": "1.2fr 0.8fr", "mobile": "100%" }, // skipped since no schematic
            { "desktop": "0.7fr 1fr", "mobile": "100%" },
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Terminal velocity of small spherical particles"
        },
        {
            "type": "note",
            "text": "**Assumptions**: Spherical particle settling down in a stationary fluid with $Re_D < 1$."
        },
        {
            "type": "note",
            "text": "**Equations**"
        },
        {
            "type": "equation",
            "text": "U = \\frac{D^2 g (\\rho_{\\text{particle}} - \\rho_{\\text{fluid}})}{18 \\mu_{\\text{fluid}}}"
        },
        {
            "type": "equation",
            "text": "Re_D = \\frac{\\rho_{\\text{fluid}} U D}{\\mu_{\\text{fluid}}}"
        },
        {
            "type": "list",
            "header": "Variables",
            "content": [
                {
                    "text": "$U$ — terminal velocity"
                },
                {
                    "text": "$D$ — diameter of particle"
                },
                {
                    "text": "$g$ — gravitational acceleration"
                },
                {
                    "text": "$\\rho_{\\text{particle}}$ — density of particle"
                },
                {
                    "text": "$\\rho_{\\text{fluid}}$ — density of fluid"
                },
                {
                    "text": "$\\mu_{\\text{fluid}}$ — dynamic viscosity of fluid"
                },
                {
                    "text": "$Re_D$ — Reynolds number"
                }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational acceleration, $g$ [m/s²]",
                "value": 9.81
            },
            {
                "id": "rho-fluid",
                "text": "Fluid Density, $\\rho_{\\text{fluid}}$ [kg/m³]",
                "value": 1.204
            },
            {
                "id": "mu-fluid",
                "text": "Fluid Dynamic Viscosity, $\\mu_{\\text{fluid}}$ [Pa·s]",
                "value": 1.820e-5
            }
        ],
        "inputs": [
            {
                "type": "dropdown",
                "id": "particle-type",
                "text": "Particle Type",
                "choices": [
                    {
                        "text": "Water droplet in air (ρ = 998.2 kg/m³)",
                        "value": "998.2"
                    },
                    {
                        "text": "Dust particle in air (ρ = 2500 kg/m³)",
                        "value": "2500"
                    }
                ]
            },
            {
                "type": "slider",
                "id": "diameter-mm",
                "text": "Particle Diameter, $D$ [mm]",
                "min": 0.005,
                "max": 0.05,
                "initialValue": 0.03,
                "step": 0.001
            }
        ],
        "outputs": [
            {
                "text": "Particle Density, $\\rho_{\\text{particle}}$ [kg/m³]",
                "id": "rho-particle",
                "type": "map",
                "value": [998.2, 2500],
                "key": "particle-type"
            },
            {
                "text": "Terminal Velocity, $U$ [m/s]",
                "id": "velocity",
                "type": "calculation",
                "value": "((diameter-mm / 1000) * (diameter-mm / 1000) * g * (rho-particle - rho-fluid)) / (18 * mu-fluid)"
            },
            {
                "text": "Reynolds Number, $Re_D$",
                "id": "reynolds",
                "type": "calculation",
                "value": "(rho-fluid * velocity * (diameter-mm / 1000)) / mu-fluid"
            }
        ]
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            {
                "x": "diameter-mm",
                "y": "velocity",
                "xLabel": "$D \\text{ [mm]}$",
                "yLabel": "$U \\text{ [m/s]}$",
                "xMin": 0,
                "xMax": 0.05,
                "yMin": 0,
                "yMax": 0.2,
                "xTickInterval": 0.01,
                "yTickInterval": 0.05
            }
        ],
        "text": "Drag the point or change the inputs to analyze how the particle diameter and type affect the terminal velocity."
    }
};
