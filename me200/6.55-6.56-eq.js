const pageData = {
    "title": "Steady Internally Reversible Polytropic Process Work of Ideal Gas Flows",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
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
            "type": "assumptions",
            "content": [
                "The open system operates under steady flow conditions with one inlet and one outlet.",
                "The process is internally reversible.",
                "Changes in kinetic energy and potential energy are negligible.",
                "The working fluid behaves as an ideal gas and undergoes a polytropic process."
            ]
        },
        {
            "type": "equations",
            "content": [
                "\\left(\\frac{\\dot{W}_{cv}}{\\dot{m}}\\right)_{\\text{int. rev.}} = \\int_1^2{vdp} = \\begin{cases} -RT \\ln\\left(\\frac{p_2}{p_1}\\right) & \\text{if } n = 1 \\\\ -\\frac{nRT_1}{n-1}\\left[\\left(\\frac{p_2}{p_1}\\right)^{\\frac{n-1}{n}} - 1\\right] & \\text{if } n \\neq 1 \\end{cases}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$\\left(\\frac{\\dot{W}_{cv}}{\\dot{m}}\\right)_{\\text{int. rev.}}$", "definition": "work per unit mass" },
                { "symbol": "$\\dot{m}$", "definition": "mass flow rate" },
                { "symbol": "$p_1, p_2$", "definition": "inlet and outlet pressures (absolute)" },
                { "symbol": "$T_1, T_2$", "definition": "inlet and outlet temperatures (thermodynamic)" },
                { "symbol": "$v_1, v_2$", "definition": "inlet and outlet specific volumes" },
                { "symbol": "$R$", "definition": "specific gas constant ($R = \\bar{R}/M$)" },
                { "symbol": "$n$", "definition": "polytropic index" }
            ]
        },
        {
            "type": "note",
            "text": [
                "**Note**",
                "For an ideal gas, a polytropic process with $n = 1$ simplifies to an **isothermal** process ($T_1 = T_2 = T$)"
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/6.55-6.56-eq.png",
        "alt": "Schematic of an open system control volume (turbine/compressor) undergoing a steady, internally reversible polytropic gas flow process."
    },
    "inputOutput": {
        "note": {
            "text": "The air as an ideal gas passes through a turbine (or compressor) undergoes a steady, internally reversible polytropic process. The inlet pressure and temperature are fixed, while the outlet pressure and polytropic index can be varied. The outlet temperature, outlet specific volume, and specific work done are calculated based on the inputs."
        },
        "fixedInputs": [
            {
                "id": "pressure-1",
                "text": "Inlet Pressure $p_1$ [kPa]",
                "value": 500
            },
            {
                "id": "temp-1",
                "text": "Inlet Temperature $T_1$ [K]",
                "value": 300
            },
            {
                "id": "molar-mass",
                "text": "Molar Mass $M$ [kg/kmol]",
                "value": 28.97
            },
            {
                "id": "universal-R",
                "text": "Universal Gas Constant $\\bar{R}$ [J/(kmol·K)]",
                "value": 8314
            },
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "polytropic-n",
                "text": "Polytropic Index $n$",
                "min": 0.5,
                "max": 2.0,
                "initialValue": 1.4,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "pressure-2",
                "text": "Outlet Pressure $p_2$ [kPa]",
                "min": 100,
                "max": 1000,
                "initialValue": 200,
                "step": 10
            }
        ],
        "outputs": [
            {
                "text": "Gas Constant $R$ [J/(kg·K)]",
                "id": "gas-constant-R",
                "type": "calculation",
                "value": "universal-R / molar-mass"
            },
            {
                "text": "Inlet Spec. Volume $v_1$ [m³/kg]",
                "id": "volume-1",
                "type": "calculation",
                "value": "(gas-constant-R * temp-1) / (pressure-1 * 1000)"
            },
            {
                "text": "Outlet Temperature $T_2$ [K]",
                "id": "temp-2",
                "type": "calculation",
                "value": "temp-1 * pow(pressure-2 / pressure-1, (polytropic-n - 1) / polytropic-n)"
            },
            {
                "text": "Outlet Spec. Volume $v_2$ [m³/kg]",
                "id": "volume-2",
                "type": "calculation",
                "value": "(gas-constant-R * temp-2) / (pressure-2 * 1000)"
            },
            {
                "text": "Work per Unit Mass $\\frac{\\dot{W}_{cv}}{\\dot{m}}$ [kJ/kg]",
                "id": "specific-work",
                "type": "calculation",
                "value": "abs(polytropic-n - 1.0) < 1e-4 ? (-gas-constant-R * temp-1 * log(pressure-2 / pressure-1) / 1000) : (-(polytropic-n * gas-constant-R * temp-1) / (polytropic-n - 1) * (pow(pressure-2 / pressure-1, (polytropic-n - 1) / polytropic-n) - 1) / 1000)"
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "aspectRatio": 3,
        "settings": [
            {
                "y": "temp-2",
                "x": "pressure-2",
                "yLabel": "$T_2 \\text{ [K]}$",
                "xLabel": "$p_2 \\text{ [kPa]}$",
                "xMin": 0,
                "xMax": 1000,
                "yMin": 0,
                "yMax": 1600,
                "yTickInterval": 200,
                "activeLabel": "$n = {polytropic-n}$",
                "reference": [
                    {
                        "polytropic-n": 0.5,
                        "text": "$n = 0.5$"
                    },
                    {
                        "polytropic-n": 2,
                        "text": "$n = 2$"
                    }
                ]
            },
            {
                "y": "volume-2",
                "x": "pressure-2",
                "yLabel": "$v_2 \\text{ [}\\text{m}^\\text{3}\\text{/kg]}$",
                "xLabel": "$p_2 \\text{ [kPa]}$",
                "xMin": 0,
                "xMax": 1000,
                "yMin": 0,
                "yMax": 5,
                "yTickInterval": 1,
                // "activeLabel": "$n = {polytropic-n}$",
                "reference": [
                    {
                        "polytropic-n": 0.5,
                        "text": "$n = 0.5$"
                    },
                    {
                        "polytropic-n": 2,
                        "text": "$n = 2$"
                    }
                ]
            },
            {
                "y": "specific-work",
                "x": "pressure-2",
                "yLabel": "$\\left(\\frac{\\dot{W}_{cv}}{\\dot{m}}\\right)_{\\text{int. rev.}} \\text{ [kJ/kg]}$",
                "xLabel": "$p_2 \\text{ [kPa]}$",
                "xMin": 0,
                "xMax": 1000,
                "yMin": -100,
                "yMax": 400,
                "yTickInterval": 100,
                // "activeLabel": "$n = {polytropic-n}$",
                "reference": [
                    {
                        "polytropic-n": 0.5,
                        "text": "$n = 0.5$"
                    },
                    {
                        "polytropic-n": 2,
                        "text": "$n = 2$"
                    }
                ]
            }
        ],
        "text": "Drag the red dots to analyze the influence of outlet pressure on the outlet state and specific work done under different polytropic modes."
    }
};