/** @type {PageData} */
const pageData = {
    "title": "Pulse Tube Refrigerator (PTR) Simulation",
    "layout": {
        "grid": [
            {
                "desktop": "0.39fr 0.61fr",
                "mobile": "100%"
            },
            {
                "desktop": "0.5fr 0.5fr",
                "mobile": "100%"
            }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Helium is the working fluid.",
                "The solid surface temperatures of REGAHX and PTAHX are 300 K.",
                "The solid surface temperature of REGCHX is 100 K.",
                "The inlet acoustic power is 150 W.",
                "The mean pressure is 3.0 MPa, while the pressure ratio and presssure phase angle are 1.2 and zero degrees, respectively, at the inlet.",
                "Only the inlet volumetric-flow phase angle varies."
            ]
        },
    //     {
    //         "type": "equations",
    //         "content": [
    //             "Q_{\\text{doc,c}} = H_{\\text{ptr4}} - H_{\\text{ptr3}}",
    //             "\\text{COP} = \\frac{Q_{\\text{doc,c}}}{P_{\\text{ptr}}}"
    //         ]
    //     },
    //     {
    //         "type": "symbols",
    //         "content": [
    //             { "symbol": "$\\theta_U$", "definition": "phase angle of inlet volumetric flow rate" },
    //             { "symbol": "$Q_{\\text{doc,c}}$", "definition": "refrigeration capacity" },
    //             { "symbol": "$\\text{COP}$", "definition": "coefficient of performance" }
    //         ]
    //     }
    ],
    "schematic": {
        "src": "../assets/me401/PTR.png",
        "alt": "Pulse tube refrigerator schematic showing the regenerator and pulse tube components."
    },
    "inputOutput": {
        "pythonScript": {
            "path": "../test/PTR-simulation-calc.py",
            "function": "calculate_ptr",
            "packages": ["scipy"]
        },
        "inputs": [
            {
                "type": "number",
                "id": "AngleUptr",
                "text": "Inlet Flow Phase Angle, $\\alpha_U$ [deg], -25 to 50 [deg]",
                "min": -25,
                "max": 50,
                "initialValue": 15,
                "step": 1
            }
        ],
        "outputs": [
            { "id": "Anglepptr1", "text": "Pressure phase, $\\angle p_1$ [deg]", "decimals": 2 },
            { "id": "AngleUptr1", "text": "Flow phase, $\\angle U_1$ [deg]", "decimals": 2 },
            { "id": "ADpUptr1", "text": "Phase difference, $\\Delta\\alpha_1$ [deg]", "decimals": 2 },
            { "id": "Abspptr1", "text": "Pressure amplitude, $|p_1|$ [bar]", "decimals": 3 },
            { "id": "AbsUptr1", "text": "Flow amplitude, $|U_1|$ [$10^{-4}$ m³/s]", "decimals": 3 },
            { "id": "Tptr1", "text": "Temperature, $T_1$ [K]", "decimals": 2 },
            { "id": "Powerptr1", "text": "Acoustic power, $P_1$ [W]", "decimals": 2 },
            { "id": "Hptr1", "text": "Total energy flow, $H_1$ [W]", "decimals": 2 },
            { "id": "Anglepptr2", "text": "Pressure phase, $\\angle p_2$ [deg]", "decimals": 2 },
            { "id": "AngleUptr2", "text": "Flow phase, $\\angle U_2$ [deg]", "decimals": 2 },
            { "id": "ADpUptr2", "text": "Phase difference, $\\Delta\\alpha_2$ [deg]", "decimals": 2 },
            { "id": "Abspptr2", "text": "Pressure amplitude, $|p_2|$ [bar]", "decimals": 3 },
            { "id": "AbsUptr2", "text": "Flow amplitude, $|U_2|$ [$10^{-4}$ m³/s]", "decimals": 3 },
            { "id": "Tptr2", "text": "Temperature, $T_2$ [K]", "decimals": 2 },
            { "id": "Powerptr2", "text": "Acoustic power, $P_2$ [W]", "decimals": 2 },
            { "id": "Hptr2", "text": "Total energy flow, $H_2$ [W]", "decimals": 2 },
            { "id": "Anglepptr3", "text": "Pressure phase, $\\angle p_3$ [deg]", "decimals": 2 },
            { "id": "AngleUptr3", "text": "Flow phase, $\\angle U_3$ [deg]", "decimals": 2 },
            { "id": "ADpUptr3", "text": "Phase difference, $\\Delta\\alpha_3$ [deg]", "decimals": 2 },
            { "id": "Abspptr3", "text": "Pressure amplitude, $|p_3|$ [bar]", "decimals": 3 },
            { "id": "AbsUptr3", "text": "Flow amplitude, $|U_3|$ [$10^{-4}$ m³/s]", "decimals": 3 },
            { "id": "Tptr3", "text": "Temperature, $T_3$ [K]", "decimals": 2 },
            { "id": "Powerptr3", "text": "Acoustic power, $P_3$ [W]", "decimals": 2 },
            { "id": "Hptr3", "text": "Total energy flow, $H_3$ [W]", "decimals": 2 },
            { "id": "Anglepptr4", "text": "Pressure phase, $\\angle p_4$ [deg]", "decimals": 2 },
            { "id": "AngleUptr4", "text": "Flow phase, $\\angle U_4$ [deg]", "decimals": 2 },
            { "id": "ADpUptr4", "text": "Phase difference, $\\Delta\\alpha_4$ [deg]", "decimals": 2 },
            { "id": "Abspptr4", "text": "Pressure amplitude, $|p_4|$ [bar]", "decimals": 3 },
            { "id": "AbsUptr4", "text": "Flow amplitude, $|U_4|$ [$10^{-4}$ m³/s]", "decimals": 3 },
            { "id": "Tptr4", "text": "Temperature, $T_4$ [K]", "decimals": 2 },
            { "id": "Powerptr4", "text": "Acoustic power, $P_4$ [W]", "decimals": 2 },
            { "id": "Hptr4", "text": "Total energy flow, $H_4$ [W]", "decimals": 2 },
            { "id": "Anglepptr5", "text": "Pressure phase, $\\angle p_5$ [deg]", "decimals": 2 },
            { "id": "AngleUptr5", "text": "Flow phase, $\\angle U_5$ [deg]", "decimals": 2 },
            { "id": "ADpUptr5", "text": "Phase difference, $\\Delta\\alpha_5$ [deg]", "decimals": 2 },
            { "id": "Abspptr5", "text": "Pressure amplitude, $|p_5|$ [bar]", "decimals": 3 },
            { "id": "AbsUptr5", "text": "Flow amplitude, $|U_5|$ [$10^{-4}$ m³/s]", "decimals": 3 },
            { "id": "Tptr5", "text": "Temperature, $T_5$ [K]", "decimals": 2 },
            { "id": "Powerptr5", "text": "Acoustic power, $P_5$ [W]", "decimals": 2 },
            { "id": "Hptr5", "text": "Total energy flow, $H_5$ [W]", "decimals": 2 },
            { "id": "Anglepptr6", "text": "Pressure phase, $\\angle p_6$ [deg]", "decimals": 2 },
            { "id": "AngleUptr6", "text": "Flow phase, $\\angle U_6$ [deg]", "decimals": 2 },
            { "id": "ADpUptr6", "text": "Phase difference, $\\Delta\\alpha_6$ [deg]", "decimals": 2 },
            { "id": "Abspptr6", "text": "Pressure amplitude, $|p_6|$ [bar]", "decimals": 3 },
            { "id": "AbsUptr6", "text": "Flow amplitude, $|U_6|$ [$10^{-4}$ m³/s]", "decimals": 3 },
            { "id": "Tptr6", "text": "Temperature, $T_6$ [K]", "decimals": 2 },
            { "id": "Powerptr6", "text": "Acoustic power, $P_6$ [W]", "decimals": 2 },
            { "id": "Hptr6", "text": "Total energy flow, $H_6$ [W]", "decimals": 2 },
            {
                "id": "Q_dot_c",
                "text": "Refrigeration Capacity, $Q_{\\text{doc,c}}$ [W]",
                "decimals": 2
            },
            {
                "id": "COP",
                "text": "Coefficient of Performance, $\\text{COP}$ [-]",
                "decimals": 3
            },
        ],
        "outputColumns": 4
    },
    "plots": {
        "aspectRatio": 1.45,
        "plotColumns": 1,
        "settings": [
            {
                "x": "AngleUptr",
                "y": "Q_dot_c",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$\\text{Anglep, AngleU, or ADpU [deg]}$",
                "xMin": 0,
                "xMax": 0.25,
                "xTickInterval": 0.05,
                "yMin": -80,
                "yMax": 80,
                "yTickInterval": 20,
                "series": [
                    { "points": "anglep_points", "pointsColor": "#dc2626", "showPoints": false, "lineWidth": 1.5 },
                    { "points": "angleu_points", "pointsColor": "#2563eb", "showPoints": false, "lineWidth": 1.5 },
                    { "points": "adpu_points", "pointsColor": "#16a34a", "showPoints": false, "lineWidth": 1.5 },
                    {
                        // Literal coordinate list: strings resolve to Python
                        // output variables, so these points still update with
                        // the inputs. Numbers can also be used, e.g. [1.7, 10].
                        // Equivalent to points: "ts_cycle" returned by Python.
                        "points": [
                            ["0.22", "Anglepptr6"],
                            ["0.22", "AngleUptr6"],
                            ["0.22", "ADpUptr6"],
                        ],
                        "pointsColor": "none",
                        "pointRadius": 1,
                        // Labels use the same point order; '' omits a label.
                        // offset: [dx, dy] moves the label in screen pixels:
                        // positive dx is right, positive dy is down.
                        // Optional anchor (left/center/right) and align
                        // (top/middle/bottom) control alignment at that offset.
                        "pointLabels": [
                            {
                                "text": "Anglep",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#dc2626"
                            },
                            {
                                "text": "AngleU",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#2563eb"
                            },
                            {
                                "text": "ADpU",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#16a34a"
                            }
                        ]
                    }
                ]
            },
            {
                "x": "AngleUptr",
                "y": "Q_dot_c",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$\\text{Absp [bar] or AbsU } [10^{-4} \\text{ m}^3/\\text{s}]$",
                "xMin": 0,
                "xMax": 0.25,
                "xTickInterval": 0.05,
                "yMin": 0,
                "yMax": 20,
                "yTickInterval": 2,
                "series": [
                    { "points": "absp_points", "pointsColor": "#dc2626", "showPoints": false, "lineWidth": 1.5 },
                    { "points": "absu_points", "pointsColor": "#2563eb", "showPoints": false, "lineWidth": 1.5 },
                    {
                        // Literal coordinate list: strings resolve to Python
                        // output variables, so these points still update with
                        // the inputs. Numbers can also be used, e.g. [1.7, 10].
                        // Equivalent to points: "ts_cycle" returned by Python.
                        "points": [
                            ["0.22", "Abspptr6"],
                            ["0.22", "AbsUptr6"],                            
                        ],
                        "pointsColor": "none",
                        "pointRadius": 1,
                        // Labels use the same point order; '' omits a label.
                        // offset: [dx, dy] moves the label in screen pixels:
                        // positive dx is right, positive dy is down.
                        // Optional anchor (left/center/right) and align
                        // (top/middle/bottom) control alignment at that offset.
                        "pointLabels": [
                            {
                                "text": "Absp",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#dc2626"
                            },
                            {
                                "text": "AbsU",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#2563eb"
                            },
                        ]
                    }                                    
                ]
            },
            {
                "x": "AngleUptr",
                "y": "Q_dot_c",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$T_m \\text{ or } T_{\\text{solid}} \\text{ [K]}$",
                "xMin": 0,
                "xMax": 0.25,
                "xTickInterval": 0.05,
                "yMin": 0,
                "yMax": 400,
                "yTickInterval": 50,
                "series": [
                    { "points": "tm_points", "pointsColor": "#dc2626", "showPoints": false, "lineWidth": 1.5 },
                    { "points": "tsolid_points", "pointsColor": "#2563eb", "showPoints": false, "lineWidth": 1.5 },
                    {
                        // Literal coordinate list: strings resolve to Python
                        // output variables, so these points still update with
                        // the inputs. Numbers can also be used, e.g. [1.7, 10].
                        // Equivalent to points: "ts_cycle" returned by Python.
                        "points": [
                            ["0.22", "Tptr6"],
                            ["0.22", "300"],                            
                        ],
                        "pointsColor": "none",
                        "pointRadius": 1,
                        // Labels use the same point order; '' omits a label.
                        // offset: [dx, dy] moves the label in screen pixels:
                        // positive dx is right, positive dy is down.
                        // Optional anchor (left/center/right) and align
                        // (top/middle/bottom) control alignment at that offset.
                        "pointLabels": [
                            {
                                "text": "$T_m$",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#dc2626"
                            },
                            {
                                "text": "$T_{solid}$",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#2563eb"
                            },
                        ]
                    }                        
                ]
            },
            // {
            //     "x": "AngleUptr",
            //     "y": "Q_dot_c",
            //     "xLabel": "$x \\text{ [m]}$",
            //     "yLabel": "$T_m \\text{ or } T_{\\text{solid}} \\text{ [K]}$",
            //     "xMin": 0.05,
            //     "xMax": 0.1,
            //     "xTickInterval": 0.01,
            //     "yMin": 96,
            //     "yMax": 102,
            //     "yTickInterval": 1,
            //     "series": [
            //         { "points": "tm_points", "pointsColor": "#dc2626", "showPoints": false, "lineWidth": 1.5 },
            //         { "points": "tsolid_points", "pointsColor": "#2563eb", "showPoints": false, "lineWidth": 1.5 }
            //     ]
            // },
            {
                "x": "AngleUptr",
                "y": "Q_dot_c",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$\\text{Power or H [W]}$",
                "xMin": 0,
                "xMax": 0.25,
                "xTickInterval": 0.05,
                "yMin": 0,
                "yMax": 200,
                "yTickInterval": 25,
                "series": [
                    { "points": "power_points", "pointsColor": "#dc2626", "showPoints": false, "lineWidth": 1.5 },
                    { "points": "H_points", "pointsColor": "#2563eb", "showPoints": false, "lineWidth": 1.5 },
                    {
                        // Literal coordinate list: strings resolve to Python
                        // output variables, so these points still update with
                        // the inputs. Numbers can also be used, e.g. [1.7, 10].
                        // Equivalent to points: "ts_cycle" returned by Python.
                        "points": [
                            ["0.22", "Powerptr6"],
                            ["0.22", "Hptr6"],                            
                        ],
                        "pointsColor": "none",
                        "pointRadius": 1,
                        // Labels use the same point order; '' omits a label.
                        // offset: [dx, dy] moves the label in screen pixels:
                        // positive dx is right, positive dy is down.
                        // Optional anchor (left/center/right) and align
                        // (top/middle/bottom) control alignment at that offset.
                        "pointLabels": [
                            {
                                "text": "$\\dot{E_2}$",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#dc2626"
                            },
                            {
                                "text": "$\\dot{H_2}$",
                                "offset": [
                                    -10,
                                    0
                                ],
                                "color": "#2563eb"
                            },
                        ]
                    }                          
                ]
            }
        ],
        // "text": "Line key: red = Anglep, Absp, Tm, and Power; blue = AngleU, AbsU, Tsolid, and H; green = ADpU. "
    }
};

