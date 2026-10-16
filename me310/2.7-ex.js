/** @type {PageData} */
const pageData = {
    "title": "Hydrostatic Force on a Plane Triangular Surface",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Submerged plane triangular panel in a static fluid",
                "Incompressible fluid with uniform density"
            ]
        },
        {
            "type": "equations",
            "content": [
                "F_R = \\rho g h_c A",
                "y_c = \\frac{D}{\\sin\\theta} - \\frac{a}{3}",
                "h_c = y_c \\sin\\theta",
                "A = \\frac{a b}{2}",
                "x_c = \\frac{b + d}{3}",
                "I_{x_c} = \\frac{b a^3}{36}, \\quad I_{xy_c} = \\frac{b a^2}{72}(b - 2d)",
                "x_R = x_c + \\frac{I_{xy_c}}{y_c A}, \\quad y_R = y_c + \\frac{I_{x_c}}{y_c A}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$F_R$", "definition": "hydrostatic force magnitude" },
                { "symbol": "$\\rho$", "definition": "fluid density" },
                { "symbol": "$g$", "definition": "acceleration of gravity" },
                { "symbol": "$D$", "definition": "liquid depth" },
                { "symbol": "$\\theta$", "definition": "inclination angle" },
                { "symbol": "$a$", "definition": "triangle height" },
                { "symbol": "$b$", "definition": "base width" },
                { "symbol": "$d$", "definition": "horizontal offset of apex" },
                { "symbol": "$y_c$", "definition": "centroid position along inclined plane" },
                { "symbol": "$h_c$", "definition": "vertical depth of centroid" },
                { "symbol": "$A$", "definition": "panel surface area" },
                { "symbol": "$x_c$", "definition": "horizontal centroid position" },
                { "symbol": "$I_{x_c}$", "definition": "area moment of inertia about centroidal axis" },
                { "symbol": "$I_{xy_c}$", "definition": "product of inertia about centroidal axes" },
                { "symbol": "$x_R, y_R$", "definition": "center of pressure coordinates" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/2.7.png",
        "alt": "Schematic for triangular panel problem"
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "slider",
                "id": "rho",
                "text": "Fluid Density, $\\rho$ [kg/m³]",
                "min": 700,
                "max": 1000,
                "initialValue": 900.0,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "D",
                "text": "Depth, $D$ [m]",
                "min": 10.5,
                "max": 20.0,
                "initialValue": 15.0,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "theta",
                "text": "Inclination Angle, $\\theta$ [deg]",
                "min": 30,
                "max": 60,
                "initialValue": 60.0,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "a",
                "text": "Triangle Height, $a$ [m]",
                "min": 0.2,
                "max": 12.0,
                "initialValue": 10.0,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "b",
                "text": "Base Width, $b$ [m]",
                "min": 0.2,
                "max": 12.0,
                "initialValue": 12.0,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "d",
                "text": "Apex Offset, $d$ [m]",
                "min": 0.0,
                "max": 12.0,
                "initialValue": 8.0,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "id": "A",
                "text": "Panel Area, $A$ [m²]",
                "type": "calculation",
                "value": "0.5 * a * b",
                "decimals": 2
            },
            {
                "id": "yc",
                "text": "Centroid Position, $y_c$ [m]",
                "type": "calculation",
                "value": "D / sin(theta * PI / 180) - a / 3",
                "decimals": 3
            },
            {
                "id": "hc",
                "text": "Vertical Centroid Depth, $h_c$ [m]",
                "type": "calculation",
                "value": "yc * sin(theta * PI / 180)",
                "decimals": 3
            },
            {
                "id": "FR_kN",
                "text": "Hydrostatic Force, $F_R$ [kN]",
                "type": "calculation",
                "value": "(rho * 9.81 * hc * A) / 1000",
                "decimals": 1
            },
            {
                "id": "xc",
                "text": "Horizontal Centroid, $x_c$ [m]",
                "type": "calculation",
                "value": "(b + d) / 3",
                "decimals": 3
            },
            {
                "id": "Ixc",
                "text": "Moment of Inertia, $I_{x_c}$ [m⁴]",
                "type": "calculation",
                "value": "(b * pow(a, 3)) / 36",
                "decimals": 3
            },
            {
                "id": "Ixyc",
                "text": "Product of Inertia, $I_{xy_c}$ [m⁴]",
                "type": "calculation",
                "value": "(b * pow(a, 2) * (b - 2 * d)) / 72",
                "decimals": 3
            },
            {
                "id": "xR",
                "text": "Center of Pressure, $x_R$ [m]",
                "type": "calculation",
                "value": "xc + (Ixyc / (yc * A))",
                "decimals": 3
            },
            {
                "id": "yR_free",
                "text": "Center of Pressure, $y_R$ [m]",
                "type": "calculation",
                "value": "yc + (Ixc / (yc * A))",
                "decimals": 3
            },
            {
                "id": "dx",
                "text": "Offset $(x_R - x_c)$ [m]",
                "type": "calculation",
                "value": "Ixyc / (yc * A)",
                "decimals": 3
            },
            {
                "id": "dy",
                "text": "Offset $(y_R - y_c)$ [m]",
                "type": "calculation",
                "value": "Ixc / (yc * A)",
                "decimals": 3
            },
            {
                "id": "d_over_b",
                "text": "Apex Ratio, $d/b$",
                "type": "calculation",
                "value": "d / b",
                "decimals": 3
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "aspectRatio": 1.8,
        "customScripts": [
            "../assets/js/plots/triangular-panel.js"
        ],
        "settings": [
            [
                {
                    "customScript": "../assets/js/plots/triangular-panel.js",
                    "customRender": "triangularPanel",
                    "mode": "override",
                    "x": "d",
                    "y": "a",
                    "xLabel": "",
                    "yLabel": ""
                },
                {
                    "x": "D",
                    "y": "FR_kN",
                    "xLabel": "Depth, $D \\text{ [m]}$",
                    "yLabel": "Force, $F_R \\text{ [kN]}$",
                    "xMin": 10.5,
                    "xMax": 20.0,
                    "yMin": 0
                }
            ],
            [
                {
                    "customScript": "../assets/js/plots/triangular-panel.js",
                    "customRender": "cpVsDepth",
                    "mode": "override",
                    "x": "D",
                    "y": "dx",
                    "xLabel": "Depth, $D \\text{ [m]}$",
                    "yLabel": "Offset \\text{ [m]}"
                },
                {
                    "x": "theta",
                    "y": "FR_kN",
                    "xLabel": "Angle, $\\theta \\text{ [deg]}$",
                    "yLabel": "Force, $F_R \\text{ [kN]}$",
                    "xMin": 30,
                    "xMax": 60,
                    "yMin": 0
                }
            ],
            [
                {
                    "customScript": "../assets/js/plots/triangular-panel.js",
                    "customRender": "cpVsTheta",
                    "mode": "override",
                    "x": "theta",
                    "y": "dx",
                    "xLabel": "Angle, $\\theta \\text{ [deg]}$",
                    "yLabel": "Offset \\text{ [m]}"
                },
                {
                    "x": "d_over_b",
                    "y": "FR_kN",
                    "xLabel": "Ratio, $d/b \\text{ [-]}$",
                    "yLabel": "Force, $F_R \\text{ [kN]}$",
                    "xMin": 0,
                    "xMax": 1.5,
                    "yMin": 0
                }
            ],
            [
                {
                    "customScript": "../assets/js/plots/triangular-panel.js",
                    "customRender": "cpVsDoverB",
                    "mode": "override",
                    "x": "d_over_b",
                    "y": "dx",
                    "xLabel": "Ratio, $d/b \\text{ [-]}$",
                    "yLabel": "Offset \\text{ [m]}"
                }
            ]
        ],
        "text": "Interactive visualization of hydrostatic force $F_R$ and center of pressure offsets $(x_R - x_c)$ and $(y_R - y_c)$ for a submerged triangular panel."
    }
};
