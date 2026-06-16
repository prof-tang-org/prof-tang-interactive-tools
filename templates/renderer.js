/**
 * renderer.js
 * Dynamically maps data from a topic file into the skeleton HTML.
 */

// ---------------------------------------------------------
// SECTION A: Equation Elements
// ---------------------------------------------------------
function parseMarkdown(text) {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function renderEquations(data) {
    const container = document.getElementById('equation-container');
    if (!container) return;

    // Isolate the dark-card that holds the equations to preserve schematic layout
    const eqCard = container.querySelector('.dark-card:not(.schem)');
    if (eqCard) {
        eqCard.innerHTML = ''; // Clear filler

        data.forEach(item => {
            if (item.type === 'header') {
                const h3 = document.createElement('h3');
                h3.innerHTML = parseMarkdown(item.text);
                eqCard.appendChild(h3);
            } else if (item.type === 'equation') {
                const div = document.createElement('div');
                div.className = 'eqbig';
                div.innerHTML = `\\( ${item.text} \\)`;
                eqCard.appendChild(div);
            } else if (item.type === 'note') {
                const div = document.createElement('div');
                div.className = 'note';
                div.innerHTML = parseMarkdown(item.text);
                eqCard.appendChild(div);
            } else if (item.type === 'symbols') {
                const div = document.createElement('div');
                div.className = 'note';
                div.innerHTML = '<b>Symbols</b>';
                const ul = document.createElement('ul');
                item.content.forEach(sym => {
                    const li = document.createElement('li');
                    const rawSym = sym.symbol.replace(/\$/g, '');
                    li.innerHTML = `\\( ${rawSym} \\) — ${parseMarkdown(sym.text)}`;
                    ul.appendChild(li);
                });
                div.appendChild(ul);
                eqCard.appendChild(div);
            }
        });

        // Trigger MathJax if ready
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([eqCard]).catch(err => console.error(err));
        }
    }
}

// ---------------------------------------------------------
// SECTION B: Controls & Inputs
// ---------------------------------------------------------
function renderControls(inputs) {
    const container = document.getElementById('controls');
    if (!container) return;
    container.innerHTML = ''; // Clear filler HTML

    inputs.forEach(input => {
        const wrapper = document.createElement('div');
        
        const label = document.createElement('label');
        label.innerHTML = parseMarkdown(input.text || input.id);
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
            range.addEventListener('input', e => { num.value = e.target.value; });
            
            wrapper.appendChild(range);
        }
        
        container.appendChild(wrapper);
    });
}

function renderOutputs(outputs) {
    const kpiContainer = document.querySelector('.kpi');
    if (!kpiContainer) return;
    kpiContainer.innerHTML = '';
    
    outputs.forEach(output => {
        const div = document.createElement('div');
        
        const lab = document.createElement('div');
        lab.className = 'lab';
        lab.innerHTML = parseMarkdown(output.text);
        
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
    if (!pageData.plots || pageData.plots.length === 0 || typeof d3 === 'undefined') return;
    
    const svg = d3.select('#plot');
    if (svg.empty()) return;
    svg.selectAll('*').remove(); // Clear previous plot
    
    const W = 760, H = 320, m = { l: 64, r: 30, t: 14, b: 54 };
    const gap = 80;
    const numPlots = pageData.plots.length;
    const totalGap = gap * (numPlots - 1);
    const iw = (W - m.l - m.r - totalGap) / numPlots;
    const ih = H - m.t - m.b;
    
    pageData.plots.forEach((plotConfig, i) => {
        const plot_x_offset = m.l + i * (iw + gap);
        
        let currentYVal = state[plotConfig.y];
        if (currentYVal === undefined || isNaN(currentYVal)) return;

        let yMax = plotConfig.yMax;
        if (Array.isArray(yMax)) {
            // Evaluate dynamic max bounds based on current Y value
            yMax = yMax.find(maxVal => currentYVal <= maxVal) || yMax[yMax.length - 1];
        }
        
        const x = d3.scaleLinear().domain([plotConfig.xMin, plotConfig.xMax]).range([plot_x_offset, plot_x_offset + iw]);
        const y = d3.scaleLinear().domain([plotConfig.yMin, yMax]).range([m.t + ih, m.t]);
        
        // Axes
        svg.append('g').attr('class', 'axis')
           .attr('transform', `translate(0,${m.t + ih})`)
           .call(d3.axisBottom(x).ticks(5));
           
        svg.append('g').attr('class', 'axis')
           .attr('transform', `translate(${plot_x_offset},0)`)
           .call(d3.axisLeft(y).ticks(5));
        
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
           .attr('d', d3.line()(lineData));
        
        // Draw Current Point
        const currentXVal = state[plotConfig.x];
        const dragpt = svg.append('circle').attr('class', 'dragpt')
            .attr('clip-path', `url(#${clipId})`)
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
                }
                
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
}

// ---------------------------------------------------------
// Main Initialization Hook
// ---------------------------------------------------------
window.addEventListener('load', () => {
    if (typeof pageData !== 'undefined') {
        const titleEl = document.getElementById("header-title");
        if (titleEl) titleEl.textContent = pageData.title;
        
        renderEquations(pageData.equationElements);
        renderControls(pageData.inputOutput.inputs);
        renderOutputs(pageData.inputOutput.outputs);
        
        setupCalculationEngine(pageData);
    } else {
        console.error("pageData is not defined. Ensure the data script is loaded before renderer.js.");
    }
});
