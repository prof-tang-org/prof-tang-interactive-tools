/**
 * renderer.js
 * Dynamically maps data from a topic file into the skeleton HTML.
 */

// ---------------------------------------------------------
// SECTION 0: Layout Configuration
function configLayout(layout) {
    if (!layout || !layout.grid) return;

    gridEls = document.getElementsByClassName('grid');
    if (gridEls.length !== layout.grid.length) {
        console.warn(`Layout grid definition length (${layout.grid.length}) does not match number of grid elements in the DOM (${gridEls.length}).`);
    }
    for (let i = 0; i < gridEls.length; i++) {
        const gridDef = layout.grid[i];
        if (gridDef) {
            const isMobile = window.matchMedia(`(max-width: ${layout.breakpoint || '768px'})`).matches;

            if (isMobile) {
                gridEls[i].style.gridTemplateColumns = gridDef.mobile || '100%';
            } else {
                gridEls[i].style.gridTemplateColumns = gridDef.desktop || '1.5fr 0.9fr';
            }
        } else {
            console.warn(`No grid definition found for grid element index ${i}.`);
        }
    }
}

// ---------------------------------------------------------
// SECTION A: Equation Elements
// ---------------------------------------------------------
function parseText(text) {
    if (!text) return '';

    // 1. Escape HTML characters first to prevent layout breakages
    let parsed = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 2. Handle Block LaTeX: $$ equation $$ -> \[ equation \]
    // Using [^$]*? or \s\S*? to safely match across multiple blocks non-greedily
    parsed = parsed.replace(/\$\$([\s\S]*?)\$\$/g, '\\[ $1 \\]');

    // 3. Handle Inline LaTeX: $ equation $ -> \( equation \)
    // Lookbehind/lookahead ensures we don't accidentally match half of a block equation
    parsed = parsed.replace(/(?<!\$)\$([^$]+?)\$(?!\$)/g, '\\( $1 \\)');

    // 4. Handle Basic Markdown Formatting
    parsed = parsed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold: **text**
        .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italics: *text*
        .replace(/__(.*?)__/g, '<u>$1</u>');              // Underline: __text__

    return parsed;
}

function renderContent(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    // Isolate the dark-card that holds the equations to preserve schematic layout
    // const eqCard = container.querySelector('.dark-card:not(.schem)');
    const card = document.createElement('div'); // Create a new div to hold content within container
    card.className = 'dark-card';

    if (card) {
        // 1. Safe, efficient way to clear filler content without innerHTML
        card.textContent = ''; 

        data.forEach(item => {
            if (item.type === 'header') {
                const h3 = document.createElement('h3');
                // Safely inject parsed markdown tags
                h3.insertAdjacentHTML('beforeend', parseText(item.text));
                card.appendChild(h3);
            } else if (item.type === 'equation') {
                const div = document.createElement('div');
                div.className = 'eqbig';
                // Pure text wrapper for MathJax string literals
                div.textContent = `\\( ${item.text} \\)`;
                card.appendChild(div);

            } else if (item.type === 'note') {
                const div = document.createElement('div');
                div.className = 'note';
                div.insertAdjacentHTML('beforeend', parseText(item.text));
                card.appendChild(div);

            } else if (item.type === 'list') {
                const div = document.createElement('div');
                div.className = 'note';
                
                // Replaced <b> innerHTML template string with a safe element structure
                const b = document.createElement('b');
                b.textContent = item.header;
                div.appendChild(b);

                const ul = document.createElement('ul');
                item.content.forEach(sym => {
                    const li = document.createElement('li');
                    li.insertAdjacentHTML('beforeend', parseText(sym.text));
                    ul.appendChild(li);
                });
                
                div.appendChild(ul);
                card.appendChild(div);
            } else if (item.type === 'schematic') {
                const equationSchematicContainer = document.getElementById('eqschem-container');
                const schematicContainer = document.getElementById('schematic-image-container');
                if (equationSchematicContainer && schematicContainer) {
                    const schematic = schematicContainer.querySelector('img');
                    if (schematic) {
                        schematic.src = item.src;
                        schematic.alt = item.alt;
                        schematicContainer.classList.remove('hidden'); // Show schematic container
                        equationSchematicContainer.classList.add('eq-schem'); // Add class to equation-schematic container for layout adjustment
                    }
                } else {
                    console.warn(`${equationSchematicContainer ? 'Schematic' : 'Equation'} image element not found in the DOM.`);
                }
            } else {
                console.warn(`Unknown equation element type: ${item.type}`);
            }
        });

        container.appendChild(card);

        // Trigger MathJax if ready
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([card]).catch(err => console.error(err));
        }
    } else {
        console.error("Failed to create card to render content.");
    }
}

