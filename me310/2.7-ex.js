// Sample formula-valued points; the renderer evaluates them against live inputs.
function panelOffsetPlot(variable, label, min, max) {
    const ratio = variable === 'd_over_b';
    const points = (vertical) => Array.from({length: 101}, (_, i) => {
        const fraction = i / 100;
        const x = ratio ? `(min(d_over_b <= 6 ? 6 : 60, 12 / b) * ${fraction})` : min + (max - min) * fraction;
        const depth = variable === 'D' ? x : 'D';
        const angle = variable === 'theta' ? x : 'theta';
        const apex = ratio ? `(${x} * b)` : 'd';
        const yc = `(${depth} / sin(${angle} * PI / 180) - a / 3)`;
        return [x, vertical ? `a * a / (18 * ${yc})` : `a * (b - 2 * ${apex}) / (36 * ${yc})`];
    });
    const curve = (vertical) => ({
        points: points(vertical), showPoints: false,
        pointsColor: vertical ? '#ef4444' : '#0075ff'
    });
    const marker = (vertical) => ({
        points: [[variable, vertical ? 'dy' : 'dx']],
        pointsColor: vertical ? '#ef4444' : '#0075ff',
        pointRadius: 6,
        pointStroke: 'none',
        keepLabelsInside: true,
        pointLabels: [{text: vertical ? '$y_R-y_c$' : '$x_R-x_c$', location: vertical ? 'top' : 'bottom'}]
    });
    return {
        x: variable, y: 'dx', xLabel: label, yLabel: '$\\text{Offsets [m]}$',
        draggablePoint: true,
        showDragMarker: false,
        ...(ratio ? {dragInput: 'd', dragValue: 'dragX * b'} : {}),
        xMin: min, xMax: ratio ? 'd_over_b <= 6 ? 6 : 60' : max,
        yMin: -1.2, yMax: 1.2, yTickInterval: 0.4,
        series: [curve(false), curve(true), marker(false), marker(true)]
    };
}

