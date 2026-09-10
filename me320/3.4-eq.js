const maxqboubleprime = "max(k*30/L/1000, k*deltaT/0.1/1000, 60*deltaT/L/1000)";
const yMaxExprqboubleprime = `${maxqboubleprime} < 2 ? 2 : 20`;
const yTickExprqboubleprime = `${maxqboubleprime} < 2 ? 0.2 : 2`;

const maxQ_dot = "max(k*30*A/L/1000, k*deltaT*A/0.1/1000, 60*deltaT*0.5/L/1000, 60*deltaT*A/L/1000)";
const yMaxExprQ_dot = `${maxQ_dot} < 1 ? 1 : 10`;
const yTickExprQ_dot = `${maxQ_dot} < 1 ? 0.1 : 1`;

const maxR_tcond = "max(0.5/(k*A)*1000, L/(k*0.1)*1000, L/(10*A)*1000)";
const yMaxExprR_tcond = `${maxR_tcond} < 100 ? 100 : 500`;
const yTickExprR_tcond = `${maxR_tcond} < 100 ? 10 : 50`;

// const maxH = "max(0.06*l*pow(V,2)/(D*2*g), f*10*pow(V,2)/(D*2*g), f*l*pow(V,2)/(0.01*2*g), f*l*25/(D*2*g))";
// const yMaxExpr = `${maxH} < 0.5 ? 0.5 : (${maxH} < 5 ? 5 : (${maxH} < 50 ? 50 : 80))`;
// const yTickExpr = `${maxH} < 0.5 ? 0.1 : (${maxH} < 5 ? 1 : (${maxH} < 50 ? 10 : 20))`;

/** @type {PageData} **/
const pageData = {
    "title": "Plane Wall Without Internal Heat Generation",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.7fr",
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
                "value": "T_s1- deltaT*xoverL"
            },
            {
                "text": "Heat Flux, $q''$ [kW/m²]",
                "id": "qdoubleprime",
                "type": "calculation",
                "value": "k*deltaT/L/1000"
            },
            {
                "text": "Heat Rate, $\\dot{Q}$ [kW]",
                "id": "Q_dot",
                "type": "calculation",
                "value": "k*deltaT*A/L/1000"
            },
            {
                "text": "Conduction Thermal Resistance, $R_{t,cond}$ [K/kW]",
                "id": "R_tcond",
                "type": "calculation",
                "value": "L/(k*A)*1000"
            }
        ]
    },
    "plots": {
        "aspectRatio": 1,
        "plotColumns": 2,
        "settings": [
            [{
                "x": "xoverL",
                "y": "T_x",
                "xLabel": "$x/L \\text{ [-]}$",
                "yLabel": "$T(x) \\text{ [°C]}$",
                "xMin": 0,
                "xMax": 1,
                "yMin": 10,
                "yMax": 60,
                "yTickInterval": 10,
                "aspectRatio": 1
            }, {}],
            [{
                "x": "deltaT",
                "y": "qdoubleprime",
                "xLabel": "$\\Delta T \\text{ [°C]}$",
                "yLabel": "$q'' \\text{ [kW/m}^2 \\text{]}$",
                "xMin": 0,
                "xMax": 30,
                "yMin": 0,
                "yMax": yMaxExprqboubleprime,
                "yTickInterval": yTickExprqboubleprime
            },
            {
                "x": "L",
                "y": "qdoubleprime",            
                "xLabel": "$L \\text{ [m]}$",
                "yLabel": "$q'' \\text{ [kW/m}^2 \\text{]}$",
                "xMin": 0,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": yMaxExprqboubleprime,
                "yTickInterval": yTickExprqboubleprime
            }],
            [{
                "x": "A",
                "y": "qdoubleprime",                
                "xLabel": "$A \\text{ [m}^2 \\text{]}$",
                "yLabel": "$q'' \\text{ [kW/m}^2 \\text{]}$",                
                "xMin": 0,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": yMaxExprqboubleprime,
                "yTickInterval": yTickExprqboubleprime
            },
            {
                "x": "k",
                "y": "qdoubleprime",                
                "xLabel": "$k \\text{ [W/(m·K)]}$",
                "yLabel": "$q'' \\text{ [kW/m}^2 \\text{]}$",                
                "xMin": 0,
                "xMax": 60,
                "yMin": 0,
                "yMax": yMaxExprqboubleprime,
                "yTickInterval": yTickExprqboubleprime
            }], 
            [{
                "x": "deltaT",
                "y": "Q_dot",
                "xLabel": "$\\Delta T \\text{ [°C]}$",
                "yLabel": "$\\dot{Q} \\text{ [kW]}$",
                "xMin": 0,
                "xMax": 30,
                "yMin": 0,
                "yMax": yMaxExprQ_dot,
                "yTickInterval": yTickExprQ_dot
            },
            {
                "x": "L",
                "y": "Q_dot",            
                "xLabel": "$L \\text{ [m]}$",
                "yLabel": "$\\dot{Q} \\text{ [kW]}$",
                "xMin": 0,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": yMaxExprQ_dot,
                "yTickInterval": yTickExprQ_dot
            }],
            [{
                "x": "A",
                "y": "Q_dot",                
                "xLabel": "$A \\text{ [m}^2 \\text{]}$",
                "yLabel": "$\\dot{Q} \\text{ [kW]}$",                
                "xMin": 0,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": yMaxExprQ_dot,
                "yTickInterval": yTickExprQ_dot
            },
            {
                "x": "k",
                "y": "Q_dot",                
                "xLabel": "$k \\text{ [W/(m·K)]}$",
                "yLabel": "$\\dot{Q} \\text{ [kW]}$",                
                "xMin": 0,
                "xMax": 60,
                "yMin": 0,
                "yMax": yMaxExprQ_dot,
                "yTickInterval": yTickExprQ_dot
            }],             
            [{
                "x": "deltaT",
                "y": "R_tcond",
                "xLabel": "$\\Delta T \\text{ [°C]}$",
                "yLabel": "$R_{\\text{t,cond}} \\text{ [K/kW]}$",
                "xMin": 0,
                "xMax": 30,
                "yMin": 0,
                "yMax": yMaxExprR_tcond,
                "yTickInterval": yTickExprR_tcond
            },
            {
                "x": "L",
                "y": "R_tcond",            
                "xLabel": "$L \\text{ [m]}$",
                "yLabel": "$R_{\\text{t,cond}} \\text{ [K/kW]}$",
                "xMin": 0,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": yMaxExprR_tcond,
                "yTickInterval": yTickExprR_tcond
            }],
            [{
                "x": "A",
                "y": "R_tcond",                
                "xLabel": "$A \\text{ [m}^2 \\text{]}$",
                "yLabel": "$R_{\\text{t,cond}} \\text{ [K/kW]}$",                
                "xMin": 0,
                "xMax": 0.5,
                "yMin": 0,
                "yMax": yMaxExprR_tcond,
                "yTickInterval": yTickExprR_tcond
            },
            {
                "x": "k",
                "y": "R_tcond",                
                "xLabel": "$k \\text{ [W/(m·K)]}$",
                "yLabel": "$R_{\\text{t,cond}} \\text{ [K/kW]}$",                
                "xMin": 0,
                "xMax": 60,
                "yMin": 0,
                "yMax": yMaxExprR_tcond,
                "yTickInterval": yTickExprR_tcond
            }],                             
        ],
        
        "text": "Drag the slider or the point on the plot to dynamically update the calculation."
    }
};
