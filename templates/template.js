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
            "type": "header",
            "text": "Core Concept Header"
        },
        {
            "type": "note",
            "text": "This is a note explaining that **bold**, *italics*, and __underlines__ are supported."
        },
        {
            "type": "equation",
            "text": "E = m c^2"
        },
        {
            "type": "list",
            "header": "Variable Definitions",
            "content": [
                { "text": "$E$ — energy (J)" },
                { "text": "$m$ — mass (kg)" },
                { "text": "$c$ — speed of light ($3 \\times 10^8$ m/s)" }
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