/**
 * renderer.js
 * Dynamically maps data from a topic file into the skeleton HTML.
 */

const mathjaxCache = new Map();
const formulaCache = new Map();
const referenceCurveCache = new Map();

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

    // 5. Handle Headers: # h1, ## h2, ### h3
    parsed = parsed
        .replace(/^###[ \t]+(.*)$/gm, '<h3>$1</h3>')
        .replace(/^##[ \t]+(.*)$/gm, '<h2>$1</h2>')
        .replace(/^#[ \t]+(.*)$/gm, '<h1>$1</h1>');

    return parsed;
}

function parseTextToElement(text, defaultTag = 'span') {
    const parsed = parseText(text);
    const headingMatch = parsed.match(/^\s*<(h[1-3])>([\s\S]*?)<\/\1>\s*$/i);
    if (headingMatch) {
        const el = document.createElement(headingMatch[1]);
        el.innerHTML = headingMatch[2];
        return el;
    }
    const el = document.createElement(defaultTag);
    el.innerHTML = parsed;
    return el;
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
    // card.className = 'dark-card';

    if (card) {
        // 1. Safe, efficient way to clear filler content without innerHTML
        card.textContent = '';

        data.forEach(item => {
            if (item.type === 'header') {
                const el = parseTextToElement(item.text, 'h3');
                card.appendChild(el);
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
                        const el = parseTextToElement(line, 'p');
                        div.appendChild(el);
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
                    let displayText = '';
                    if (sym.symbol && sym.definition) {
                        displayText = `${sym.symbol} — ${sym.definition}`;
                    } else {
                        displayText = sym.text || '';
                    }
                    li.insertAdjacentHTML('beforeend', parseText(displayText));
                    ul.appendChild(li);
                });

                div.appendChild(ul);
                card.appendChild(div);
            } else if (item.type === 'assumptions') {
                const div = document.createElement('div');
                div.className = 'note';
                // if (item.content && item.content.length === 1) {
                //     const pHeader = parseTextToElement("### Assumptions")
                //     div.appendChild(pHeader);

                //     const pText = document.createElement('p');
                //     pText.insertAdjacentHTML('beforeend', parseText(item.content[0]));
                //     div.appendChild(pText);
                // } else if (item.content) {
                if (item.content) {
                    const pHeader = parseTextToElement("### Assumptions")
                    div.appendChild(pHeader);

                    const ul = document.createElement('ul');
                    item.content.forEach(text => {
                        const li = document.createElement('li');
                        li.insertAdjacentHTML('beforeend', parseText(text));
                        ul.appendChild(li);
                    });
                    div.appendChild(ul);
                }
                card.appendChild(div);
            } else if (item.type === 'equations') {
                if (item.content && item.content.length > 0) {
                    const headerText = '### Equations';
                    const divHeader = parseTextToElement(headerText);
                    card.appendChild(divHeader);

                    item.content.forEach(eqText => {
                        if (eqText.startsWith("'") && eqText.endsWith("'")) {
                            const cleanText = eqText.slice(1, -1);
                            const div = document.createElement('div');
                            div.className = 'note';
                            div.insertAdjacentHTML('beforeend', parseText(cleanText));
                            card.appendChild(div);
                        } else {
                            const div = document.createElement('div');
                            div.className = 'eqbig';
                            div.textContent = `\\( \\displaystyle ${eqText} \\)`;
                            card.appendChild(div);
                        }
                    });
                }
            } else if (item.type === 'symbols') {
                const div = document.createElement('div');
                div.className = 'note';

                const pHeader = parseTextToElement("### Symbols")
                div.appendChild(pHeader);

                const ul = document.createElement('ul');
                if (item.content) {
                    item.content.forEach(sym => {
                        const li = document.createElement('li');
                        let displayText = '';
                        if (sym.symbol && sym.definition) {
                            displayText = `${sym.symbol} — ${sym.definition}`;
                        } else {
                            displayText = sym.text || '';
                        }
                        li.insertAdjacentHTML('beforeend', parseText(displayText));
                        ul.appendChild(li);
                    });
                }

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

function clampValue(val, minVal, maxVal) {
    if (minVal !== undefined && minVal !== null) {
        val = Math.max(minVal, val);
    }
    if (maxVal !== undefined && maxVal !== null) {
        val = Math.min(maxVal, val);
    }
    return val;
}

function clampInputValue(e, inputDef) {
    let val = parseFloat(e.target.value);
    if (!isNaN(val)) {
        const minAttr = e.target.getAttribute('min');
        const maxAttr = e.target.getAttribute('max');
        const minVal = minAttr !== null ? parseFloat(minAttr) : (typeof inputDef.min === 'number' ? inputDef.min : undefined);
        const maxVal = maxAttr !== null ? parseFloat(maxAttr) : (typeof inputDef.max === 'number' ? inputDef.max : undefined);

        val = clampValue(val, minVal, maxVal);

        e.target.value = inputDef.notation === 'scientific' ? formatScientific(val, inputDef) : val;
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
    num.type = input.notation === 'scientific' ? 'text' : 'number';
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
    });

    if (input.notation === 'scientific') {
        num.value = formatScientific(startVal, input);
    } else {
        num.value = startVal;
    }
    range.value = startVal;

    // 2-way data binding
    num.addEventListener('input', e => { range.value = e.target.value; });
    num.addEventListener('change', e => { clampInputValue(e, input); });

    if (input.notation === 'scientific') {
        range.addEventListener('input', e => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                num.value = formatScientific(val, input);
            }
        });
    } else {
        range.addEventListener('input', e => { num.value = e.target.value; });
    }

    const rangeAndLabelsContainer = document.createElement('div');
    rangeAndLabelsContainer.className = 'range-labels-container';
    rangeAndLabelsContainer.appendChild(range);

    const minMaxLabels = document.createElement('div');
    minMaxLabels.className = 'min-max-labels';

    if (input.min !== undefined) {
        const minLabel = document.createElement('span');
        minLabel.className = 'min-label';
        minLabel.id = `label_${input.id}_min`;
        minLabel.textContent = formatInputLabel(input.min, input);
        minMaxLabels.appendChild(minLabel);
    }

    if (input.max !== undefined) {
        const maxLabel = document.createElement('span');
        maxLabel.className = 'max-label';
        maxLabel.id = `label_${input.id}_max`;
        maxLabel.textContent = formatInputLabel(input.max, input);
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
                customInput.type = input.notation === 'scientific' ? 'text' : 'number';
                customInput.id = `input_${input.id}_custom`;
                customInput.className = 'num-sm hidden';
                if (input.min !== undefined) customInput.min = input.min;
                if (input.max !== undefined) customInput.max = input.max;
                if (input.step !== undefined) customInput.step = input.step;

                if (input.notation === 'scientific') {
                    customInput.value = formatScientific(initCustomVal, input);
                } else {
                    customInput.value = initCustomVal;
                }

                if (select.value === 'custom') {
                    customInput.classList.remove('hidden');
                }

                customInput.addEventListener('change', e => { clampInputValue(e, input); });

                select.addEventListener('change', e => {
                    if (e.target.value === 'custom') {
                        customInput.classList.remove('hidden');
                        if (!customInput.value) {
                            customInput.value = input.notation === 'scientific' ? formatScientific(initCustomVal, input) : initCustomVal;
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

            const hasCustomOption = input.choices && input.choices.some(c => c.value === 'custom');
            if (hasCustomOption && select.value !== 'custom') {
                inline.classList.add('hidden');
            }

            /*
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
            */

            select.addEventListener('change', e => {
                if (e.target.value === 'custom') {
                    if (hasCustomOption) {
                        inline.classList.remove('hidden');
                    }
                    if (!num.value) {
                        num.value = input.notation === 'scientific' ? formatScientific(initCustomVal, input) : initCustomVal;
                        range.value = initCustomVal;
                    }
                } else {
                    if (hasCustomOption) {
                        inline.classList.add('hidden');
                    }
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) {
                        num.value = input.notation === 'scientific' ? formatScientific(parsed, input) : parsed;
                        range.value = parsed;
                    }
                }
            });

            num.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                // if (!isNaN(val)) syncSelectFromNumeric(val);
            });
            num.addEventListener('change', e => {
                const val = parseFloat(e.target.value);
                // if (!isNaN(val)) syncSelectFromNumeric(val);
            });
            range.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                // if (!isNaN(val)) syncSelectFromNumeric(val);
            });

            inline.appendChild(num);
            inline.appendChild(rangeAndLabelsContainer);
            wrapper.appendChild(selectWrapper);
            wrapper.appendChild(inline);
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
            val.textContent = formatNumber(value.value, value.decimals);
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

/**
 * Finds choice index by value match.
 */
function findChoiceIndex(choices, val) {
    if (!choices || val === undefined || val === null) return -1;
    return choices.findIndex(c => {
        if (c.value === val) return true;
        const f1 = parseFloat(c.value);
        const f2 = parseFloat(val);
        return !isNaN(f1) && !isNaN(f2) && f1 === f2;
    });
}

/**
 * Resolves the selected choice index of a dropdown input by its key ID.
 */
function getDropdownSelectedIndex(key, state) {
    if (state && state._dropdownIndices && state._dropdownIndices[key] !== undefined) {
        return state._dropdownIndices[key];
    }
    return -1;
}

/**
 * Resolves a value (which may be mapped as an array) based on a dropdown key.
 */
function getMappedValue(key, value, state) {
    if (Array.isArray(value)) {
        const index = getDropdownSelectedIndex(key, state);
        if (index !== -1 && value[index] !== undefined) {
            return value[index];
        }
        return value[value.length - 1];
    }
    return value;
}

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

function formatNumber(val, decimals) {
    if (!Number.isFinite(val)) return '—';
    if (Math.abs(val) >= 10000 || (Math.abs(val) < 0.001 && val !== 0)) {
        return val.toExponential(decimals !== undefined ? decimals : 3);
    }
    return parseFloat(val.toPrecision(decimals !== undefined ? decimals + 1 : 4)).toString();
}

function formatScientific(val, input) {
    if (!Number.isFinite(val)) return '—';
    let dec = input.decimals;
    if (dec !== undefined && !isNaN(dec)) {
        return val.toExponential(dec);
    }
    let str = val.toExponential(12);
    let parts = str.split(/[eE]/);
    let significand = parts[0];
    let exponent = parts[1];
    significand = significand.replace(/0+$/, '');
    if (significand.endsWith('.')) {
        significand += '0';
    }
    return significand + 'e' + exponent;
}

function formatInputLabel(val, input) {
    if (input && input.notation === 'scientific') {
        return formatScientific(val, input);
    }
    return formatNumber(val);
}


function setupCalculationEngine(pageData) {
    const controlsContainer = document.getElementById('controls');
    if (!controlsContainer) return;

    let lastChangedInputId = null;

    function gatherInputs() {
        const state = {};
        const dropdownIndices = {};
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
                    dropdownIndices[input.id] = findChoiceIndex(input.choices, el.value);
                } else {
                    state[input.id] = parseFloat(el.value);
                }
            }
            const dropdownEl = document.getElementById(`input_${input.id}_dropdown`);
            if (dropdownEl) {
                state[`${input.id}_dropdown`] = dropdownEl.value;
                dropdownIndices[input.id] = findChoiceIndex(input.choices, dropdownEl.value);
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
        state._dropdownIndices = dropdownIndices;
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

                let currentVal = state[input.id];
                if (currentVal !== undefined && !isNaN(currentVal)) {
                    let clampedVal = clampValue(currentVal, minVal, maxVal);
                    const isOutOfRange = (minVal !== undefined && currentVal < minVal) || (maxVal !== undefined && currentVal > maxVal);

                    if (isOutOfRange || clampedVal !== currentVal) {
                        if (primaryEl) primaryEl.value = clampedVal;
                        if (numEl) {
                            numEl.value = input.notation === 'scientific' ? formatScientific(clampedVal, input) : clampedVal;
                        }
                        state[input.id] = clampedVal;
                    }
                }

                const minLabel = document.getElementById(`label_${input.id}_min`);
                if (minLabel && minVal !== undefined) minLabel.textContent = formatInputLabel(minVal, input);

                const maxLabel = document.getElementById(`label_${input.id}_max`);
                if (maxLabel && maxVal !== undefined) maxLabel.textContent = formatInputLabel(maxVal, input);
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
                            const decVal = typeof fixedInput.decimals === 'string' ? evaluateFormula(fixedInput.decimals, state) : fixedInput.decimals;
                            el.textContent = formatNumber(val, decVal);
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
                val = getMappedValue(output.key, output.value, state);
            } else if (output.type === 'calculation') {
                val = evaluateFormula(output.value, state);
            }

            state[output.id] = val;

            const el = document.getElementById(`value_${output.id}`);
            if (el) {
                const decVal = typeof output.decimals === 'string' ? evaluateFormula(output.decimals, state) : output.decimals;
                const numStr = (typeof val === 'number') ? formatNumber(val, decVal) : String(val ?? '');

                if (output.display) {
                    let template = (typeof output.display === 'string' && output.display.includes('?'))
                        ? evaluateFormula(output.display, state)
                        : output.display;

                    const formattedText = String(template)
                        .replace(/\{value\}/g, numStr)
                        .replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, id) => {
                            if (state[id] !== undefined) {
                                return typeof state[id] === 'number' ? formatNumber(state[id]) : state[id];
                            }
                            return match;
                        });
                    el.textContent = formattedText;
                } else if (typeof val === 'number') {
                    el.textContent = numStr;
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
    if (!pageData.plots || !pageData.plots.settings || pageData.plots.settings.length === 0 || typeof d3 === 'undefined') return;

    const svg = d3.select('#plot');
    if (svg.empty()) return;
    svg.selectAll('*').remove(); // Clear previous plot

    const rawSettings = pageData.plots.settings;
    let rows = [];
    if (Array.isArray(rawSettings) && rawSettings.length > 0) {
        if (Array.isArray(rawSettings[0])) {
            rows = rawSettings;
        } else {
            const cols = (pageData.plots.plotColumns && pageData.plots.plotColumns > 0)
                ? Math.min(pageData.plots.plotColumns, rawSettings.length)
                : rawSettings.length;
            for (let i = 0; i < rawSettings.length; i += cols) {
                rows.push(rawSettings.slice(i, i + cols));
            }
        }
    }
    if (rows.length === 0) return;

    const flatSettings = rows.flat().filter(p => p && typeof p === 'object');
    const maxRotation = Math.max(0, ...flatSettings.map(p => Math.abs((p && p.xTickRotation) || 0)));
    const extraBottom = maxRotation > 0 ? Math.ceil(35 * Math.sin(maxRotation * Math.PI / 180) + 15) : 0;

    let W = 760, m = { l: 80, r: 40, t: 14, b: 60 + extraBottom };
    const gapX = 80;
    const gapY = 70 + extraBottom;
    const W_avail = W - m.l - m.r;

    const parseWidthPct = (val) => {
        if (typeof val === 'number') {
            return val > 1 ? val : val * 100;
        }
        if (typeof val === 'string') {
            const cleaned = val.trim().replace('%', '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed)) return parsed;
        }
        return null;
    };

    const rowLayouts = rows.map((rowPlots, rowIndex) => {
        const N_r = rowPlots.length;
        const totalGapX = gapX * Math.max(0, N_r - 1);
        const W_net = W_avail - totalGapX;

        let specifiedSum = 0;
        let unspecifiedCount = 0;
        const pcts = rowPlots.map(p => {
            const pct = parseWidthPct(p ? p.width : null);
            if (pct !== null) {
                specifiedSum += pct;
                return pct;
            } else {
                unspecifiedCount++;
                return null;
            }
        });

        const defaultPct = unspecifiedCount > 0 ? Math.max(0, 100 - specifiedSum) / unspecifiedCount : 0;
        const finalPcts = pcts.map(pct => pct !== null ? pct : defaultPct);
        const plotWidths = finalPcts.map(pct => W_net * (pct / 100));

        const plotHeights = rowPlots.map((plotConfig, colIndex) => {
            const iw = plotWidths[colIndex];
            let ar = plotConfig ? plotConfig.aspectRatio : undefined;
            if (ar === undefined) {
                if (Array.isArray(pageData.plots.aspectRatio)) {
                    ar = pageData.plots.aspectRatio[rowIndex] !== undefined ? pageData.plots.aspectRatio[rowIndex] : 1.5;
                } else if (pageData.plots.aspectRatio !== undefined) {
                    ar = pageData.plots.aspectRatio;
                } else {
                    ar = 1.5;
                }
            }
            return iw / ar;
        });

        const rowHeight = Math.max(...plotHeights, 100);

        return {
            rowPlots,
            plotWidths,
            plotHeights,
            rowHeight
        };
    });

    let currentY = m.t;
    const rowYOffsets = rowLayouts.map((layout) => {
        const y = currentY;
        currentY += layout.rowHeight + gapY;
        return y;
    });

    let H = currentY - gapY + m.b;

    const svgEl = document.getElementById('plot');
    if (svgEl) {
        svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    }

    // Anti-scaling for text
    const renderedWidth = svg.node() ? svg.node().getBoundingClientRect().width : W;
    const scale = (renderedWidth > 0) ? W / renderedWidth : 1;

    let maxObservedBottom = 0;
    let globalPlotIndex = 0;

    rowLayouts.forEach((layout, rowIndex) => {
        let currentX = m.l;
        const plot_y_offset = rowYOffsets[rowIndex];

        layout.rowPlots.forEach((plotConfig, colIndex) => {
            const iw = layout.plotWidths[colIndex];
            const ih = layout.plotHeights[colIndex];
            const plot_x_offset = currentX;
            currentX += iw + gapX;

            const isEmptySlot = !plotConfig || Object.keys(plotConfig).length === 0 || (!plotConfig.x && !plotConfig.y);
            if (isEmptySlot) return;

            const plotIndex = globalPlotIndex++;

            let currentYVal = state[plotConfig.y];
            if (currentYVal === undefined || isNaN(currentYVal)) return;

            const dropdownIndex = getDropdownSelectedIndex(plotConfig.key, state);
            let yIndex = dropdownIndex !== -1 ? dropdownIndex : 0;

            let yMaxRaw = plotConfig.yMax;
            let yMax;
            if (Array.isArray(yMaxRaw)) {
                if (dropdownIndex !== -1) {
                    yMax = yMaxRaw[yIndex] !== undefined ? yMaxRaw[yIndex] : yMaxRaw[yMaxRaw.length - 1];
                } else {
                    // Evaluate dynamic max bounds based on current Y value
                    const matchedVal = yMaxRaw.find(maxVal => {
                        const evaluatedMax = typeof maxVal === 'string' ? evaluateFormula(maxVal, state) : maxVal;
                        return currentYVal <= evaluatedMax;
                    });
                    if (matchedVal !== undefined) {
                        yIndex = yMaxRaw.indexOf(matchedVal);
                        yMax = matchedVal;
                    } else {
                        yIndex = yMaxRaw.length - 1;
                        yMax = yMaxRaw[yIndex];
                    }
                }
            } else {
                yMax = yMaxRaw;
            }

            if (typeof yMax === 'string') {
                yMax = evaluateFormula(yMax, state);
            }

            const resolveProperty = (val) => {
                if (Array.isArray(val)) {
                    return val[yIndex] !== undefined ? val[yIndex] : val[val.length - 1];
                }
                return val;
            };

            const xMinRaw = resolveProperty(plotConfig.xMin);
            const xMinVal = typeof xMinRaw === 'string' ? evaluateFormula(xMinRaw, state) : xMinRaw;

            const xMaxRaw = resolveProperty(plotConfig.xMax);
            const xMaxVal = typeof xMaxRaw === 'string' ? evaluateFormula(xMaxRaw, state) : xMaxRaw;

            const xTickIntervalRaw = resolveProperty(plotConfig.xTickInterval);
            let xTickIntervalVal = typeof xTickIntervalRaw === 'string' ? evaluateFormula(xTickIntervalRaw, state) : xTickIntervalRaw;

            const yMinRaw = resolveProperty(plotConfig.yMin);
            const yMinVal = typeof yMinRaw === 'string' ? evaluateFormula(yMinRaw, state) : yMinRaw;

            const yTickIntervalRaw = resolveProperty(plotConfig.yTickInterval);
            let yTickIntervalVal = typeof yTickIntervalRaw === 'string' ? evaluateFormula(yTickIntervalRaw, state) : yTickIntervalRaw;

            const x = plotConfig.xLog
                ? d3.scaleLog().domain([xMinVal, xMaxVal]).range([plot_x_offset, plot_x_offset + iw])
                : d3.scaleLinear().domain([xMinVal, xMaxVal]).range([plot_x_offset, plot_x_offset + iw]);
            const y = plotConfig.yLog
                ? d3.scaleLog().domain([yMinVal, yMax]).range([plot_y_offset + ih, plot_y_offset])
                : d3.scaleLinear().domain([yMinVal, yMax]).range([plot_y_offset + ih, plot_y_offset]);

            // Axes
            const xAxis = d3.axisBottom(x).ticks(5);
            if (plotConfig.xLog) {
                xAxis.tickFormat(d => {
                    const log = Math.log10(d);
                    if (Math.abs(log - Math.round(log)) < 1e-9) {
                        if (d >= 1e6 || d <= 1e-3) {
                            return d.toExponential().replace(/\.0+e/, 'e').replace(/e\+/, 'e');
                        }
                        return d.toString();
                    }
                    return "";
                });
            } else {
                if (xTickIntervalVal !== undefined) {
                    const tickCount = (xMaxVal - xMinVal) / xTickIntervalVal;
                    if (tickCount > 200) {
                        console.warn(`xTickIntervalVal ${xTickIntervalVal} is too small for range [${xMinVal}, ${xMaxVal}]. Skipping tickValues to prevent crash.`);
                    } else {
                        const ticks = d3.range(xMinVal, xMaxVal + xTickIntervalVal / 2, xTickIntervalVal);
                        xAxis.tickValues(ticks);
                    }
                }
                if (plotConfig.xExponential) {
                    xAxis.tickFormat(d => {
                        if (d === 0) return '0';
                        return d.toExponential().replace(/e\+/, 'e');
                    });
                } else if (xTickIntervalVal !== undefined) {
                    xAxis.tickFormat(d => parseFloat(d.toFixed(4)).toString());
                }
            }
            const xAxisG = svg.append('g').attr('class', 'axis')
                .attr('transform', `translate(0,${plot_y_offset + ih})`)
            xAxisG.call(xAxis);

            const xTextRotation = plotConfig.xTickRotation || 0;
            xAxisG.selectAll('text')
                .style('font-size', `${1 * scale}rem`)
                .attr('transform', `rotate(${-xTextRotation})`)
                .style('text-anchor', xTextRotation > 0 ? 'end' : 'middle');

            const yAxis = d3.axisLeft(y).ticks(5);
            if (plotConfig.yLog) {
                yAxis.tickFormat(d => {
                    const log = Math.log10(d);
                    if (Math.abs(log - Math.round(log)) < 1e-9) {
                        if (d >= 1e6 || d <= 1e-3) {
                            return d.toExponential().replace(/\.0+e/, 'e').replace(/e\+/, 'e');
                        }
                        return d.toString();
                    }
                    return "";
                });
            } else {
                if (yTickIntervalVal !== undefined) {
                    const tickCount = (yMax - yMinVal) / yTickIntervalVal;
                    if (tickCount > 200) {
                        console.warn(`yTickIntervalVal ${yTickIntervalVal} is too small for range [${yMinVal}, ${yMax}]. Skipping tickValues to prevent crash.`);
                    } else {
                        const ticks = d3.range(yMinVal, yMax + yTickIntervalVal / 2, yTickIntervalVal);
                        yAxis.tickValues(ticks);
                    }
                }
                if (plotConfig.yExponential) {
                    yAxis.tickFormat(d => {
                        if (d === 0) return '0';
                        return d.toExponential().replace(/e\+/, 'e');
                    });
                } else if (yTickIntervalVal !== undefined) {
                    yAxis.tickFormat(d => parseFloat(d.toFixed(4)).toString());
                }
            }
            const yAxisG = svg.append('g').attr('class', 'axis')
                .attr('transform', `translate(${plot_x_offset},0)`);
            yAxisG.call(yAxis);

            const yTextRotation = plotConfig.yTickRotation || 0;

            yAxisG.selectAll('text')
                .style('font-size', `${1 * scale}rem`)
                .attr('transform', `rotate(${-yTextRotation})`)

            // Labels
            const xAxisBBox = xAxisG.node().getBBox();
            const axisBottomY = (plot_y_offset + ih) + xAxisBBox.y + xAxisBBox.height;

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

            const plotBottomY = axisBottomY + margin + labelHeight + 10 * scale;
            if (plotBottomY > maxObservedBottom) {
                maxObservedBottom = plotBottomY;
            }

            const yAxisBBox = yAxisG.node().getBBox();

            const yLabelFO = svg.append('foreignObject')
                .attr('width', ih)
                .attr('height', 50)
                .attr('transform', `translate(${plot_x_offset - yAxisBBox.width - 40}, ${plot_y_offset + ih}) rotate(-90)`);

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
            let xVals;
            if (plotConfig.xLog) {
                const logMin = Math.log10(xMinVal);
                const logMax = Math.log10(xMaxVal);
                xVals = d3.range(0, steps + 1).map(d => Math.pow(10, logMin + (d * (logMax - logMin)) / steps));
            } else {
                xVals = d3.range(xMinVal, xMaxVal + (xMaxVal - xMinVal) / steps, (xMaxVal - xMinVal) / steps);
            }

            const inputDef = pageData.inputOutput.inputs.find(inp => inp.id === plotConfig.x);

            const inpMinVal = (inputDef && typeof inputDef.min === 'string') ? evaluateFormula(inputDef.min, state) : (inputDef ? inputDef.min : undefined);
            const inpMaxVal = (inputDef && typeof inputDef.max === 'string') ? evaluateFormula(inputDef.max, state) : (inputDef ? inputDef.max : undefined);

            const accMin = (inpMinVal !== undefined) ? inpMinVal : xMinVal;
            const accMax = (inpMaxVal !== undefined) ? inpMaxVal : xMaxVal;

            if (inputDef) {
                if (inpMinVal !== undefined && inpMinVal > xMinVal && inpMinVal < xMaxVal) {
                    xVals.push(inpMinVal);
                }
                if (inpMaxVal !== undefined && inpMaxVal > xMinVal && inpMaxVal < xMaxVal) {
                    xVals.push(inpMaxVal);
                }
            }

            xVals.sort((a, b) => a - b);
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
            const clipId = `clip-${plotIndex}`;
            svg.append('clipPath').attr('id', clipId)
                .append('rect').attr('x', plot_x_offset).attr('y', plot_y_offset)
                .attr('width', iw).attr('height', ih);

            // Draw solid and dotted parts of the curve
            if (solidData.length > 0) {
                _plot(solidData, plotIndex, 'solid', false, 1, '#0075ff', 2 * scale);
            }
            if (dottedData.length > 0) {
                _plot(dottedData, plotIndex, 'dotted', true, 0.7, 'gray', 2 * scale);
            }

            const plotCtx = {
                svg,
                plotConfig,
                state,
                pageData,
                x,
                y,
                m,
                iw,
                ih,
                scale,
                plot_x_offset,
                plot_y_offset,
                clipId,
                accessibleVals,
                xVals,
                getPoint
            };

            // Draw reference lines and labels
            drawReferenceLines(plotCtx);

            // Active curve label
            drawActiveLabel(solidData, dottedData, plotCtx);

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
                .attr('x', plot_x_offset).attr('y', plot_y_offset)
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

                            const stepStr = inpStepVal.toString();
                            const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
                            newX = parseFloat(newX.toFixed(decimalPlaces));
                        }
                    }

                    let absoluteMin = xMinValDrag;
                    let absoluteMax = xMaxValDrag;

                    if (inputDef) {
                        const inpMinVal = typeof inputDef.min === 'string' ? evaluateFormula(inputDef.min, state) : inputDef.min;
                        const inpMaxVal = typeof inputDef.max === 'string' ? evaluateFormula(inputDef.max, state) : inputDef.max;
                        if (inpMinVal !== undefined) absoluteMin = Math.max(absoluteMin, inpMinVal);
                        if (inpMaxVal !== undefined) absoluteMax = Math.min(absoluteMax, inpMaxVal);
                    }

                    newX = Math.max(absoluteMin, Math.min(absoluteMax, newX));

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

                    if (window.forceCompute) {
                        window.forceCompute(plotConfig.x);
                    }
                });

            hit.call(drag);
        });
    });

    if (maxObservedBottom > H) {
        H = Math.ceil(maxObservedBottom);
        if (svgEl) {
            svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
        }
    }

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