function renderSchematic(schematic) {
    const container = document.getElementById('schematic-image-container');
    if (!container) {
        console.error("Schematic image container not found.");
        return;
    }
    const img = container.querySelector('img');
    if (img) {
        img.src = schematic.src;
        img.alt = schematic.alt;
    } else {
        console.error("Schematic image element not found in the container.");
    }
}

// ---------------------------------------------------------
// SECTION B: Controls & Inputs
// ---------------------------------------------------------

function clampInputValue(e, inputDef) {
    let val = parseFloat(e.target.value);
    if (!isNaN(val)) {
        if (inputDef.min !== undefined) val = Math.max(inputDef.min, val);
        if (inputDef.max !== undefined) val = Math.min(inputDef.max, val);
        e.target.value = val; // Forces the input box value to snap visually on change
        return val;
    }
    return null;
}

function renderControls(inputs) {
    const container = document.getElementById('controls');
    if (!container) return;
    container.innerHTML = ''; // Clear filler HTML

    inputs.forEach(input => {
        const wrapper = document.createElement('div');
        
        const label = document.createElement('label');
        label.innerHTML = parseText(input.text || input.id);
        wrapper.appendChild(label);

        if (input.type === 'dropdown') {
            const select = document.createElement('select');
            select.id = `input_${input.id}`;
            input.choices.forEach(choice => {
                const opt = document.createElement('option');
                opt.value = choice.value;
                opt.textContent = choice.text;
                select.appendChild(opt);
            });
            wrapper.appendChild(select);
            
            if (input.notes) {
                const note = document.createElement('div');
                note.className = 'note';
                note.textContent = input.notes;
                wrapper.appendChild(note);
            }
        } else if (input.type === 'number') {
            const num = document.createElement('input');
            num.type = 'number';
            num.id = `input_${input.id}`;
            num.className = 'num-sm';
            if (input.min !== undefined) num.min = input.min;
            if (input.max !== undefined) num.max = input.max;
            if (input.step !== undefined) num.step = input.step;
            if (input.initialValue !== undefined) num.value = input.initialValue;
            wrapper.appendChild(num);
        } else if (input.type === 'slider') {
            const inline = document.createElement('div');
            inline.className = 'inline';
            
            const num = document.createElement('input');
            num.type = 'number';
            num.id = `input_${input.id}_num`;
            num.className = 'num-sm';
            
            const range = document.createElement('input');
            range.type = 'range';
            range.id = `input_${input.id}`;
            
            [num, range].forEach(el => {
                if (input.min !== undefined) el.min = input.min;
                if (input.max !== undefined) el.max = input.max;
                if (input.step !== undefined) el.step = input.step;
                if (input.initialValue !== undefined) el.value = input.initialValue;
            });

            // 2-way data binding
            num.addEventListener('input', e => { range.value = e.target.value; });
            num.addEventListener('change', e => { clampInputValue(e, input); });

            range.addEventListener('input', e => { num.value = e.target.value; });

            inline.appendChild(num);
            inline.appendChild(range);
            wrapper.appendChild(inline);
            
        } else if (input.type === 'slider-dropdown') {
            const inline = document.createElement('div');
            inline.className = 'inline';
            
            const num = document.createElement('input');
            num.type = 'number';
            num.id = `input_${input.id}_num`;
            num.className = 'num-sm';
            if (input.min !== undefined) num.min = input.min;
            if (input.max !== undefined) num.max = input.max;
            if (input.step !== undefined) num.step = input.step;
            if (input.initialValue !== undefined) num.value = input.initialValue;
            
            const select = document.createElement('select');
            select.id = `input_${input.id}_unit`;
            if (input.choices) {
                input.choices.forEach(choice => {
                    const opt = document.createElement('option');
                    opt.value = choice.value;
                    opt.textContent = choice.text;
                    select.appendChild(opt);
                });
            }
            
            inline.appendChild(num);
            inline.appendChild(select);
            wrapper.appendChild(inline);
            
            const range = document.createElement('input');
            range.type = 'range';
            range.id = `input_${input.id}`;
            if (input.min !== undefined) range.min = input.min;
            if (input.max !== undefined) range.max = input.max;
            if (input.step !== undefined) range.step = input.step;
            if (input.initialValue !== undefined) range.value = input.initialValue;
            
            num.addEventListener('input', e => { range.value = e.target.value; });
            num.addEventListener('change', e => { clampInputValue(e, input); });
            range.addEventListener('input', e => { num.value = e.target.value; });
            
            wrapper.appendChild(range);
        }
        
        container.appendChild(wrapper);
    });
}

