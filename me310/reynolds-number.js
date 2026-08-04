/** @type {PageData} */
const pageData = {
    "title": "Reynolds Number of Viscous Flow over a Flat Plate",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.6fr 1.4fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "equations",
            "content": [
                "Re_x = \\frac{\\rho U x}{\\mu} = \\frac{U x}{\\mu / \\rho} = \\frac{U x}{\\nu}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$Re_x$", "definition": "Reynolds number" },
                { "symbol": "$U$", "definition": "upstream or freestream velocity" },
                { "symbol": "$x$", "definition": "distance measured from the leading edge" },
                { "symbol": "$\\rho$", "definition": "density" },
                { "symbol": "$\\mu$", "definition": "dynamic viscosity" },
                { "symbol": "$\\nu$", "definition": "kinematic viscosity" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/reynolds-number.png",
        "alt": "Schematic of flow over a flat plate showing distance x along the plate and velocity U."
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "U",
                "text": "Velocity, $U$ [m/s]",
                "min": 0.5,
                "max": 5,
                "initialValue": 2,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "x",
                "text": "Distance, $x$ [m]",
                "min": 0.1,
                "max": 1,
                "initialValue": 0.5,
                "step": 0.01
            },
            {
                "type": "slider-dropdown",
                "id": "kinematic-viscosity",
                "text": "Kinematic Viscosity, $\\nu$ [m²/s]",
                "min": 1e-6,
                "max": 1e-4,
                "step": 1e-7,
                "initialValue": 1.12e-6,
                "initialChoiceIndex": 1,
                "notation": "scientific",
                "choices": [
                    {
                        "text": "Custom...",
                        "value": "custom"
                    },
                    {
                        "text": "Water (1.12 × 10⁻⁶ m²/s)",
                        "value": "1.12e-6"
                    },
                    {
                        "text": "Air (1.46 × 10⁻⁵ m²/s)",
                        "value": "1.46e-5"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "text": "Reynolds Number, $Re_x$",
                "id": "reynolds",
                "type": "calculation",
                "value": "U * x / kinematic-viscosity"
            }
        ]
    },
    "plots": {
        "aspectRatio": 2,
        "settings": [
            {
                "x": "U",
                "y": "reynolds",
                "xLabel": "$U \\text{ [m/s]}$",
                "yLabel": "$Re_x$",
                "xMin": 0,
                "xMax": 5,
                "yMin": 0,
                "yMax": [1e4, 1e5, 1e6, 5e6],
                "yTickInterval": [2e3, 2e4, 2e5, 1e6],
                "yExponential": true,
                "reference": [
                    {
                        "x": 0.1,
                        "text": "$x = 0.1\\text{ m}$",
                        "labelPosition": "above"
                    },
                    {
                        "x": 1.0,
                        "text": "$x = 1\\text{ m}$",
                        "labelPosition": "above"
                    }
                ]
            },
            {
                "x": "x",
                "y": "reynolds",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$Re_x$",
                "xMin": 0,
                "xMax": 1,
                "yMin": 0,
                "yMax": [1e4, 1e5, 1e6, 5e6],
                "yTickInterval": [2e3, 2e4, 2e5, 1e6],
                "yExponential": true,
                "reference": [
                    {
                        "U": 0.5,
                        "text": "$U = 0.5\\text{ m/s}$",
                        "labelPosition": "above"
                    },
                    {
                        "U": 5.0,
                        "text": "$U = 5\\text{ m/s}$",
                        "labelPosition": "above"
                    }
                ]
            }
        ],
        "text": "Drag the point or change the inputs to analyze how the local Reynolds number ($Re_x$) varies with velocity and distance. The dashed curves represent reference values of $x$ and $U$."
    }
};
