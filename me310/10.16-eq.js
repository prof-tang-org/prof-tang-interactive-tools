const pageData = {
    "title": "Manning Equation",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.8fr 1.4fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Manning Equation"
        },
        {
            "type": "note",
            "text": "**Equation**"
        },
        {
            "type": "equation",
            "text": "V = \\frac{k}{n} R_h^{\\frac{2}{3}} s_0^{\\frac{1}{2}}"
        },
        {
            "type": "list",
            "header": "Variables",
            "content": [
                {
                    "text": "$V$ — velocity (m/s or ft/s)"
                },
                {
                    "text": "$R_h$ — hydraulic radius (m or ft)"
                },
                {
                    "text": "$s_0$ — bottom slope (m/m or ft/ft)"
                },
                {
                    "text": "$n$ — Manning resistance coefficient"
                },
                {
                    "text": "$k$ — unit conversion factor ($1$ for metric, $1.49$ for imperial)"
                }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/10.16-eq.png",
        "alt": "Schematic representation of open channel flow parameters showing hydraulic radius R_h, bottom slope s_0, and Manning roughness n."
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "conversion-factor",
                "text": "Unit System (k)",
                "choices": [
                    {
                        "text": "Metric (k = 1.0)",
                        "value": "1.0"
                    },
                    {
                        "text": "Imperial (k = 1.49)",
                        "value": "1.49"
                    }
                ]
            },
            {
                "type": "dropdown",
                "id": "manning",
                "text": "Manning roughness (n)",
                "min": 0.01,
                "max": 0.08,
                "step": 0.001,
                "initialCustomValue": 0.012,
                "initialChoiceIndex": 1,
                "choices": [
                    {
                        "text": "Custom...",
                        "value": "custom"
                    },
                    {
                        "text": "Concrete, finished (n = 0.012)",
                        "value": "0.012"
                    },
                    {
                        "text": "Major rivers (n = 0.035)",
                        "value": "0.035"
                    },
                    {
                        "text": "Heavily brushed flood-plains (n = 0.075)",
                        "value": "0.075"
                    },
                ]
            },
            {
                "type": "slider",
                "id": "hydraulic-radius",
                "text": "Hydraulic Radius (R_h)",
                "min": 0.1,
                "max": "conversion-factor == 1.0 ? 5.0 : 15.0",
                "initialValue": 1,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "bottom-slope",
                "text": "Bottom Slope (s_0)",
                "min": 0.0001,
                "max": 0.01,
                "initialValue": 0.005,
                "step": 0.0001
            }
        ],
        "outputs": [
            {
                "text": "Velocity (V)",
                "id": "velocity",
                "type": "calculation",
                "value": "conversion-factor / manning * pow(hydraulic-radius, 2/3) * sqrt(bottom-slope)"
            }
        ]
    },
    "plots": {
        "settings": [
            {
                "x": "hydraulic-radius",
                "y": "velocity",
                "xLabel": "$R_h$",
                "yLabel": "$v \\text{ [m/s]}$",
                "xMin": 0,
                "xMax": "conversion-factor == 1.0 ? 5.0 : 15.0",
                "xTickInterval": "conversion-factor == 1.0 ? 1.0 : 3.0",
                "yMin": 0,
                "yMax": [5, 20, 30, 100],
                "yTickInterval": [1, 4, 6, 20]
            },
            {
                "x": "bottom-slope",
                "y": "velocity",
                "xLabel": "$s_0$",
                "yLabel": "$v \\text{ [m/s]}$",
                "xMin": 0,
                "xMax": 0.01,
                "xTickInterval": 0.002,
                "yMin": 0,
                "yMax": [5, 20, 30, 100],
                "yTickInterval": [1, 4, 6, 20],
                "xTickInterval": 0.004
            },
            {
                "x": "manning",
                "y": "velocity",
                "xLabel": "$n$",
                "yLabel": "$v \\text{ [m/s]}$",
                "xMin": 0.01,
                "xMax": 0.08,
                "xTickInterval": 0.01,
                "yMin": 0,
                "yMax": [5, 20, 30, 100],
                "yTickInterval": [1, 4, 6, 20],
                "xTickInterval": 0.02
            }
        ],
        "text": "Analyze how hydraulic radius, bottom slope, and manning resistance coefficient impact velocity. Note the impact of units on scale but not shape!"
    }
};