function renderOutputs(outputs) {
    const kpiContainer = document.querySelector('.kpi');
    if (!kpiContainer) return;
    kpiContainer.textContent = '';
    kpiContainer.style.gridTemplateColumns = `repeat(${outputs.length}, minmax(60px, 1fr))`;
    
    outputs.forEach(output => {
        const div = document.createElement('div');
        
        const lab = document.createElement('div');
        lab.className = 'lab';
        lab.textContent = parseText(output.text);
        
        const val = document.createElement('div');
        val.className = 'val';
        val.id = `kpi_${output.id}`;
        val.textContent = '—';
        
        div.appendChild(lab);
        div.appendChild(val);
        kpiContainer.appendChild(div);
    });
}

// ---------------------------------------------------------
// SECTION C: Calculations & Live Updates
// ---------------------------------------------------------

function evaluateFormula(formula, state) {
    let parsedFormula = formula;
    
    // Sort keys descending to safely replace longer IDs first
    const keys = Object.keys(state).sort((a, b) => b.length - a.length);
    keys.forEach(k => {
        const escapedKey = k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(^|[^a-zA-Z0-9_\\-])(${escapedKey})([^a-zA-Z0-9_\\-]|$)`, 'g');
        parsedFormula = parsedFormula.replace(regex, (match, p1, p2, p3) => {
            return p1 + `state["${k}"]` + p3;
        });
    });
    
    // Replace standard math functions with Math.xxx
    const mathFuncs = Object.getOwnPropertyNames(Math);
    mathFuncs.forEach(func => {
        const regex = new RegExp(`(^|[^a-zA-Z0-9_.])(${func})\\b`, 'g');
        parsedFormula = parsedFormula.replace(regex, `$1Math.$2`);
    });
    
    try {
        const fn = new Function('state', `return ${parsedFormula};`);
        return fn(state);
    } catch(e) {
        console.error("Evaluation Error:", formula, parsedFormula, e);
        return NaN;
    }
}

function formatNumber(val) {
    if (!Number.isFinite(val)) return '—';
    if (Math.abs(val) >= 10000 || (Math.abs(val) < 0.001 && val !== 0)) {
        return val.toExponential(2);
    }
    return parseFloat(val.toPrecision(4)).toString();
}

function setupCalculationEngine(pageData) {
    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return;

    let lastChangedInputId = null;

    function gatherInputs() {
        const state = {};
        pageData.inputOutput.inputs.forEach(input => {
            const el = document.getElementById(`input_${input.id}`);
            if (el) {
                if (input.type === 'dropdown') {
                    state[input.id] = el.value;
                } else {
                    state[input.id] = parseFloat(el.value);
                }
            }
        });
        return state;
    }

    function calculateOutputs(state) {
        pageData.inputOutput.outputs.forEach(output => {
            let val;
            if (output.type === 'map') {
                const keyInput = pageData.inputOutput.inputs.find(i => i.id === output.key);
                if (keyInput && keyInput.type === 'dropdown') {
                    const selectedValue = state[output.key];
                    const selectedIndex = keyInput.choices.findIndex(c => c.value === selectedValue);
                    if (selectedIndex !== -1 && output.value[selectedIndex] !== undefined) {
                        val = output.value[selectedIndex];
                    }
                }
            } else if (output.type === 'calculation') {
                val = evaluateFormula(output.value, state);
            }
            
            state[output.id] = val;
            
            const el = document.getElementById(`kpi_${output.id}`);
            if (el) {
                el.textContent = (typeof val === 'number') ? formatNumber(val) : val;
            }
        });
    }

    function compute(e) {
        if (e && e.target && e.target.id) {
            // strip 'input_' and '_num' prefixes/suffixes to get core ID
            let rawId = e.target.id.replace('input_', '').replace('_num', '');
            if (pageData.inputOutput.inputs.find(i => i.id === rawId)) {
                lastChangedInputId = rawId;
            }
        }
        
        const state = gatherInputs();
        calculateOutputs(state);
        
        injectPlots(state, pageData);
    }

    // Expose a global hook for D3 drag events to trigger calculations
    window.forceCompute = function(inputId) {
        lastChangedInputId = inputId;
        compute();
    };

    controlsContainer.addEventListener('input', compute);
    controlsContainer.addEventListener('change', compute);

    // Initial compute
    compute();
}

// ---------------------------------------------------------
// SECTION D: Plot Integration
// ---------------------------------------------------------

function injectPlots(state, pageData) {
    if (!pageData.plots || pageData.plots.settings.length === 0 || typeof d3 === 'undefined') return;
    
    const svg = d3.select('#plot');
    if (svg.empty()) return;
    svg.selectAll('*').remove(); // Clear previous plot
    
    const W = 760, H = 320, m = { l: 64, r: 30, t: 14, b: 54 };
    const gap = 80;
    const numPlots = pageData.plots.settings.length;
    const totalGap = gap * (numPlots - 1);
    const iw = (W - m.l - m.r - totalGap) / numPlots;
    const ih = H - m.t - m.b;
    
    pageData.plots.settings.forEach((plotConfig, i) => {
        const plot_x_offset = m.l + i * (iw + gap);
        
        let currentYVal = state[plotConfig.y];
        if (currentYVal === undefined || isNaN(currentYVal)) return;

        let yMax = plotConfig.yMax;
        let yIndex = 0;
        if (Array.isArray(yMax)) {
            // Evaluate dynamic max bounds based on current Y value
            const matchedVal = yMax.find(maxVal => currentYVal <= maxVal);
            if (matchedVal !== undefined) {
                yIndex = yMax.indexOf(matchedVal);
                yMax = matchedVal;
            } else {
                yIndex = yMax.length - 1;
                yMax = yMax[yIndex];
            }
        }
        
        const x = d3.scaleLinear().domain([plotConfig.xMin, plotConfig.xMax]).range([plot_x_offset, plot_x_offset + iw]);
        const y = d3.scaleLinear().domain([plotConfig.yMin, yMax]).range([m.t + ih, m.t]);
        
        // Axes
        const xAxis = d3.axisBottom(x).ticks(5);
        if (plotConfig.xTickInterval !== undefined) {
            let xTickInterval = plotConfig.xTickInterval;
            if (Array.isArray(xTickInterval)) {
                xTickInterval = xTickInterval[0];
            }
            const ticks = d3.range(plotConfig.xMin, plotConfig.xMax + xTickInterval / 2, xTickInterval);
            xAxis.tickValues(ticks);
            xAxis.tickFormat(d => parseFloat(d.toFixed(4)).toString());
        }
        svg.append('g').attr('class', 'axis')
           .attr('transform', `translate(0,${m.t + ih})`)
           .call(xAxis);
           
        const yAxis = d3.axisLeft(y).ticks(5);
        if (plotConfig.yTickInterval !== undefined) {
            let yTickInterval = plotConfig.yTickInterval;
            if (Array.isArray(yTickInterval)) {
                yTickInterval = yTickInterval[yIndex] !== undefined ? yTickInterval[yIndex] : yTickInterval[yTickInterval.length - 1];
            }
            const ticks = d3.range(plotConfig.yMin, yMax + yTickInterval / 2, yTickInterval);
            yAxis.tickValues(ticks);
            yAxis.tickFormat(d => parseFloat(d.toFixed(4)).toString());
        }
        svg.append('g').attr('class', 'axis')
           .attr('transform', `translate(${plot_x_offset},0)`)
           .call(yAxis);
        
        // Labels
        svg.append('text').attr('class', 'axis-title')
           .attr('x', plot_x_offset + iw/2).attr('y', H - 10)
           .attr('text-anchor', 'middle').text(plotConfig.xLabel);
           
        svg.append('text').attr('class', 'axis-title')
           .attr('x', -(m.t + ih/2)).attr('y', plot_x_offset - 45)
           .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
           .text(plotConfig.yLabel);
        
        // Generate Curve
        const steps = 100;
        const xVals = d3.range(plotConfig.xMin, plotConfig.xMax + (plotConfig.xMax - plotConfig.xMin)/steps, (plotConfig.xMax - plotConfig.xMin)/steps);
        
        const lineData = xVals.map(xVal => {
            const tempState = { ...state };
            tempState[plotConfig.x] = xVal;
            
            pageData.inputOutput.outputs.forEach(output => {
                if (output.type === 'calculation') {
                    tempState[output.id] = evaluateFormula(output.value, tempState);
                }
            });
            
            return [ x(xVal), y(tempState[plotConfig.y]) ];
        });
        
        // Add clip path for the plot
        const clipId = `clip-${i}`;
        svg.append('clipPath').attr('id', clipId)
           .append('rect').attr('x', plot_x_offset).attr('y', m.t)
           .attr('width', iw).attr('height', ih);

        svg.append('path').attr('class', 'curve')
           .attr('clip-path', `url(#${clipId})`)
           .attr('d', d3.line().defined(d => !isNaN(d[1]))(lineData));
        
        // Draw Current Point
        const currentXVal = state[plotConfig.x];
        const dragpt = svg.append('circle').attr('class', 'dragpt')
            .attr('r', 6).attr('cx', x(currentXVal)).attr('cy', y(currentYVal));
            
        // Interaction Background
        const hit = svg.append('rect').attr('class', 'hit')
            .attr('x', plot_x_offset).attr('y', m.t)
            .attr('width', iw).attr('height', ih);
            
        const drag = d3.drag()
            .on('start drag', (event) => {
                let newX = Math.max(plotConfig.xMin, Math.min(plotConfig.xMax, x.invert(event.x)));
                
                const inputDef = pageData.inputOutput.inputs.find(inp => inp.id === plotConfig.x);
                if (inputDef && inputDef.step) {
                    newX = Math.round(newX / inputDef.step) * inputDef.step;

                    // Round to same amount of decimals as step
                    const stepStr = inputDef.step.toString();
                    const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
                    newX = parseFloat(newX.toFixed(decimalPlaces));
                }

                // Clamp between absolute min/max bounds (from plot config and input config)
                let absoluteMin = plotConfig.xMin;
                let absoluteMax = plotConfig.xMax;

                if (inputDef) {
                    if (inputDef.min !== undefined) absoluteMin = Math.max(absoluteMin, inputDef.min);
                    if (inputDef.max !== undefined) absoluteMax = Math.min(absoluteMax, inputDef.max);
                }

                newX = Math.max(absoluteMin, Math.min(absoluteMax, newX));
                
                // Sync Input DOM Elements
                const elNum = document.getElementById(`input_${plotConfig.x}_num`);
                const elPrimary = document.getElementById(`input_${plotConfig.x}`);
                if (elNum) elNum.value = newX;
                if (elPrimary) elPrimary.value = newX;
                
                // Recompute
                if (window.forceCompute) {
                    window.forceCompute(plotConfig.x);
                }
            });
            
        hit.call(drag);
    });

    const plotNote = document.getElementById("plot-note");
    plotNote.innerHTML = parseText(pageData.plots.text);
}

// ---------------------------------------------------------
// Main Initialization Hook
// ---------------------------------------------------------
window.addEventListener('load', async () => {
    const pathname = window.location.pathname;
    if (!/^\/templates?\/.+/.test(pathname)) {
        console.error(`Unexpected URL path: ${pathname}. Expected /templates/...`);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const course = urlParams.get('course');
    const topic = urlParams.get('topic');

    

    // Temporary dynamic loading using url parameters
    if (course && topic) {
        const dataScript = document.createElement('script');
        dataScript.src = `../${course}/${topic}.js`

        const scriptLoadPromise = new Promise((resolve, reject) => {
            dataScript.onload = () => {
                // console.log('Data script downloaded and parsed successfully.');
                resolve();
            };
            dataScript.onerror = () => {
                reject(new Error(`Failed to load script: ${dataScript.src}`));
            };
        });

        document.body.appendChild(dataScript);

        try {
            await scriptLoadPromise;
        } catch (error) {
            console.error(error);
            return; // Halt execution if the file doesn't exist
        }

        for (let containerEl of document.getElementsByClassName('container')) {
            containerEl.classList.add('active');
        }
    }

    if (typeof pageData !== 'undefined') {
        const titleEl = document.getElementById("header-title");
        if (titleEl) titleEl.textContent = pageData.title;
        
        configLayout(pageData.layout);
        renderContent(pageData.equationElements, 'equation-container');
        if (pageData.derivationElements) {
            renderContent(pageData.derivationElements, 'equation-container');
        }
        if (pageData.schematic) {
            renderSchematic(pageData.schematic);
        }
        renderControls(pageData.inputOutput.inputs);
        renderOutputs(pageData.inputOutput.outputs);
        
        setupCalculationEngine(pageData);
    } else {
        console.error("pageData is not defined. Ensure the data script is loaded before renderer.js.");
    }
});