// ---------------------------------------------------------
// Helper functions for Reference Lines and Labels Drawing
// ---------------------------------------------------------

function drawReferenceLines(plotCtx) {
    const { svg, plotConfig, state, accessibleVals, xVals, getPoint, clipId, pageData } = plotCtx;
    const refSettings = plotConfig.reference;
    if (!refSettings) return;

    const labelsToDraw = [];

    refSettings.forEach(refSetting => {
        const refState = { ...state, ...refSetting };

        // Cache the reference curve data to avoid recalculation on drag.
        // The curve only depends on page inputs that are NOT the independent variable (plotConfig.x)
        // and NOT overridden by the reference settings.
        const cacheKeyObj = {
            plotY: plotConfig.y,
            refText: refSetting.text,
            inputs: {}
        };
        pageData.inputOutput.inputs.forEach(input => {
            if (input.id !== plotConfig.x && !(input.id in refSetting)) {
                cacheKeyObj.inputs[input.id] = state[input.id];
            }
        });
        const cacheKey = JSON.stringify(cacheKeyObj);

        let refData;
        if (referenceCurveCache.has(cacheKey)) {
            refData = referenceCurveCache.get(cacheKey);
        } else {
            const valsToUse = xVals || accessibleVals;
            refData = valsToUse.map(v => getPoint(v, refState));
            referenceCurveCache.set(cacheKey, refData);
        }

        svg.append('path').attr('class', 'curve-reference')
            .attr('clip-path', `url(#${clipId})`)
            .style('stroke-dasharray', '4 4')
            .style('opacity', '0.6')
            .style('stroke', 'gray')
            .style('fill', 'none')
            .attr('d', d3.line().defined(d => d && !isNaN(d[1]))(refData));

        const isMatched = Object.keys(refSetting).every(key => {
            if (key === 'text' || key === 'labelPosition') return true;
            const refVal = refSetting[key];
            const stateVal = state[key];
            if (typeof refVal === 'number' && typeof stateVal === 'number') {
                return Math.abs(refVal - stateVal) < 1e-4;
            }
            return refVal === stateVal;
        });

        const shouldHideRefLabel = isMatched && plotConfig.activeLabel;

        if (!shouldHideRefLabel && refSetting.text) {
            positionReferenceLabel(refSetting, refData, labelsToDraw, plotCtx);
        }
    });

    if (labelsToDraw.length > 0) {
        resolveLabelOverlaps(labelsToDraw, plotCtx);
    }
}

