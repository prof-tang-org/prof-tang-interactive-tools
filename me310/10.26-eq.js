const pageData = {
    "title": "Hydraulic Jump",
    "layout": {
        "grid": [
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.6fr 1.5fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Hydraulic Jump",
        },
        {
            "type": "list",
            "header": "Assumptions",
            "content": [
                {
                    "text": "The open channel is horizontal and rectangular with constant width $b$."
                },
                {
                    "text": "The flow is steady, uniform, and one-dimensional before the jump (section 1) and after the jump (section 2)."
                },
                {
                    "text": "Shear stress caused by wall friction is negligible ($\\tau_w = 0$)."
                },
                {
                    "text": "Chaotic flow in the jump region leads to head loss ($h_L$)."
                }
            ]
        },
        {
            "type": "note",
            "text": "**Equations**"
        },
        {
            "type": "equation",
            "text": "\\frac{y_2}{y_1} = \\frac{1}{2} \\left( -1 + \\sqrt{1 + 8 Fr_1^2} \\right)",
        },
        {
            "type": "equation",
            "text": "\\frac{h_L}{y_1} = 1 - \\frac{y_2}{y_1} + \\frac{1}{2} Fr_1^2 \\left[ 1 - \\left(\\frac{y_1}{y_2}\\right)^2 \\right]",
        },
        {
            "type": "equation",
            "text": "Fr_2 = Fr_1 \\left( \\frac{y_1}{y_2} \\right)^{\\frac{3}{2}}",
        },
        {
            "type": "list",
            "header": "Symbols",
            "content": [
                {
                    "text": "$y_1$ — depth at section (1)"
                },
                {
                    "text": "$y_2$ — depth at section (2)"
                },
                {
                    "text": "$Fr_1$ — Froude number at section (1), $Fr_1 = \\frac{V_1}{\\sqrt{gy_1}}$"
                },
                {
                    "text": "$Fr_2$ — Froude number at section (2), $Fr_2 = \\frac{V_2}{\\sqrt{gy_2}}$"
                },
                {
                    "text": "$h_L$ — head loss in the jump region"
                }
            ]
        }
    ],
    // "derivationElements": [
    //     {
    //         "type": "header",
    //         "text": "Derivation"
    //     },
    //     {
    //         "type": "note",
    //         "text": "This set of equations completely models the changes across a steady hydraulic jump in a horizontal, rectangular channel. The post-jump depth ratio, relative head loss, and downstream Froude number are determined exclusively as functions of the upstream Froude number ($Fr_1$)."
    //     }
    // ],
    "schematic": {
        "src": "../assets/me310/10.26-eq.png",
        "alt": "Schematic of a hydraulic jump in an open channel, showing the flow before and after the jump, the jump region, and the relevant parameters such as flow depth and velocity."
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "froude-1",
                "text": "Upstream Froude Number ($Fr_1$)",
                "min": 0.35,
                "max": 4,
                "initialValue": 2,
                "step": 0.05
            }
        ],
        "outputs": [
            {
                "text": "$y_2 / y_1$",
                "id": "depth-ratio",
                "type": "calculation",
                "value": "0.5 * (-1 + sqrt(1 + 8 * (froude-1 * froude-1)))"
            },
            {
                "text": "$h_L / y_1$",
                "id": "head-loss-ratio",
                "type": "calculation",
                "value": "1 - depth-ratio + 0.5 * (froude-1 * froude-1) * (1 - (1 / (depth-ratio * depth-ratio)))"
            },
            {
                "text": "$Fr_2$",
                "id": "froude-2",
                "type": "calculation",
                "value": "froude-1 * pow(1 / depth-ratio, 1.5)"
            }
        ],
        "dottedRange": {
            "variable": "froude-1",
            "min": 0,
            "max": 1
        },
        "note": {
            "text": "The values gray out when the head loss becomes negative, as this would imply energy creation."
        }
    },
    "plots": {
        "aspectRatio": 2.8,
        "settings": [
            {
                "y": "depth-ratio",
                "x": "froude-1",
                "yLabel": "$y_2 / y_1$",
                "xLabel": "$Fr_1$",
                "xMin": 0,
                "xMax": 4,
                "yMin": -1,
                "yMax": 6,
                "yTickInterval": 1,
                "dottedMin": 0,
                "dottedMax": 1
            },
            {
                "y": "head-loss-ratio",
                "x": "froude-1",
                "yLabel": "$h_L / y_1$",
                "xLabel": "$Fr_1$",
                "xMin": 0,
                "xMax": 4,
                "yMin": -1,
                "yMax": 4,
                "yTickInterval": 1,
                "dottedMin": 0,
                "dottedMax": 1
            },
            {
                "y": "froude-2",
                "x": "froude-1",
                "yLabel": "$Fr_2$",
                "xLabel": "$Fr_1$",
                "xMin": 0,
                "xMax": 4,
                "yMin": -1,
                "yMax": 4,
                "yTickInterval": 1,
                "dottedMin": 0,
                "dottedMax": 1
            }
        ],
        "text": "Adjust the upstream Froude number ($Fr_1$) to dynamically "
            + "view changes across the hydraulic jump. Note that the plot for $Fr_1 < 1$ is dashed "
            + "because it is impossible—flow must be supercritical for a hydraulic jump to occur!"
    }
};