(() => {
    const setupCalculationStatus = () => {
        const plot = document.getElementById('plot');
        const controls = document.getElementById('controls');
        if (!plot || !controls || document.getElementById('calculation-status')) return;

        const style = document.createElement('style');
        style.textContent = `
            .calculation-status {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                margin: 0.5rem 0;
            }
            .calculation-status[hidden] {
                display: none;
            }
            .calculation-spinner {
                width: 1rem;
                height: 1rem;
                border: 2px solid currentColor;
                border-right-color: transparent;
                border-radius: 50%;
                animation: calculation-spin 0.8s linear infinite;
            }
            @keyframes calculation-spin {
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                .calculation-spinner {
                    animation-duration: 2s;
                }
            }
        `;
        document.head.appendChild(style);

        const status = document.createElement('div');
        status.className = 'calculation-status';
        status.id = 'calculation-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.innerHTML = '<span class="calculation-spinner" aria-hidden="true"></span><span>Calculating results...</span>';
        plot.parentElement.insertBefore(status, plot);

        const setBusy = (busy) => {
            status.hidden = !busy;
            plot.setAttribute('aria-busy', String(busy));
        };

        const initialRenderObserver = new MutationObserver(() => {
            if (plot.childElementCount > 0) {
                setBusy(false);
                initialRenderObserver.disconnect();
            }
        });
        initialRenderObserver.observe(plot, { childList: true });

        let computeScheduled = false;
        const scheduleCompute = () => {
            setBusy(true);
            if (computeScheduled) return;
            computeScheduled = true;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    computeScheduled = false;
                    try {
                        window.forceCompute();
                    } finally {
                        setBusy(false);
                    }
                });
            });
        };

        document.addEventListener('input', (event) => {
            if (!controls.contains(event.target) || event.target.id !== 'input_AngleUptr') return;

            event.stopImmediatePropagation();
            if (event.target.value === '' || !Number.isFinite(Number(event.target.value))) return;
            scheduleCompute();
        }, true);

        document.addEventListener('change', (event) => {
            if (!controls.contains(event.target) || event.target.id !== 'input_AngleUptr') return;

            event.stopImmediatePropagation();
            const value = Number.parseFloat(event.target.value);
            if (Number.isFinite(value)) {
                const clampedValue = Math.max(-25, Math.min(50, value));
                if (clampedValue !== value) {
                    event.target.value = clampedValue;
                    scheduleCompute();
                }
            }
        }, true);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCalculationStatus, { once: true });
    } else {
        setupCalculationStatus();
    }
})();