function positionReferenceLabel(refSetting, refData, labelsToDraw, plotCtx) {
    const { svg, m, ih, iw, scale, plot_x_offset, plot_y_offset } = plotCtx;

    if (refSetting.labelPosition === 'above' || refSetting.labelPosition === 'below') {
        // Find the last point in refData that is within the plot's Y viewport
        let lastValidPoint = null;
        let lastValidIndex = -1;
        for (let i = 0; i < refData.length; i++) {
            const pt = refData[i];
            if (pt && !isNaN(pt[0]) && !isNaN(pt[1])) {
                if (pt[1] >= plot_y_offset && pt[1] <= (plot_y_offset + ih)) {
                    lastValidPoint = pt;
                    lastValidIndex = i;
                }
            }
        }

        if (lastValidPoint) {
            const foHeight = 25 * scale;
            let foWidth = 150 * scale;
            let foX, foY, textAlign;

            // Check if the curve exited early before the right edge of the plot
            const exitedEarly = lastValidIndex < refData.length - 1;

            if (exitedEarly) {
                // Exited top or bottom of the plot area
                const nextPoint = refData[lastValidIndex + 1];
                const exitedTop = nextPoint && nextPoint[1] < plot_y_offset;

                if (exitedTop) {
                    foY = plot_y_offset + 4 * scale; // Position just below the top edge
                } else {
                    foY = plot_y_offset + ih - foHeight - 4 * scale; // Position just above the bottom edge
                }

                // Place label to the right of the exit point
                const availableWidth = (plot_x_offset + iw) - lastValidPoint[0];
                if (availableWidth >= 100 * scale) {
                    foX = lastValidPoint[0] + 5 * scale;
                    foWidth = availableWidth - 10 * scale;
                    textAlign = 'left';
                } else {
                    foX = plot_x_offset + iw - 100 * scale - 5 * scale;
                    foWidth = 100 * scale;
                    textAlign = 'right';
                }
            } else {
                // Exited through the right edge of the plot (standard inline right-aligned)
                foX = plot_x_offset + iw - foWidth - 5 * scale;
                textAlign = 'right';

                // Calculate if the dotted plot intersects anywhere along the actual width of the text.
                // Since the text is right-aligned, it occupies the rightmost portion of the label box.
                const textWidth = 80 * scale;
                const checkStartX = plot_x_offset + iw - textWidth - 5 * scale;
                const spanYVals = refData
                    .filter(pt => pt && !isNaN(pt[0]) && !isNaN(pt[1]) && pt[0] >= checkStartX)
                    .map(pt => pt[1]);

                const offset = 2 * scale;

                if (refSetting.labelPosition === 'above') {
                    const minY = spanYVals.length > 0 ? Math.min(...spanYVals) : lastValidPoint[1];
                    const approxTextHeight = 14 * scale;
                    foY = minY - approxTextHeight - offset;
                } else {
                    const maxY = spanYVals.length > 0 ? Math.max(...spanYVals) : lastValidPoint[1];
                    foY = maxY + offset;
                }
            }

            // Clamp Y within plot boundaries plus a small margin
            const minYBound = plot_y_offset + 2 * scale;
            const maxYBound = plot_y_offset + ih; // - foHeight;
            foY = Math.max(minYBound, Math.min(maxYBound, foY));

            const fo = svg.append('foreignObject')
                .attr('x', foX)
                .attr('y', foY)
                .attr('width', foWidth)
                .attr('height', foHeight)
                .style('overflow', 'visible');

            const refDiv = fo.append('xhtml:div')
                .style('font-size', `${.875 * scale}rem`)
                .style('color', 'gray')
                .style('text-align', textAlign)
                .style('width', '100%');

            const refText = refSetting.text;
            if (mathjaxCache.has(refText)) {
                refDiv.html(mathjaxCache.get(refText));
            } else {
                refDiv.html(parseText(refText))
                    .classed('needs-typeset', true)
                    .attr('data-raw-text', refText);
            }
        }
    } else {
        // Standard right-edge label (handled via overlap resolution)
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
}

function resolveLabelOverlaps(labelsToDraw, plotCtx) {
    const { svg, m, ih, scale, plot_y_offset } = plotCtx;

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
            l.y = Math.max(plot_y_offset + 10, Math.min(plot_y_offset + ih + 10, l.y));
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

function drawActiveLabel(solidData, dottedData, plotCtx) {
    const { svg, plotConfig, state, scale } = plotCtx;
    if (!plotConfig.activeLabel) return;

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
        initStickyFloatCards();
    } else {
        console.error("pageData is not defined. Ensure the data script is loaded before renderer.js.");
    }
});

