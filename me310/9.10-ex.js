const pageData = {
    "title": "Terminal Velocity of Small Spherical Particles",
    "layout": {
        "grid": [
            { "desktop": "1.2fr 0.8fr", "mobile": "100%" },
            { "desktop": "0.7fr 1fr", "mobile": "100%" },
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Spherical particle settling down in a stationary fluid."
            ]
        },
        {
            "type": "equations",
            "content": [
                "U = \\frac{D^2 g (\\rho_{\\text{particle}} - \\rho_{\\text{fluid}})}{18 \\mu_{\\text{fluid}}}",
                "Re_D = \\frac{\\rho_{\\text{fluid}} U D}{\\mu_{\\text{fluid}}}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$U$", "definition": "terminal velocity" },
                { "symbol": "$D$", "definition": "diameter of particle" },
                { "symbol": "$g$", "definition": "gravitational acceleration" },
                { "symbol": "$\\rho_{\\text{particle}}$", "definition": "density of particle" },
                { "symbol": "$\\rho_{\\text{fluid}}$", "definition": "density of fluid" },
                { "symbol": "$\\mu_{\\text{fluid}}$", "definition": "dynamic viscosity of fluid" },
                { "symbol": "$Re_D$", "definition": "Reynolds number" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/9.10-ex.png",
        "alt": "Schematic of a spherical particle falling through a fluid, with forces and velocity vectors indicated."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "g",
                "text": "Gravitational acceleration, $g$ [m/s²]",
                "value": 9.81
            },
            {
                "id": "fluid",
                "text": "Fluid",
                "value": "Air"
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
                "id": "material",
                "text": "Material",
                "choices": [
                    {
                        "text": "Water droplet in air",
                        "value": "998.2"
                    },
                    {
                        "text": "Dust particle in air",
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
                "key": "material"
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
