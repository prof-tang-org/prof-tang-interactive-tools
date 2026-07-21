/**
 * renderer.js
 * Dynamically maps data from a topic file into the skeleton HTML.
 */

const mathjaxCache = new Map();
const formulaCache = new Map();

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
                div.textContent = `\\( \\displaystyle ${item.text} \\)`;
                card.appendChild(div);

            } else if (item.type === 'note') {
                const div = document.createElement('div');
                div.className = 'note';
                if (item.text instanceof Array) {
                    item.text.forEach(line => {
                        const p = document.createElement('p');
                        p.insertAdjacentHTML('beforeend', parseText(line));
                        div.appendChild(p);
                    });
                } else {
                    div.insertAdjacentHTML('beforeend', parseText(item.text));
                }
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

function createDropdownSelect(input, selectId) {
    const select = document.createElement('select');
    select.id = selectId;
    if (input.choices) {
        input.choices.forEach(choice => {
            const opt = document.createElement('option');
            opt.value = choice.value;
            opt.textContent = choice.text;
            select.appendChild(opt);
        });
    }
    select.selectedIndex = input.initialChoiceIndex !== undefined ? input.initialChoiceIndex : 0;
    const initCustomVal = input.initialValue ?? input.min ?? 0.01;

    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'select-wrapper';
    selectWrapper.appendChild(select);

    return { select, selectWrapper, initCustomVal };
}

function createSliderControl(input, numId, rangeId, initialValOverride) {
    const num = document.createElement('input');
    num.type = 'number';
    num.id = numId;
    num.className = 'num-sm';

    const range = document.createElement('input');
    range.type = 'range';
    range.id = rangeId;

    const startVal = initialValOverride !== undefined ? initialValOverride : (input.initialValue ?? input.min ?? 0);

    [num, range].forEach(el => {
        if (input.min !== undefined) el.min = input.min;
        if (input.max !== undefined) el.max = input.max;
        if (input.step !== undefined) el.step = input.step;
        el.value = startVal;
    });

    // 2-way data binding
    num.addEventListener('input', e => { range.value = e.target.value; });
    num.addEventListener('change', e => { clampInputValue(e, input); });
    range.addEventListener('input', e => { num.value = e.target.value; });

    const rangeAndLabelsContainer = document.createElement('div');
    rangeAndLabelsContainer.className = 'range-labels-container';
    rangeAndLabelsContainer.appendChild(range);

    const minMaxLabels = document.createElement('div');
    minMaxLabels.className = 'min-max-labels';

    if (input.min !== undefined) {
        const minLabel = document.createElement('span');
        minLabel.className = 'min-label';
        minLabel.id = `label_${input.id}_min`;
        minLabel.textContent = formatNumber(input.min);
        minMaxLabels.appendChild(minLabel);
    }

    if (input.max !== undefined) {
        const maxLabel = document.createElement('span');
        maxLabel.className = 'max-label';
        maxLabel.id = `label_${input.id}_max`;
        maxLabel.textContent = formatNumber(input.max);
        minMaxLabels.appendChild(maxLabel);
    }
    rangeAndLabelsContainer.appendChild(minMaxLabels);

    return { num, range, rangeAndLabelsContainer };
}

function renderControls(inputs) {
    const container = document.getElementById('controls');
    if (!container) return;

    inputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.id = `wrapper_input_${input.id}`;

        const label = document.createElement('label');
        label.id = `label_input_${input.id}`;
        label.innerHTML = parseText(input.text || input.id);
        wrapper.appendChild(label);

        if (input.type === 'dropdown') {
            const inline = document.createElement('div');
            inline.className = 'inline';

            const { select, selectWrapper, initCustomVal } = createDropdownSelect(input, `input_${input.id}`);
            inline.appendChild(selectWrapper);

            if (input.choices && input.choices.some(c => c.value === 'custom')) {
                const customInput = document.createElement('input');
                customInput.type = 'number';
                customInput.id = `input_${input.id}_custom`;
                customInput.className = 'num-sm hidden';
                if (input.min !== undefined) customInput.min = input.min;
                if (input.max !== undefined) customInput.max = input.max;
                if (input.step !== undefined) customInput.step = input.step;
                customInput.value = initCustomVal;

                if (select.value === 'custom') {
                    customInput.classList.remove('hidden');
                }

                customInput.addEventListener('change', e => { clampInputValue(e, input); });

                select.addEventListener('change', e => {
                    if (e.target.value === 'custom') {
                        customInput.classList.remove('hidden');
                        if (!customInput.value) {
                            customInput.value = initCustomVal;
                        }
                    } else {
                        customInput.classList.add('hidden');
                    }
                });

                inline.appendChild(customInput);
            }

            wrapper.appendChild(inline);

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
            num.addEventListener('change', e => { clampInputValue(e, input); });
            wrapper.appendChild(num);
        } else if (input.type === 'slider') {
            const inline = document.createElement('div');
            inline.className = 'inline';

            const { num, rangeAndLabelsContainer } = createSliderControl(input, `input_${input.id}_num`, `input_${input.id}`);

            inline.appendChild(num);
            inline.appendChild(rangeAndLabelsContainer);
            wrapper.appendChild(inline);
        } else if (input.type === 'slider-dropdown') {
            const inline = document.createElement('div');
            inline.className = 'inline';

            const { select, selectWrapper, initCustomVal } = createDropdownSelect(input, `input_${input.id}_dropdown`);

            let startVal;
            if (select.value === 'custom') {
                startVal = initCustomVal;
            } else {
                const parsed = parseFloat(select.value);
                startVal = !isNaN(parsed) ? parsed : initCustomVal;
            }

            const { num, range, rangeAndLabelsContainer } = createSliderControl(input, `input_${input.id}_num`, `input_${input.id}`, startVal);

            const syncSelectFromNumeric = (val) => {
                if (input.choices) {
                    const matchingChoice = input.choices.find(c => c.value !== 'custom' && Math.abs(parseFloat(c.value) - val) < 1e-6);
                    if (matchingChoice) {
                        select.value = matchingChoice.value;
                    } else if (input.choices.some(c => c.value === 'custom')) {
                        select.value = 'custom';
                    }
                }
            };

            select.addEventListener('change', e => {
                if (e.target.value === 'custom') {
                    if (!num.value) {
                        num.value = initCustomVal;
                        range.value = initCustomVal;
                    }
                } else {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) {
                        num.value = parsed;
                        range.value = parsed;
                    }
                }
            });

            num.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) syncSelectFromNumeric(val);
            });
            num.addEventListener('change', e => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) syncSelectFromNumeric(val);
            });
            range.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) syncSelectFromNumeric(val);
            });

            inline.appendChild(num);
            inline.appendChild(selectWrapper);
            wrapper.appendChild(inline);
            wrapper.appendChild(rangeAndLabelsContainer);
        }

        container.appendChild(wrapper);

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([wrapper]).catch(err => console.error(err));
        }
    });
}

