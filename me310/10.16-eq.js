const pageData = {
    "title": "Manning Equation for Turbulent Uniform Open-Channel Flow",
    "equationElements": [
        {
            "type": "header",
            "text": "Manning equation for turbulent uniform open-channel flow"
        },
        {
            "type": "equation",
            "text": "V = \\frac{\\kappa}{n} R_h^{\\frac{2}{3}} S_0^{\\frac{1}{2}}"
        },
        {
            "type": "equation",
            "text": "Re_R = \\frac{V R_h}{\\nu}"
        },
        {
            "type": "list",
            "header": "Variables",
            "content": [
                {
                    "text": "$V$ — velocity"
                },
                {
                    "text": "$\\kappa$ — unit conversion factor"
                },
                {
                    "text": "$n$ — Manning roughness coefficient"
                },
                {
                    "text": "$R_h$ — hydraulic radius"
                },
                {
                    "text": "$S_0$ — bottom slope"
                },
                {
                    "text": "$Re_R$ — Reynolds number based on hydraulic radius"
                },
                {
                    "text": "$\\nu$ — kinematic viscosity"
                }
            ]
        }
    ],
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "fluid",
                "text": "Fluid",
                "value": "Water"
            },
            {
                "id": "kinematic-viscosity",
                "text": "conversion-factor == 1.0 ? 'Kinematic Viscosity, $\\\\nu$ [m²/s]' : 'Kinematic Viscosity, $\\\\nu$ [ft²/s]'",
                "type": "calculation",
                "value": "conversion-factor == 1.0 ? 1.004e-6 : 1.21e-5",
                "decimals": "conversion-factor == 1.0 ? 3 : 2"
            }
        ],
        "inputs": [
            {
                "type": "dropdown",
                "id": "conversion-factor",
                "text": "Unit Conversion Factor, $\\kappa$",
                "choices": [
                    {
                        "text": "Metric (κ = 1.0)",
                        "value": "1.0"
                    },
                    {
                        "text": "Imperial (κ = 1.49)",
                        "value": "1.49"
                    }
                ]
            },
            {
                "type": "slider-dropdown",
                "id": "manning",
                "text": "Manning Roughness, $n$",
                "min": 0.01,
                "max": 0.08,
                "step": 0.001,
                "initialValue": 0.012,
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
                        "text": "Heavily brushed floodplains (n = 0.075)",
                        "value": "0.075"
                    }
                ]
            },
            {
                "type": "slider",
                "id": "hydraulic-radius",
                "text": "conversion-factor == 1.0 ? 'Hydraulic Radius, $R_h$ [m]' : 'Hydraulic Radius, $R_h$ [ft]'",
                "min": "conversion-factor == 1.0 ? 0.5 : 1.0",
                "max": "conversion-factor == 1.0 ? 5.0 : 15.0",
                "initialValue": 2,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "bottom-slope",
                "text": "Bottom Slope, $S_0$",
                "min": 0.0001,
                "max": 0.01,
                "initialValue": 0.001,
                "step": 0.0001
            }
        ],
        "outputs": [
            {
                "text": "conversion-factor == 1.0 ? 'Velocity, $V$ [m/s]' : 'Velocity, $V$ [ft/s]'",
                "id": "velocity",
                "type": "calculation",
                "value": "conversion-factor / manning * pow(hydraulic-radius, 2/3) * sqrt(bottom-slope)"
            },
            {
                "text": "Reynolds Number, $Re_R$",
                "id": "reynolds-number",
                "type": "calculation",
                "value": "(conversion-factor / manning * pow(hydraulic-radius, 2/3) * sqrt(bottom-slope)) * hydraulic-radius / (conversion-factor == 1.0 ? 1.004e-6 : 1.21e-5)"
            },
            {
                "text": "Flow Regime",
                "id": "flow-regime",
                "type": "calculation",
                "value": "'$Re_R$ > 12500, turbulent flow'"
            }
        ]
    },
    "plots": {
        "aspectRatio": 3,
        "settings": [
            {
                "x": "hydraulic-radius",
                "y": "velocity",
                "xLabel": "conversion-factor == 1.0 ? '$R_h \\\\text{ [m]}$' : '$R_h \\\\text{ [ft]}$'",
                "yLabel": "conversion-factor == 1.0 ? '$V \\\\text{ [m/s]}$' : '$V \\\\text{ [ft/s]}$'",
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
                "xLabel": "$S_0$",
                "yLabel": "conversion-factor == 1.0 ? '$V \\\\text{ [m/s]}$' : '$V \\\\text{ [ft/s]}$'",
                "xMin": 0,
                "xMax": 0.01,
                "xTickInterval": 0.002,
                "xTickRotation": 45,
                "yMin": 0,
                "yMax": [5, 20, 30, 100],
                "yTickInterval": [1, 4, 6, 20]
            },
            {
                "x": "manning",
                "y": "velocity",
                "xLabel": "$n$",
                "yLabel": "conversion-factor == 1.0 ? '$V \\\\text{ [m/s]}$' : '$V \\\\text{ [ft/s]}$'",
                "xMin": 0,
                "xMax": 0.08,
                "xTickInterval": 0.02,
                "xTickRotation": 45,
                "yMin": 0,
                "yMax": [5, 20, 30, 100],
                "yTickInterval": [1, 4, 6, 20]
            }
        ],
        "text": "Analyze how hydraulic radius, bottom slope, and manning resistance coefficient impact velocity. Note the impact of units on scale but not shape!"
    }
};
