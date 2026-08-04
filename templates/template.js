const pageData = {
    "title": "Sample Topic Name",
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
                "Assumption description goes here (single assumption renders on new line, no bullet)"
            ]
        },
        {
            "type": "equations",
            "content": [
                "E = m c^2"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$E$", "definition": "energy" },
                { "symbol": "$m$", "definition": "mass" },
                { "symbol": "$c$", "definition": "speed of light" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/sample-schem.png",
        "alt": "A visual diagram of the sample concept."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "constant-c",
                "text": "Speed of Light c (m/s)",
                "value": 299792458
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "mass-m",
                "text": "Mass (m) in kg",
                "min": 0,
                "max": 10,
                "initialValue": 1,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "text": "Energy E (Joules)",
                "id": "energy-E",
                "type": "calculation",
                "value": "mass-m * constant-c * constant-c"
            }
        ]
    },
    "plots": {
        "settings": [
            {
                "x": "mass-m",
                "y": "energy-E",
                "xLabel": "Mass m (kg)",
                "yLabel": "Energy E (J)",
                "xMin": 0,
                "xMax": 10,
                "yMin": 0,
                "yMax": 9e17,
                "yTickInterval": 1.5e17
            }
        ],
        "text": "Drag the slider or the point on the plot to dynamically update the energy calculation."
    }
};