function renderGroup(values, containerId, cols = 5) {
    if (values === undefined || values.length === 0) return;

    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = '';
    if (cols) {
        container.style.gridTemplateColumns = `repeat(${Math.min(values.length, cols)}, minmax(60px, 1fr))`;
    }
    container.classList.remove('hidden');

    values.forEach(value => {
        const div = document.createElement('div');
        div.classList.add('value-container');

        const lab = document.createElement('div');
        lab.className = 'lab';
        lab.id = `label_${value.id}`;
        lab.innerHTML = parseText(value.text);

        const val = document.createElement('div');
        val.className = 'val';
        val.id = `value_${value.id}`;
        if (typeof value.value === 'number') {
            val.textContent = formatNumber(value.value);
        } else {
            val.innerHTML = parseText(String(value.value ?? ''));
        }

        div.appendChild(lab);
        div.appendChild(val);
        container.appendChild(div);

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([div]).catch(err => console.error(err));
        }
    });
}

// ---------------------------------------------------------
// SECTION C: Calculations & Live Updates
// ---------------------------------------------------------

function evaluateFormula(formula, state) {
    let fn = formulaCache.get(formula);
    if (!fn) {
        let parsedFormula = formula;

        // Sort keys descending to safely replace longer IDs first
        const keys = Object.keys(state).sort((a, b) => b.length - a.length);
        keys.forEach(k => {
            const escapedKey = k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`(?<![a-zA-Z0-9_])(?<![a-zA-Z0-9_]-)(${escapedKey})(?![a-zA-Z0-9_])(?!-[a-zA-Z0-9_])`, 'g');
            parsedFormula = parsedFormula.replace(regex, `state["${k}"]`);
        });

        // Replace standard math functions with Math.xxx
        const mathFuncs = Object.getOwnPropertyNames(Math);
        mathFuncs.forEach(func => {
            const regex = new RegExp(`(^|[^a-zA-Z0-9_.])(${func})\\b`, 'g');
            parsedFormula = parsedFormula.replace(regex, `$1Math.$2`);
        });

        try {
            fn = new Function('state', `return ${parsedFormula};`);
            formulaCache.set(formula, fn);
        } catch (e) {
            console.error("Evaluation Compilation Error:", formula, parsedFormula, e);
            return NaN;
        }
    }

    try {
        return fn(state);
    } catch (e) {
        console.error("Evaluation Execution Error:", formula, e);
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
                    if (el.value === 'custom') {
                        const customEl = document.getElementById(`input_${input.id}_custom`);
                        state[input.id] = customEl ? parseFloat(customEl.value) : 0;
                    } else {
                        const parsedVal = parseFloat(el.value);
                        state[input.id] = isNaN(parsedVal) ? el.value : parsedVal;
                    }
                } else {
                    state[input.id] = parseFloat(el.value);
                }
            }
            const dropdownEl = document.getElementById(`input_${input.id}_dropdown`);
            if (dropdownEl) {
                state[`${input.id}_dropdown`] = dropdownEl.value;
            }
            const unitEl = document.getElementById(`input_${input.id}_unit`);
            if (unitEl) {
                state[`${input.id}_unit`] = unitEl.value;
            }
        });
        if (pageData.inputOutput.fixedInputs) {
            pageData.inputOutput.fixedInputs.forEach(input => {
                state[input.id] = input.value;
            });
        }
        return state;
    }

    function updateInputBounds(state) {
        pageData.inputOutput.inputs.forEach(input => {
            if (typeof input.text === 'string' && input.text.includes('?')) {
                const labelEl = document.getElementById(`label_input_${input.id}`);
                if (labelEl) {
                    const evalText = evaluateFormula(input.text, state);
                    if (labelEl.getAttribute('data-eval-text') !== evalText) {
                        labelEl.setAttribute('data-eval-text', evalText);
                        labelEl.innerHTML = parseText(evalText);
                        if (window.MathJax && window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([labelEl]).catch(err => console.error(err));
                        }
                    }
                }
            }

            if (input.type === 'slider' || input.type === 'number' || input.type === 'slider-dropdown') {
                const minVal = typeof input.min === 'string' ? evaluateFormula(input.min, state) : input.min;
                const maxVal = typeof input.max === 'string' ? evaluateFormula(input.max, state) : input.max;
                const stepVal = typeof input.step === 'string' ? evaluateFormula(input.step, state) : input.step;

                const primaryEl = document.getElementById(`input_${input.id}`);
                const numEl = document.getElementById(`input_${input.id}_num`);

                [primaryEl, numEl].forEach(el => {
                    if (el) {
                        if (minVal !== undefined) el.min = minVal;
                        if (maxVal !== undefined) el.max = maxVal;
                        if (stepVal !== undefined) el.step = stepVal;
                    }
                });

                if (primaryEl) {
                    let currentVal = parseFloat(primaryEl.value);
                    if (!isNaN(currentVal)) {
                        let clampedVal = currentVal;
                        if (minVal !== undefined) clampedVal = Math.max(minVal, clampedVal);
                        if (maxVal !== undefined) clampedVal = Math.min(maxVal, clampedVal);
                        if (clampedVal !== currentVal) {
                            primaryEl.value = clampedVal;
                            if (numEl) numEl.value = clampedVal;
                            state[input.id] = clampedVal;
                        }
                    }
                }

                const minLabel = document.getElementById(`label_${input.id}_min`);
                if (minLabel && minVal !== undefined) minLabel.textContent = formatNumber(minVal);

                const maxLabel = document.getElementById(`label_${input.id}_max`);
                if (maxLabel && maxVal !== undefined) maxLabel.textContent = formatNumber(maxVal);
            }
        });
    }

    function calculateOutputs(state) {
        if (pageData.inputOutput.fixedInputs) {
            pageData.inputOutput.fixedInputs.forEach(fixedInput => {
                if (fixedInput.type === 'calculation' || (typeof fixedInput.value === 'string' && fixedInput.value.includes('?'))) {
                    const val = evaluateFormula(fixedInput.value, state);
                    state[fixedInput.id] = val;
                    const el = document.getElementById(`value_${fixedInput.id}`);
                    if (el) {
                        if (typeof val === 'number') {
                            el.textContent = formatNumber(val);
                        } else {
                            const parsed = parseText(String(val ?? ''));
                            if (el.getAttribute('data-eval-val') !== parsed) {
                                el.setAttribute('data-eval-val', parsed);
                                el.innerHTML = parsed;
                                if (window.MathJax && window.MathJax.typesetPromise) {
                                    window.MathJax.typesetPromise([el]).catch(err => console.error(err));
                                }
                            }
                        }
                    }
                }
                if (typeof fixedInput.text === 'string' && fixedInput.text.includes('?')) {
                    const labelEl = document.getElementById(`label_${fixedInput.id}`);
                    if (labelEl) {
                        const evalText = evaluateFormula(fixedInput.text, state);
                        if (labelEl.getAttribute('data-eval-text') !== evalText) {
                            labelEl.setAttribute('data-eval-text', evalText);
                            labelEl.innerHTML = parseText(evalText);
                            if (window.MathJax && window.MathJax.typesetPromise) {
                                window.MathJax.typesetPromise([labelEl]).catch(err => console.error(err));
                            }
                        }
                    }
                }
            });
        }

        pageData.inputOutput.outputs.forEach(output => {
            if (typeof output.text === 'string' && output.text.includes('?')) {
                const labelEl = document.getElementById(`label_${output.id}`);
                if (labelEl) {
                    const evalText = evaluateFormula(output.text, state);
                    if (labelEl.getAttribute('data-eval-text') !== evalText) {
                        labelEl.setAttribute('data-eval-text', evalText);
                        labelEl.innerHTML = parseText(evalText);
                        if (window.MathJax && window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([labelEl]).catch(err => console.error(err));
                        }
                    }
                }
            }

            let val;
            if (output.type === 'map') {
                const keyInput = pageData.inputOutput.inputs.find(i => i.id === output.key);
                if (keyInput && (keyInput.type === 'dropdown' || keyInput.type === 'slider-dropdown')) {
                    const dropdownEl = document.getElementById(`input_${output.key}_dropdown`) || document.getElementById(`input_${output.key}`);
                    const selectedValue = dropdownEl ? dropdownEl.value : state[output.key];
                    const selectedIndex = keyInput.choices ? keyInput.choices.findIndex(c => c.value === selectedValue || parseFloat(c.value) === selectedValue) : -1;
                    if (selectedIndex !== -1 && output.value[selectedIndex] !== undefined) {
                        val = output.value[selectedIndex];
                    }
                }
            } else if (output.type === 'calculation') {
                val = evaluateFormula(output.value, state);
            }

            state[output.id] = val;

            const el = document.getElementById(`value_${output.id}`);
            if (el) {
                if (typeof val === 'number') {
                    el.textContent = formatNumber(val);
                } else {
                    const parsed = parseText(String(val ?? ''));
                    if (el.getAttribute('data-eval-val') !== parsed) {
                        el.setAttribute('data-eval-val', parsed);
                        el.innerHTML = parsed;
                        if (window.MathJax && window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([el]).catch(err => console.error(err));
                        }
                    }
                }
            }
        });
    }

    // Cache DOM element references and state tracking for high-performance dotted-range updates
    const dottedRangeState = new Map();

    function updateDottedRangeStyling(state) {
        const dottedRange = pageData.inputOutput && pageData.inputOutput.dottedRange;
        if (!dottedRange) return;

        const ranges = Array.isArray(dottedRange) ? dottedRange : [dottedRange];

        ranges.forEach((range, index) => {
            const varId = range.variable;
            const currentVal = state[varId];
            if (currentVal === undefined || isNaN(currentVal)) return;

            const minVal = typeof range.min === 'string' ? evaluateFormula(range.min, state) : range.min;
            const maxVal = typeof range.max === 'string' ? evaluateFormula(range.max, state) : range.max;

            const isGrayed = (currentVal >= minVal && currentVal <= maxVal);

            // Short-circuit if grayed state hasn't changed to avoid unnecessary DOM operations
            let entry = dottedRangeState.get(index);
            if (!entry) {
                entry = {
                    lastGrayed: null,
                    wrapperEl: document.getElementById(`wrapper_input_${varId}`),
                    outputValEls: pageData.inputOutput.outputs ? pageData.inputOutput.outputs.map(o => document.getElementById(`value_${o.id}`)).filter(Boolean) : []
                };
                dottedRangeState.set(index, entry);
            }

            if (entry.lastGrayed === isGrayed) return;
            entry.lastGrayed = isGrayed;

            // Update DOM only when crossing the state boundary
            if (entry.wrapperEl) {
                entry.wrapperEl.classList.toggle('grayed-out', isGrayed);
                entry.wrapperEl.style.filter = isGrayed ? 'grayscale(1)' : '';
            }

            entry.outputValEls.forEach(valEl => {
                valEl.classList.toggle('grayed-out', isGrayed);
                valEl.style.color = isGrayed ? 'gray' : '';
            });
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
        updateInputBounds(state);
        calculateOutputs(state);
        updateDottedRangeStyling(state);

        injectPlots(state, pageData);
    }

    // Expose a global hook for D3 drag events to trigger calculations
    window.forceCompute = function (inputId) {
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

function _calculateState(baseState, xVal, plotConfig, pageData) {
    const tempState = { ...baseState };
    tempState[plotConfig.x] = xVal;

    pageData.inputOutput.outputs.forEach(output => {
        if (output.type === 'calculation') {
            tempState[output.id] = evaluateFormula(output.value, tempState);
        }
    });
    return tempState;
}

function _plot(refData, clipId = 0, name = '', dashed = false, opacity = 1, stroke = 'black', strokeWidth = 2) {
    const svg = d3.select('#plot');
    if (svg.empty()) return;

    svg.append('path').attr('class', 'curve' + (name ? `-${name}` : ''))
        .attr('clip-path', `url(#clip-${clipId})`)
        .style('stroke-dasharray', dashed ? '4 4' : null)
        .style('opacity', `${opacity}`)
        .style('stroke', stroke)
        .style('stroke-width', `${strokeWidth}px`)
        .style('fill', 'none')
        .style('stroke-linecap', 'round')
        .attr('d', d3.line().defined(d => d && !isNaN(d[1]))(refData));
}

function injectPlots(state, pageData) {
    if (!pageData.plots || pageData.plots.settings.length === 0 || typeof d3 === 'undefined') return;

    const svg = d3.select('#plot');
    if (svg.empty()) return;
    svg.selectAll('*').remove(); // Clear previous plot

    let W = 760, H = 320, m = { l: 100, r: 40, t: 14, b: 60 };
    if (pageData.plots.aspectRatio !== undefined) {
        H = W / pageData.plots.aspectRatio;
        const svgEl = document.getElementById('plot');
        if (svgEl) {
            svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
            // console.log(svgEl.viewBox);
        }
    }
    const gap = 80;
    const numPlots = pageData.plots.settings.length;
    const totalGap = gap * (numPlots - 1);
    const iw = (W - m.l - m.r - totalGap) / numPlots;
    const ih = H - m.t - m.b;

    // Anti-scaling for text
    const renderedWidth = svg.node() ? svg.node().getBoundingClientRect().width : W;
    const scale = (renderedWidth > 0) ? W / renderedWidth : 1;

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

        const xMinVal = typeof plotConfig.xMin === 'string' ? evaluateFormula(plotConfig.xMin, state) : plotConfig.xMin;
        const xMaxVal = typeof plotConfig.xMax === 'string' ? evaluateFormula(plotConfig.xMax, state) : plotConfig.xMax;

        let xTickIntervalVal = plotConfig.xTickInterval;
        if (typeof xTickIntervalVal === 'string') {
            xTickIntervalVal = evaluateFormula(xTickIntervalVal, state);
        } else if (Array.isArray(xTickIntervalVal)) {
            xTickIntervalVal = xTickIntervalVal[0];
        }

        const x = d3.scaleLinear().domain([xMinVal, xMaxVal]).range([plot_x_offset, plot_x_offset + iw]);
        const y = d3.scaleLinear().domain([plotConfig.yMin, yMax]).range([m.t + ih, m.t]);

        // Axes
        const xAxis = d3.axisBottom(x).ticks(5);
        if (xTickIntervalVal !== undefined) {
            const ticks = d3.range(xMinVal, xMaxVal + xTickIntervalVal / 2, xTickIntervalVal);
            xAxis.tickValues(ticks);
            xAxis.tickFormat(d => parseFloat(d.toFixed(4)).toString());
        }
        const xAxisG = svg.append('g').attr('class', 'axis')
            .attr('transform', `translate(0,${m.t + ih})`)
        xAxisG.call(xAxis);

        const xTextRotation = plotConfig.xTickRotation || 0;
        xAxisG.selectAll('text')
            .style('font-size', `${1 * scale}rem`)
            .attr('transform', `rotate(${-xTextRotation})`)
            .style('text-anchor', xTextRotation > 0 ? 'end' : 'middle');

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
        const yAxisG = svg.append('g').attr('class', 'axis')
            .attr('transform', `translate(${plot_x_offset},0)`);
        yAxisG.call(yAxis);

        const yTextRotation = plotConfig.yTickRotation || 0;

        yAxisG.selectAll('text')
            .style('font-size', `${1 * scale}rem`)
            .attr('transform', `rotate(${-yTextRotation})`)

        // Labels
        // Use foreignObject for x-axis to allow HTML (MathJax) rendering
        const xAxisBBox = xAxisG.node().getBBox(); // BBox of the axis ticks/numbers

        // In local coordinates of xAxisG, the axis line is at y = 0.
        // The bottom of the x-axis (line + ticks + tick labels) in global SVG coordinates is:
        const axisBottomY = (m.t + ih) + xAxisBBox.y + xAxisBBox.height;

        // Define margin and height in SVG coordinates, scaled to keep physical size constant
        const margin = 2 * scale;
        const labelHeight = 30 * scale;

        const xLabelFO = svg.append('foreignObject')
            .attr('x', plot_x_offset).attr('y', axisBottomY + margin)
            .attr('width', iw).attr('height', labelHeight);
        const xLabelDiv = xLabelFO.append('xhtml:div')
            .style('display', 'flex').style('justify-content', 'center').style('align-items', 'center').style('height', '100%').style('font-size', `${1.125 * scale}rem`);
        const xText = typeof plotConfig.xLabel === 'string' && plotConfig.xLabel.includes('?') ? evaluateFormula(plotConfig.xLabel, state) : plotConfig.xLabel;
        if (mathjaxCache.has(xText)) {
            xLabelDiv.html(mathjaxCache.get(xText));
        } else {
            xLabelDiv.html(parseText(xText))
                .classed('needs-typeset', true)
                .attr('data-raw-text', xText);
        }

        const yAxisBBox = yAxisG.node().getBBox(); // BBox of the axis ticks/numbers

        // Use foreignObject for y-axis to allow HTML (MathJax) rendering
        const yLabelFO = svg.append('foreignObject')
            .attr('width', ih) // The width of the object is the height of the plot area
            .attr('height', 50) // The height of the object is the space for the label
            // 1. Translate to final position, then 2. Rotate around the top-left corner of the object
            .attr('transform', `translate(${plot_x_offset - yAxisBBox.width - 40}, ${m.t + ih}) rotate(-90)`);

        // The inner div uses flexbox to perfectly center the content.
        const yLabelDiv = yLabelFO.append('xhtml:div')
            .style('display', 'flex').style('justify-content', 'center').style('align-items', 'center')
            .style('width', '100%').style('height', '100%').style('font-size', `${1.125 * scale}rem`);
        const yText = typeof plotConfig.yLabel === 'string' && plotConfig.yLabel.includes('?') ? evaluateFormula(plotConfig.yLabel, state) : plotConfig.yLabel;
        if (mathjaxCache.has(yText)) {
            yLabelDiv.html(mathjaxCache.get(yText));
        } else {
            yLabelDiv.html(parseText(yText))
                .classed('needs-typeset', true)
                .attr('data-raw-text', yText);
        }

        // Generate Curve
        const steps = 100;
        let xVals = d3.range(xMinVal, xMaxVal + (xMaxVal - xMinVal) / steps, (xMaxVal - xMinVal) / steps);

        const inputDef = pageData.inputOutput.inputs.find(inp => inp.id === plotConfig.x);

        const inpMinVal = (inputDef && typeof inputDef.min === 'string') ? evaluateFormula(inputDef.min, state) : (inputDef ? inputDef.min : undefined);
        const inpMaxVal = (inputDef && typeof inputDef.max === 'string') ? evaluateFormula(inputDef.max, state) : (inputDef ? inputDef.max : undefined);

        const accMin = (inpMinVal !== undefined) ? inpMinVal : xMinVal;
        const accMax = (inpMaxVal !== undefined) ? inpMaxVal : xMaxVal;

        // Ensure input min and max are exact points in our xVals array if within bounds
        if (inputDef) {
            if (inpMinVal !== undefined && inpMinVal > xMinVal && inpMinVal < xMaxVal) {
                xVals.push(inpMinVal);
            }
            if (inpMaxVal !== undefined && inpMaxVal > xMinVal && inpMaxVal < xMaxVal) {
                xVals.push(inpMaxVal);
            }
        }

        xVals.sort((a, b) => a - b);
        // Remove duplicates
        xVals = xVals.filter((v, idx) => xVals.indexOf(v) === idx);

        const getPoint = (xVal, baseState) => {
            const fullState = _calculateState(baseState, xVal, plotConfig, pageData);
            return [x(xVal), y(fullState[plotConfig.y])];
        };

        const dottedMin = plotConfig.dottedMin;
        const dottedMax = plotConfig.dottedMax;

        const accessibleVals = xVals.filter(v => v >= accMin && v <= accMax);

        let solidData = [];
        let dottedData = [];

        if (dottedMin !== undefined && dottedMax !== undefined) {
            const solidVals = [];
            const dottedVals = [];
            accessibleVals.forEach(v => {
                if (v >= dottedMin && v <= dottedMax) {
                    dottedVals.push(v);
                } else {
                    solidVals.push(v);
                }
            });
            solidData = solidVals.map(v => getPoint(v, state));
            dottedData = dottedVals.map(v => getPoint(v, state));
        } else {
            solidData = accessibleVals.map(v => getPoint(v, state));
        }

        // Add clip path for the plot
        const clipId = `clip-${i}`;
        svg.append('clipPath').attr('id', clipId)
            .append('rect').attr('x', plot_x_offset).attr('y', m.t)
            .attr('width', iw).attr('height', ih);

        // Draw solid and dotted parts of the curve
        if (solidData.length > 0) {
            _plot(solidData, i, 'solid', false, 1, '#0075ff', 3 * scale);
        }
        if (dottedData.length > 0) {
            _plot(dottedData, i, 'dotted', true, 0.7, 'gray', 2 * scale);
        }

        // Draw reference lines
        const refSettings = plotConfig.reference; // || plotConfig['reference-settings'] || (pageData.plots && pageData.plots['reference-settings']);
        if (refSettings) {
            const labelsToDraw = [];

            refSettings.forEach(refSetting => {
                const refState = { ...state, ...refSetting };
                const refData = accessibleVals.map(v => getPoint(v, refState));

                svg.append('path').attr('class', 'curve-reference')
                    .attr('clip-path', `url(#${clipId})`)
                    .style('stroke-dasharray', '4 4')
                    .style('opacity', '0.6')
                    .style('stroke', 'gray')
                    .style('fill', 'none')
                    .attr('d', d3.line().defined(d => d && !isNaN(d[1]))(refData));

                const isMatched = Object.keys(refSetting).every(key => {
                    if (key === 'text') return true;
                    const refVal = refSetting[key];
                    const stateVal = state[key];
                    if (typeof refVal === 'number' && typeof stateVal === 'number') {
                        return Math.abs(refVal - stateVal) < 1e-4;
                    }
                    return refVal === stateVal;
                });

                if (!isMatched && refSetting.text) {
                    let lastPoint = null;
                    for (let i = refData.length - 1; i >= 0; i--) {
                        if (refData[i] && !isNaN(refData[i][1])) {
                            lastPoint = refData[i];
                            break;
                        }
                    }

                    if (lastPoint) {
                        labelsToDraw.push({
                            refSetting,
                            lastPoint,
                            y: lastPoint[1]
                        });
                    }
                }
            });

            // Resolve vertical overlaps for reference labels
            if (labelsToDraw.length > 0) {
                // Sort by y position ascending
                labelsToDraw.sort((a, b) => a.y - b.y);

                const minDist = 14 * scale;
                let iterations = 10;
                while (iterations-- > 0) {
                    let changed = false;
                    for (let j = 0; j < labelsToDraw.length - 1; j++) {
                        const a = labelsToDraw[j];
                        const b = labelsToDraw[j + 1];
                        const overlap = minDist - (b.y - a.y);
                        if (overlap > 0) {
                            a.y -= overlap / 2;
                            b.y += overlap / 2;
                            changed = true;
                        }
                    }
                    labelsToDraw.forEach(l => {
                        l.y = Math.max(m.t + 10, Math.min(m.t + ih + 10, l.y));
                    });
                    if (!changed) break;
                }

                // Render the labels at their adjusted positions
                labelsToDraw.forEach(l => {
                    const fo = svg.append('foreignObject')
                        .attr('x', l.lastPoint[0] + 5)
                        .attr('y', l.y - 14 * scale) // Vertically center based on font size
                        .attr('width', 200 * scale) // Generous width
                        .attr('height', 30 * scale)
                        .style('overflow', 'visible');

                    const refDiv = fo.append('xhtml:div')
                        .style('font-size', `${.875 * scale}rem`)
                        .style('color', 'gray');
                    const refText = l.refSetting.text;
                    if (mathjaxCache.has(refText)) {
                        refDiv.html(mathjaxCache.get(refText));
                    } else {
                        refDiv.html(parseText(refText))
                            .classed('needs-typeset', true)
                            .attr('data-raw-text', refText);
                    }
                });
            }
        }

        // Active curve label (rendered independently at exact curve tip)
        if (plotConfig.activeLabel) {
            let activeText = plotConfig.activeLabel;
            activeText = activeText.replace(/\{([^}]+)\}/g, (_, key) => {
                const val = state[key];
                if (typeof val === 'number') {
                    return Number.isInteger(val) ? val.toFixed(1) : parseFloat(val.toFixed(4)).toString();
                }
                return val !== undefined ? val : '';
            });

            let lastPoint = null;
            const activeData = solidData.length > 0 ? solidData : dottedData;
            for (let i = activeData.length - 1; i >= 0; i--) {
                if (activeData[i] && !isNaN(activeData[i][1])) {
                    lastPoint = activeData[i];
                    break;
                }
            }

            if (lastPoint) {
                const fo = svg.append('foreignObject')
                    .attr('x', lastPoint[0] + 5)
                    .attr('y', lastPoint[1] - 14 * scale)
                    .attr('width', 200 * scale)
                    .attr('height', 30 * scale)
                    .style('overflow', 'visible');

                const activeDiv = fo.append('xhtml:div')
                    .style('font-size', `${.875 * scale}rem`)
                    .style('font-weight', 'bold')
                    .style('color', '#0075ff');

                if (mathjaxCache.has(activeText)) {
                    activeDiv.html(mathjaxCache.get(activeText));
                } else {
                    activeDiv.html(parseText(activeText))
                        .classed('needs-typeset', true)
                        .attr('data-raw-text', activeText);
                }
            }
        }

        // Draw Draggable Point at current vals
        const currentXVal = state[plotConfig.x];
        const ptGrayed = dottedMin < currentXVal && currentXVal < dottedMax;
        const dragpt = svg.append('circle').attr('class', 'dragpt')
            .attr('r', 6 * scale)
            .attr('cx', x(currentXVal))
            .attr('cy', y(currentYVal))
            .style('fill', ptGrayed ? 'gray' : '#0075ff')
            .style('stroke', 'none');

        // Interaction Background
        const hit = svg.append('rect').attr('class', 'hit')
            .attr('x', plot_x_offset).attr('y', m.t)
            .attr('width', iw).attr('height', ih);

        const drag = d3.drag()
            .on('start drag', (event) => {
                const elPrimary = document.getElementById(`input_${plotConfig.x}`);
                const elNum = document.getElementById(`input_${plotConfig.x}_num`);
                const customEl = document.getElementById(`input_${plotConfig.x}_custom`);
                const elDropdown = document.getElementById(`input_${plotConfig.x}_dropdown`);

                let xMinValDrag = typeof plotConfig.xMin === 'string' ? evaluateFormula(plotConfig.xMin, state) : plotConfig.xMin;
                let xMaxValDrag = typeof plotConfig.xMax === 'string' ? evaluateFormula(plotConfig.xMax, state) : plotConfig.xMax;
                let newX = Math.max(xMinValDrag, Math.min(xMaxValDrag, x.invert(event.x)));

                const inputDef = pageData.inputOutput.inputs.find(inp => inp.id === plotConfig.x);
                let dropdownChoiceVal = null;

                if (inputDef && (inputDef.type === 'dropdown' || inputDef.type === 'slider-dropdown')) {
                    const hasCustom = inputDef.choices && inputDef.choices.some(c => c.value === 'custom');
                    const matchingChoice = inputDef.choices ? inputDef.choices.find(c => c.value !== 'custom' && Math.abs(parseFloat(c.value) - newX) < 1e-5) : null;

                    if (matchingChoice) {
                        newX = parseFloat(matchingChoice.value);
                        dropdownChoiceVal = matchingChoice.value;
                    } else if (hasCustom) {
                        dropdownChoiceVal = 'custom';
                        let clampedX = newX;
                        if (inputDef.min !== undefined) clampedX = Math.max(inputDef.min, clampedX);
                        if (inputDef.max !== undefined) clampedX = Math.min(inputDef.max, clampedX);
                        newX = clampedX;
                    } else if (inputDef.choices) {
                        let closestChoice = inputDef.choices[0];
                        let minDiff = Infinity;
                        inputDef.choices.forEach(choice => {
                            const val = parseFloat(choice.value);
                            if (!isNaN(val)) {
                                const diff = Math.abs(val - newX);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    closestChoice = choice;
                                }
                            }
                        });
                        newX = parseFloat(closestChoice.value);
                        dropdownChoiceVal = closestChoice.value;
                    }
                } else {
                    const inpStepVal = (inputDef && typeof inputDef.step === 'string') ? evaluateFormula(inputDef.step, state) : (inputDef ? inputDef.step : undefined);
                    if (inputDef && inpStepVal) {
                        newX = Math.round(newX / inpStepVal) * inpStepVal;

                        // Round to same amount of decimals as step
                        const stepStr = inpStepVal.toString();
                        const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
                        newX = parseFloat(newX.toFixed(decimalPlaces));
                    }
                }

                // Clamp between absolute min/max bounds (from plot config and input config)
                let absoluteMin = xMinValDrag;
                let absoluteMax = xMaxValDrag;

                if (inputDef) {
                    const inpMinVal = typeof inputDef.min === 'string' ? evaluateFormula(inputDef.min, state) : inputDef.min;
                    const inpMaxVal = typeof inputDef.max === 'string' ? evaluateFormula(inputDef.max, state) : inputDef.max;
                    if (inpMinVal !== undefined) absoluteMin = Math.max(absoluteMin, inpMinVal);
                    if (inpMaxVal !== undefined) absoluteMax = Math.min(absoluteMax, inpMaxVal);
                }

                newX = Math.max(absoluteMin, Math.min(absoluteMax, newX));

                // Sync Input DOM Elements
                if (elNum) elNum.value = newX;
                if (customEl && dropdownChoiceVal === 'custom') {
                    customEl.classList.remove('hidden');
                    customEl.value = newX;
                } else if (customEl) {
                    customEl.classList.add('hidden');
                }

                if (elDropdown && dropdownChoiceVal !== null) {
                    elDropdown.value = dropdownChoiceVal;
                }

                if (elPrimary) {
                    if (inputDef && inputDef.type === 'dropdown') {
                        if (dropdownChoiceVal !== null) {
                            elPrimary.value = dropdownChoiceVal;
                        } else {
                            elPrimary.value = newX;
                        }
                    } else {
                        elPrimary.value = newX;
                    }
                }

                // Recompute
                if (window.forceCompute) {
                    window.forceCompute(plotConfig.x);
                }
            });

        hit.call(drag);
    });

    const plotNote = document.getElementById("plot-note");
    const noteText = pageData.plots.text;
    if (mathjaxCache.has(noteText)) {
        plotNote.innerHTML = mathjaxCache.get(noteText);
    } else {
        plotNote.innerHTML = parseText(noteText);
        plotNote.classList.add('needs-typeset');
        plotNote.setAttribute('data-raw-text', noteText);
    }

    // Re-typeset the plot with MathJax ONLY for elements that need it
    const toTypeset = [];
    svg.selectAll('.needs-typeset').each(function () {
        toTypeset.push(this);
    });
    if (plotNote.classList.contains('needs-typeset')) {
        toTypeset.push(plotNote);
    }

    if (toTypeset.length > 0 && window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise(toTypeset)
            .then(() => {
                toTypeset.forEach(el => {
                    const rawText = el.getAttribute('data-raw-text');
                    if (rawText) {
                        mathjaxCache.set(rawText, el.innerHTML);
                    }
                    el.classList.remove('needs-typeset');
                });
            })
            .catch(err => console.error("MathJax typesetting error on plot:", err));
    }
}