/** @type {PageData} */
const pageData = {
    "title": "Hydrostatic Force on a Plane Triangular Surface",
    "layout": {
        "grid": [
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            },
            {
                "desktop": "1fr 1fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "header",
            "text": "Problem Statement"
        },
        {
            "type": "note",
            "text": "An open tank is filled with oil of density $\\rho$. A triangular panel on the inclined plane is submerged in the oil."
        },
        {
            "type": "note",
            "text": "Find (a) the magnitude of the hydrostatic force and (b) its point of action (center of pressure) on the triangular panel."
        },
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
                {
                    "symbol": "$F_R$",
                    "definition": "hydrostatic force magnitude"
                },
                {
                    "symbol": "$\\rho$",
                    "definition": "fluid density"
                },
                {
                    "symbol": "$g$",
                    "definition": "acceleration of gravity"
                },
                {
                    "symbol": "$D$",
                    "definition": "liquid depth"
                },
                {
                    "symbol": "$\\theta$",
                    "definition": "inclination angle"
                },
                {
                    "symbol": "$a$",
                    "definition": "triangle height"
                },
                {
                    "symbol": "$b$",
                    "definition": "base width"
                },
                {
                    "symbol": "$d$",
                    "definition": "horizontal offset of apex"
                },
                {
                    "symbol": "$y_c$",
                    "definition": "centroid position along inclined plane"
                },
                {
                    "symbol": "$h_c$",
                    "definition": "vertical depth of centroid"
                },
                {
                    "symbol": "$A$",
                    "definition": "panel surface area"
                },
                {
                    "symbol": "$x_c$",
                    "definition": "horizontal centroid position"
                },
                {
                    "symbol": "$I_{x_c}$",
                    "definition": "area moment of inertia about centroidal axis"
                },
                {
                    "symbol": "$I_{xy_c}$",
                    "definition": "product of inertia about centroidal axes"
                },
                {
                    "symbol": "$x_R, y_R$",
                    "definition": "center of pressure coordinates"
                }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/2.7.1.png",
        "alt": "Schematic for triangular panel problem"
    },
    "inputOutput": {
        "keepVisible": true,
        "inputs": [
            {
                "type": "slider",
                "id": "rho",
                "text": "Fluid Density, $\\rho$ [kg/m³]",
                "min": 700,
                "max": 1000,
                "initialValue": 900,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "D",
                "text": "$D$ [m]",
                "min": 10.5,
                "max": 20,
                "initialValue": 15,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "theta",
                "text": "Inclination $\\theta$ [deg]",
                "min": 30,
                "max": 60,
                "initialValue": 60,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "a",
                "text": "Triangle Height, $a$ [m]",
                "min": 0.2,
                "max": 12,
                "initialValue": 10,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "b",
                "text": "Base Width, $b$ [m]",
                "min": 0.2,
                "max": 12,
                "initialValue": 12,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "d",
                "text": "Apex Offset, $d$ [m]",
                "min": 0,
                "max": 12,
                "initialValue": 8,
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
                "text": "Hydrostatic $F_R$ [kN]",
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
        "aspectRatio": 2.75,
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
                    "xLabel": "$x \\text{ [m]}$",
                    "yLabel": "$y \\text{ [m]}$",
                    "xMin": 0,
                    "xMax": 14,
                    "yMin": 0,
                    "yMax": 14,
                    "xTickInterval": 2,
                    "yTickInterval": 2,
                    "aspectRatio": 2.75
                }
            ],
            [
                {
                    "x": "D",
                    "y": "FR_kN",
                    "xLabel": "$D \\text{ [m]}$",
                    "yLabel": "$F_R \\text{ [kN]}$",
                    "xMin": 10.5,
                    "xMax": 20,
                    "yMin": 0,
                    "yMax": "((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 5 ? 5 : (((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 50 ? 50 : (((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 500 ? 500 : (((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 5000 ? 5000 : 15000)))",
                    "yTickInterval": "((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 5 ? 1 : (((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 50 ? 10 : (((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 500 ? 100 : (((rho * 9.81 * (20.0 - (a / 3) * sin(theta * PI / 180)) * (0.5 * a * b)) / 1000) <= 5000 ? 1000 : 3000)))"
                },
                panelOffsetPlot("D", "$D \\text{ [m]}$", 10.5, 20)
            ],
            [
                {
                    "x": "theta",
                    "y": "FR_kN",
                    "xLabel": "$\\theta \\text{ [deg]}$",
                    "yLabel": "$F_R \\text{ [kN]}$",
                    "xMin": 30,
                    "xMax": 60,
                    "yMin": 0,
                    "yMax": "((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 5 ? 5 : (((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 50 ? 50 : (((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 500 ? 500 : (((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 5000 ? 5000 : 15000)))",
                    "yTickInterval": "((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 5 ? 1 : (((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 50 ? 10 : (((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 500 ? 100 : (((rho * 9.81 * (D - (a / 3) * sin(30 * PI / 180)) * (0.5 * a * b)) / 1000) <= 5000 ? 1000 : 3000)))"
                },
                panelOffsetPlot("theta", "$\\theta \\text{ [deg]}$", 30, 60)
            ],
            [
                {
                    "x": "d_over_b",
                    "y": "FR_kN",
                    "draggablePoint": true,
                    "showDragMarker": false,
                    "dragInput": "d",
                    "dragValue": "dragX * b",
                    "xLabel": "$d/b$",
                    "yLabel": "$F_R \\text{ [kN]}$",
                    "xMin": 0,
                    "xMax": "d_over_b <= 6 ? 6 : 60",
                    "yMin": 0,
                    "yMax": "FR_kN <= 5 ? 5 : (FR_kN <= 50 ? 50 : (FR_kN <= 500 ? 500 : (FR_kN <= 5000 ? 5000 : 15000)))",
                    "yTickInterval": "FR_kN <= 5 ? 1 : (FR_kN <= 50 ? 10 : (FR_kN <= 500 ? 100 : (FR_kN <= 5000 ? 1000 : 3000)))",
                    "series": [
                        {
                            "points": [
                                [
                                    0,
                                    "FR_kN"
                                ],
                                [
                                    "min(d_over_b <= 6 ? 6 : 60, 12 / b)",
                                    "FR_kN"
                                ]
                            ],
                            "showPoints": false
                        },
                        {
                            "points": [
                                [
                                    "d_over_b",
                                    "FR_kN"
                                ]
                            ],
                            "pointRadius": 6,
                            "pointStroke": "none"
                        }
                    ]
                },
                panelOffsetPlot("d_over_b", "$d/b$", 0, 60)
            ]
        ],
        "text": "Play with the inputs to visualize how the hydrostatic force $F_R$ (left column) and center of pressure offsets $(x_R - x_c)$ and $(y_R - y_c)$ (right column) change based on the geometry of a submerged triangular panel."
    }
};
