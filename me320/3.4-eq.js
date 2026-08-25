const pageData = {
    "title": "Plane Wall Without Internal Heat Genration",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.8fr 1.2fr",
                "mobile": "100%"
            }
        ],
        "breakpoint": "768px"
    },
    "equationElements": [
        
        {
            "type": "assumptions",
            "content": [
                "One-dimensional steady-state conduction in the x direction through a plane wall",
                "No internal heat generation"
            ]
        },
        // {
        //     "type": "note",
        //     "text": "This is a note explaining that **bold**, *italics*, and __underlines__ are supported."
        // },
        {
            "type": "equations",
            "content": [
                "T(x) = T_{s,1} - \\Delta T\\frac{x}{L}",
                "\\Delta T = T_{s,1} - T_{s,2}",
                "q'' = k \\frac{\\Delta T}{L}",
                "\\dot{Q} = k A \\frac{\\Delta T}{L}",
                "R_{t,cond} = \\frac{L}{kA}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$T$", "definition": "temperature" },
                { "symbol": "$\\Delta T$", "definition": "temperature difference across the wall" },
                { "symbol": "$T_{s,1}, T_{s_2}$", "definition": "temperatures of the wall surfaces" },
                { "symbol": "$x$", "definition": "x coordinate" },
                { "symbol": "$L$", "definition": "wall thickness in the direction of heat transfer" },
                { "symbol": "$A$", "definition": "wall area normal to the direction of heat transfer" },
                { "symbol": "$k$", "definition": "thermal conductivity" },
                { "symbol": "$q''$", "definition": "heat flux" },
                { "symbol": "$\\dot{Q}$", "definition": "heat rate" },
                { "symbol": "$R_{t,cond}$", "definition": "thermal resistance of conduction" },
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me320/3.4-eq.png",
        "alt": "A visual diagram of the sample concept."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "T_s1",
                "text": "Temperature of surface 1 [°C]",
                "value": 50
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "deltaT",
                "text": "Temperature difference, [°C]",
                "min": 5,
                "max": 30,
                "initialValue": 20,
                "step": 0.1
            },
            {
                "type": "slider",
                "id": "L",
                "text": "Wall thickness [m]",
                "min": 0.1,
                "max": 0.5,
                "initialValue": 0.2,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "xoverL",
                "text": "$x/L$",
                "min": 0,
                "max": 1,
                "initialValue": 0.5,
                "step": 0.01
            },
            {
                "type": "slider",
                "id": "A",
                "text": "Wall area [m²]",
                "min": 0.1,
                "max": 0.5,
                "initialValue": 0.2,
                "step": 0.01
            },
            {
                "type": "slider-dropdown",
                "id": "k",
                "text": "Thermal conductivity [W/(m·K)]",
                "min": 10,
                "max": 60,
                "step": 0.01,
                "initialChoiceIndex": 1,
                "choices": [
                    {
                        "text": "Custom...",
                        "value": "custom"
                    },
                    {
                        "text": "Carbon steel (52 [W/(m·K)])",
                        "value": "52"
                    },
                    {
                        "text": "Stainless steel (15 [W/(m·K)])",
                        "value": "15"
                    }
                ]
            }

        ],
        "outputs": [
            {
                "text": "Temperature, $T(x)$ [°C]",
                "id": "T_x",
                "type": "calculation",
                "value": "T_s1 - deltaT * xoverL"
            },
            {
                "text": "Temperature, $T(x)$ [°C]",
                "id": "qdoubleprime",
                "type": "calculation",
                "value": "T_s1 - deltaT * xoverL"
            },
            {
                "text": "Temperature, $T(x)$ [°C]",
                "id": "Q_dot",
                "type": "calculation",
                "value": "T_s1 - deltaT * xoverL"
            },
            {
                "text": "Temperature, $T(x)$ [°C]",
                "id": "R_tcond",
                "type": "calculation",
                "value": "T_s1 - deltaT * xoverL"
            }
        ]
    },
    "plots": {
        "aspectRatio": 0.6,
        "settings": [
            {
                "x": "xoverL",
                "y": "T_x",
                "xLabel": "$x/L [-]$",
                "yLabel": "T(x) [°C]",
                "xMin": 0,
                "xMax": 1,
                "yMin": 10,
                "yMax": 60,
                "yTickInterval": 5
            },
            {
                "x": "xoverL",
                "y": "T_x",
                "xLabel": "$x/L [-]$",
                "yLabel": "T(x) [°C]",
                "xMin": 0,
                "xMax": 1,
                "yMin": 10,
                "yMax": 60,
                "yTickInterval": 5
            }
        ],
        
        "text": "Drag the slider or the point on the plot to dynamically update the energy calculation."
    }
};