function renderInputOutput(inputOutput) {
    renderGroup(inputOutput.fixedInputs, 'fixed-inputs', inputOutput.inputColumns);
    renderControls(inputOutput.inputs);
    renderGroup(inputOutput.outputs, 'outputs', inputOutput.outputColumns);

    if (inputOutput.note) {
        const noteText = typeof inputOutput.note === 'string' ? inputOutput.note : inputOutput.note.text;
        if (noteText) {
            const controlsEl = document.getElementById('controls');
            const cardEl = controlsEl ? controlsEl.closest('.card') : null;
            if (cardEl) {
                let noteEl = document.getElementById('input-output-note');
                if (!noteEl) {
                    noteEl = document.createElement('div');
                    noteEl.id = 'input-output-note';
                    noteEl.className = 'note';
                    noteEl.style.marginTop = '12px';
                    cardEl.appendChild(noteEl);
                }
                noteEl.innerHTML = parseText(noteText);
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([noteEl]).catch(err => console.error(err));
                }
            }
        }
    }
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
            const card = document.getElementById('schematic-card-container') || document.getElementById('schematic-image-container');
            if (card) card.classList.remove('hidden');
        } else {
            const container = document.getElementById('schematic-card-container') || document.getElementById('schematic-image-container');
            if (container) {
                container.classList.add('hidden');
                if (container.parentElement) {
                    container.parentElement.classList.remove('grid'); // Remove class from equation-schematic container for layout adjustment
                }
            }
        }
        renderInputOutput(pageData.inputOutput);

        setupCalculationEngine(pageData);
    } else {
        console.error("pageData is not defined. Ensure the data script is loaded before renderer.js.");
    }
});