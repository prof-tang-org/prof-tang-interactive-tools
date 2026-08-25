/** @type {PageData} */
const pageData = {
    "title": "Pipe Flow & Reynolds Number",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            }
        ],
        "breakpoint": "768px"
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Steady, incompressible fluid flow in a circular pipe",
                "Fully developed flow regime"
            ]
        },
        {
            "type": "equations",
            "content": [
                "Re = \\frac{\\rho V D}{\\mu}",
                "'where the friction factor for laminar flow is:'",
                "f = \\frac{64}{Re}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$Re$", "definition": "Reynolds number" },
                { "symbol": "$\\rho$", "definition": "density" },
                { "symbol": "$V$", "definition": "velocity" },
                { "symbol": "$D$", "definition": "pipe diameter" },
                { "symbol": "$\\mu$", "definition": "dynamic viscosity" },
                { "symbol": "$f$", "definition": "Darcy friction factor" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/sample-schem.png",
        "alt": "A visual diagram of the sample concept."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "fluid-type",
                "text": "Selected Fluid",
                "value": "Water"
            },
            {
                "id": "roughness-eps",
                "text": "Roughness, $\\varepsilon$ [mm]",
                "type": "calculation",
                "value": "fluid == 'water' ? 0.045 : 0.015",
                "decimals": 3
            }
        ],
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Fluid Type",
                "choices": [
                    { "text": "Water (20°C)", "value": "water" },
                    { "text": "Air (20°C)", "value": "air" }
                ],
                "initialChoiceIndex": 0,
                "notes": "Select fluid to load standard density and viscosity."
            },
            {
                "type": "slider",
                "id": "velocity",
                "text": "Flow Velocity, $V$ [m/s]",
                "min": 0.1,
                "max": 5.0,
                "step": 0.1,
                "initialValue": 1.5,
                "notation": "standard"
            },
            {
                "type": "slider-dropdown",
                "id": "diameter",
                "text": "Pipe Diameter, $D$ [m]",
                "min": 0.01,
                "max": 0.5,
                "step": 0.01,
                "initialValue": 0.05,
                "initialChoiceIndex": 1,
                "choices": [
                    { "text": "Custom...", "value": "custom" },
                    { "text": "DN50 (0.05 m)", "value": "0.05" },
                    { "text": "DN100 (0.10 m)", "value": "0.10" },
                    { "text": "DN200 (0.20 m)", "value": "0.20" }
                ]
            }
        ],
        "outputs": [
            {
                "text": "Density, $\\rho$ [kg/m³]",
                "id": "rho",
                "type": "map",
                "key": "fluid",
                "value": [998.2, 1.204]
            },
            {
                "text": "Dynamic Viscosity, $\\mu$ [Pa·s]",
                "id": "mu",
                "type": "map",
                "key": "fluid",
                "value": [1.002e-3, 1.825e-5]
            },
            {
                "text": "Reynolds Number, $Re$",
                "id": "reynolds",
                "type": "calculation",
                "value": "rho * velocity * diameter / mu",
                "decimals": 0
            },
            {
                "text": "Flow Regime",
                "id": "flow-regime",
                "type": "calculation",
                "value": "reynolds < 2300 ? 'Laminar ($Re < 2300$)' : (reynolds < 4000 ? 'Transitional' : 'Turbulent ($Re > 4000$)')"
            }
        ],
        "outputColumns": 4,
        "dottedRange": {
            "variable": "velocity",
            "min": 0.0,
            "max": 0.05
        }
    },
    "plots": {
        "aspectRatio": 1.2,
        "plotColumns": 2,
        "settings": [
            {
                "x": "velocity",
                "y": "reynolds",
                "xLabel": "$V \\text{ [m/s]}$",
                "yLabel": "$Re$",
                "xMin": 0,
                "xMax": 5.0,
                "xTickInterval": 1.0,
                "yMin": 0,
                "yMax": [300000, 25000],
                "yTickInterval": [50000, 5000],
                "key": "fluid",
                "activeLabel": "$D = {diameter}\\text{ m}$",
                "reference": [
                    {
                        "diameter": 0.10,
                        "text": "DN100 reference",
                        "labelPosition": "above"
                    }
                ]
            },
            {
                "x": "diameter",
                "y": "reynolds",
                "xLabel": "$D \\text{ [m]}$",
                "yLabel": "$Re$",
                "xMin": 0,
                "xMax": 0.5,
                "xTickInterval": 0.1,
                "yMin": 0,
                "yMax": [300000, 25000],
                "yTickInterval": [50000, 5000],
                "key": "fluid",
                "activeLabel": "$V = {velocity}\\text{ m/s}$"
            }
        ],
        "text": "Adjust fluid, velocity, and pipe diameter to examine their effect on the Reynolds number and flow regime."
    }
};