// ensures float cards are always visible and hits top and bottom
function initStickyFloatCards() {
    const floatCards = document.querySelectorAll('.card.float');
    if (!floatCards.length) return;

    let ticking = false;
    let cachedRem = 16;
    let cachedMaxScroll = 0;
    let cachedViewportHeight = 0;
    let hasActiveDynamicCards = false;
    const cardConfigs = new Map();

    function updateMetrics() {
        if (window.innerWidth < 1024) {
            hasActiveDynamicCards = false;
            floatCards.forEach(card => {
                card.style.top = '';
            });
            return;
        }

        cachedViewportHeight = window.innerHeight;
        cachedMaxScroll = document.documentElement.scrollHeight - cachedViewportHeight;
        cachedRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        hasActiveDynamicCards = false;

        floatCards.forEach(card => {
            if (card.classList.contains('hidden')) {
                cardConfigs.set(card, { needsDynamic: false });
                return;
            }

            const cardHeight = card.offsetHeight;
            // Schematic cards nested beside equation boxes use default CSS sticky.
            // Floating sidebar cards (like the Inputs/Outputs card beside plots) dynamically
            // glide down so they reach the bottom of the viewport when scrolled to the bottom.
            const isSchematic = card.id === 'schematic-card-container' || card.closest('#eqschem-container');
            const isScrollable = cachedMaxScroll > 0;
            const needsDynamic = !isSchematic && isScrollable;

            cardConfigs.set(card, {
                needsDynamic,
                cardHeight,
                topMargin: cachedRem,
                bottomTarget: cachedViewportHeight - cardHeight - cachedRem
            });

            if (needsDynamic) {
                hasActiveDynamicCards = true;
            } else {
                card.style.top = ''; // Fall back to default CSS position: sticky
            }
        });
    }

    function render() {
        if (!hasActiveDynamicCards) {
            ticking = false;
            return;
        }

        const scrollY = window.scrollY;
        const progress = cachedMaxScroll > 0 ? Math.min(Math.max(scrollY / cachedMaxScroll, 0), 1) : 0;

        floatCards.forEach(card => {
            const config = cardConfigs.get(card);
            if (!config || !config.needsDynamic) return;

            const currentTop = config.topMargin + progress * (config.bottomTarget - config.topMargin);
            card.style.top = `${currentTop}px`;
        });

        ticking = false;
    }

    function onScroll() {
        if (!hasActiveDynamicCards) return;
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(render);
        }
    }

    function onResize() {
        updateMetrics();
        onScroll();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
            updateMetrics();
            onScroll();
        });
        ro.observe(document.body);
    }

    updateMetrics();
    onScroll();

    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(() => {
            updateMetrics();
            onScroll();
        }).catch(() => { });
    }
}