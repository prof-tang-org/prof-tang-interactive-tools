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
        } else if (value.value === undefined || value.type === 'calculation' || value.type === 'python' || (typeof value.value === 'string' && (value.value.includes('(') || value.value.includes('*') || value.value.includes('+') || value.value.includes('/') || value.value.includes('?')))) {
            val.textContent = '—';
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

/**
 * Global CoolProp API exposure for inputOutput calculations.
 * Supports PropsSI() calling convention.
 * Example in pageData: PropsSI('D', 'T', temp + 273.15, 'P', pressure * 1e5, fluid)
 */
let _coolPropInstance = window.CoolProp || window.coolprop || window.CoolPropModule || null;

try {
    Object.defineProperty(window, 'CoolProp', {
        get() {
            return _coolPropInstance;
        },
        set(val) {
            _coolPropInstance = val;
            if (val && typeof window.forceCompute === 'function') {
                window.forceCompute();
            }
        },
        configurable: true,
        enumerable: true
    });
} catch (e) {
    // If window.CoolProp cannot be redefined, fallback to global variable
}

let coolpropInitPromise = null;

async function initCoolProp() {
    if (_coolPropInstance) {
        return _coolPropInstance;
    }
    if (!coolpropInitPromise) {
        coolpropInitPromise = (async () => {
            try {
                const isTemplate = window.location.pathname.includes('/templates/');
                const path = isTemplate ? '../assets/js/coolprop.js' : './assets/js/coolprop.js';
                const mod = await import(path);
                const ModuleFunc = mod.default || mod;
                if (typeof ModuleFunc === 'function') {
                    const instance = await ModuleFunc();
                    if (instance && (instance.PropsSI)) {
                        window.CoolProp = instance;
                        if (typeof window.forceCompute === 'function') {
                            window.forceCompute();
                        }
                        return instance;
                    }
                }
            } catch (e) {
                // Silently ignore if coolprop.js is not present on non-CoolProp pages
            }
            return null;
        })();
    }
    return coolpropInitPromise;
}

window.PropsSI = window.PropsSI = function PropsSI(out, in1, val1, in2, val2, fluid) {
    const cp = window.CoolProp || window.coolprop || window.CoolPropModule;
    if (cp) {
        if (typeof cp.PropsSI === 'function') return cp.PropsSI(out, in1, val1, in2, val2, fluid);
    }
    if (window.Module) {
        if (typeof window.Module.PropsSI === 'function') return window.Module.PropsSI(out, in1, val1, in2, val2, fluid);
        if (typeof window.Module.ccall === 'function') {
            try {
                return window.Module.ccall('PropsSI', 'number', ['string', 'string', 'number', 'string', 'number', 'string'], [out, in1, val1, in2, val2, fluid]);
            } catch (e) {
                console.error("[renderer.js] CoolProp ccall error:", e);
            }
        }
    }
    if (typeof PropsSI === 'function' && PropsSI !== window.PropsSI) {
        return PropsSI(out, in1, val1, in2, val2, fluid);
    }
    console.warn("[renderer.js] CoolProp (PropsSI) is not loaded or ready.");
    return NaN;
};

window.HAPropsSI = function HAPropsSI(out, in1, val1, in2, val2, in3, val3) {
    const cp = window.CoolProp || window.coolprop || window.CoolPropModule;
    if (cp) {
        if (typeof cp.HAPropsSI === 'function') return cp.HAPropsSI(out, in1, val1, in2, val2, in3, val3);
    }
    if (window.Module) {
        if (typeof window.Module.HAPropsSI === 'function') return window.Module.HAPropsSI(out, in1, val1, in2, val2, in3, val3);
        if (typeof window.Module.ccall === 'function') {
            try {
                return window.Module.ccall('HAPropsSI', 'number', ['string', 'string', 'number', 'string', 'number', 'string', 'number'], [out, in1, val1, in2, val2, in3, val3]);
            } catch (e) {
                console.error("[renderer.js] CoolProp HAPropsSI ccall error:", e);
            }
        }
    }
    if (typeof HAPropsSI === 'function' && HAPropsSI !== window.HAPropsSI) {
        return HAPropsSI(out, in1, val1, in2, val2, in3, val3);
    }
    console.warn("[renderer.js] CoolProp (HAPropsSI) is not loaded or ready.");
    return NaN;
};

function getAllStateKeys(state) {
    const keysSet = new Set(Object.keys(state || {}));
    if (typeof pageData !== 'undefined' && pageData.inputOutput) {
        if (Array.isArray(pageData.inputOutput.inputs)) {
            pageData.inputOutput.inputs.forEach(i => { if (i && i.id) keysSet.add(i.id); });
        }
        if (Array.isArray(pageData.inputOutput.fixedInputs)) {
            pageData.inputOutput.fixedInputs.forEach(i => { if (i && i.id) keysSet.add(i.id); });
        }
        if (Array.isArray(pageData.inputOutput.outputs)) {
            pageData.inputOutput.outputs.forEach(o => { if (o && o.id) keysSet.add(o.id); });
        }
    }
    return Array.from(keysSet).sort((a, b) => b.length - a.length);
}

function evaluateFormula(formula, state, customScope = null) {
    if (typeof formula !== 'string') return formula;

    const cacheKey = formula + (customScope && typeof customScope === 'object' ? '::' + Object.keys(customScope).join(',') : '');
    let fn = formulaCache.get(cacheKey);
    if (!fn) {
        let parsedFormula = formula;

        // 1. Mask string literals ('...' and "...") to prevent string parameters from being corrupted by state key replacements
        const literals = [];
        parsedFormula = parsedFormula.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, (match) => {
            literals.push(match);
            return `___STR_LIT_${literals.length - 1}___`;
        });

        // 2. Replace state variable keys with state["key"] using ALL known pageData keys
        const keys = getAllStateKeys(state);
        keys.forEach(k => {
            const escapedKey = k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`(?<![a-zA-Z0-9_])(?<![a-zA-Z0-9_]-)(${escapedKey})(?![a-zA-Z0-9_])(?!-[a-zA-Z0-9_])`, 'g');
            parsedFormula = parsedFormula.replace(regex, `state["${k}"]`);
        });

        // 3. Replace custom scoped helper function calls (e.g. sf(...), sg(...)) with scope["func"](...)
        if (customScope && typeof customScope === 'object') {
            Object.keys(customScope).forEach(funcName => {
                const regex = new RegExp(`(?<![a-zA-Z0-9_])(${funcName})\\s*\\(`, 'g');
                parsedFormula = parsedFormula.replace(regex, `scope["${funcName}"](`);
            });
        }

        // 4. Replace standard math functions with Math.xxx
        const mathFuncs = Object.getOwnPropertyNames(Math);
        mathFuncs.forEach(func => {
            const regex = new RegExp(`(^|[^a-zA-Z0-9_.])(${func})\\b`, 'g');
            parsedFormula = parsedFormula.replace(regex, `$1Math.$2`);
        });

        // 5. Restore original string literals
        literals.forEach((lit, index) => {
            parsedFormula = parsedFormula.replace(`___STR_LIT_${index}___`, () => lit);
        });

        try {
            fn = new Function('state', 'scope', `return ${parsedFormula};`);
            formulaCache.set(cacheKey, fn);
        } catch (e) {
            console.error("Evaluation Compilation Error:", formula, parsedFormula, e);
            return NaN;
        }
    }

    try {
        return fn(state, customScope || {});
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

        // Execute Python calculation engine if configured on inputOutput
        let pyOutputs = null;
        if (pageData.inputOutput && pageData.inputOutput.pythonScript) {
            pyOutputs = runPythonCalculation(state);
            if (pyOutputs && typeof pyOutputs === 'object') {
                Object.assign(state, pyOutputs);
            }
        }

        if (Array.isArray(pageData.inputOutput.outputs)) {
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
                if (pyOutputs && output.id in pyOutputs) {
                    val = pyOutputs[output.id];
                } else if (output.type === 'map') {
                    val = getMappedValue(output.key, output.value, state);
                } else if (output.type === 'calculation' || (typeof output.value === 'string' && output.value.length > 0)) {
                    val = evaluateFormula(output.value, state);
                } else if (state[output.id] !== undefined) {
                    val = state[output.id];
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

    const swaps = pageData.inputOutput._swaps || [];
    let lastState = null;

    // When a swap selector changes, start the newly selected slider at the value it had as an output
    function carryOverSwapValue(targetId) {
        if (!lastState) return;
        const swap = swaps.find(s => `input_${s.id}` === targetId);
        if (!swap) return;

        const activeId = document.getElementById(targetId).value;
        const val = lastState[activeId];
        const range = document.getElementById(`input_${activeId}`);
        const num = document.getElementById(`input_${activeId}_num`);
        if (!range || typeof val !== 'number' || !Number.isFinite(val)) return;

        range.value = val; // range inputs clamp and snap to their own min/max/step
        if (num) {
            const inputDef = pageData.inputOutput.inputs.find(i => i.id === activeId);
            const snapped = parseFloat(range.value);
            num.value = inputDef && inputDef.notation === 'scientific' ? formatScientific(snapped, inputDef) : snapped;
        }
    }

    // Show only the selected option's slider, and only the unselected options' outputs
    function updateSwapVisibility(state) {
        swaps.forEach(swap => {
            const activeId = state[swap.id];
            swap.optionIds.forEach(id => {
                const isActive = id === activeId;
                const wrapper = document.getElementById(`wrapper_input_${id}`);
                if (wrapper) wrapper.classList.toggle('hidden', !isActive);
                const valueEl = document.getElementById(`value_${id}`);
                if (valueEl && valueEl.parentElement) valueEl.parentElement.classList.toggle('hidden', isActive);
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
            carryOverSwapValue(e.target.id);
        }

        const state = gatherInputs();
        updateInputBounds(state);
        calculateOutputs(state);
        updateSwapVisibility(state);
        updateDottedRangeStyling(state);

        injectPlots(state, pageData);
        lastState = state;
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

window.plotRenderers = window.plotRenderers || {};

let _customScriptCounter = 0;
const _loadedCustomPlotScripts = new Map();
const _scriptUniqueNameMap = new Map();
const _scriptFunctionsScope = new Map();

/**
 * Global helper to allow IIFE / script-tag custom scripts to register returned function exports.
 * @param {string} src
 * @param {Object} exportsObj
 */
window.registerCustomPlotModule = function (src, exportsObj) {
    if (src && exportsObj && typeof exportsObj === 'object') {
        window._lastCustomModuleExports = { src, exports: exportsObj };
    }
};

/**
 * Global API for registering custom plot renderer functions.
 * @param {string} name
 * @param {Function} renderFn
 */
window.registerPlotRenderer = function (name, renderFn) {
    if (typeof name === 'string' && typeof renderFn === 'function') {
        window.plotRenderers[name] = renderFn;
    }
};

let _pyodidePromise = null;

/**
 * Lazy initialize Pyodide Python runtime and bridge CoolProp/PropsSI to Python sys.modules.
 * @returns {Promise<Object>}
 */
async function getPyodideInstance() {
    if (window._pyodideInstance) return window._pyodideInstance;
    if (_pyodidePromise) return _pyodidePromise;

    _pyodidePromise = (async () => {
        try {
            await initCoolProp();
        } catch (e) {
            console.warn('[renderer.js] initCoolProp warning before Pyodide:', e);
        }

        if (!window.loadPyodide) {
            await new Promise((resolve, reject) => {
                const existing = document.querySelector('script[data-pyodide]');
                if (existing) {
                    existing.addEventListener('load', () => resolve());
                    existing.addEventListener('error', (err) => reject(err));
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
                script.setAttribute('data-pyodide', 'true');
                script.onload = () => resolve();
                script.onerror = (err) => reject(new Error('Failed to load Pyodide from CDN: ' + err));
                document.head.appendChild(script);
            });
        }

        const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        });

        // Initialize CoolProp bridge in Python sys.modules
        await pyodide.runPythonAsync(`
import sys
import types
import js

try:
    cp_mod = types.ModuleType("CoolProp")
    cp_sub = types.ModuleType("CoolProp.CoolProp")

    def _props_si(out_prop, name1, val1, name2, val2, fluid):
        try:
            return float(js.PropsSI(str(out_prop), str(name1), float(val1), str(name2), float(val2), str(fluid)))
        except Exception as err:
            return float('nan')

    def _ha_props_si(out_prop, name1, val1, name2, val2, name3, val3):
        try:
            return float(js.HAPropsSI(str(out_prop), str(name1), float(val1), str(name2), float(val2), str(name3), float(val3)))
        except Exception as err:
            return float('nan')

    cp_sub.PropsSI = _props_si
    cp_sub.HAPropsSI = _ha_props_si
    cp_mod.CoolProp = cp_sub
    cp_mod.PropsSI = _props_si
    cp_mod.HAPropsSI = _ha_props_si
    sys.modules["CoolProp"] = cp_mod
    sys.modules["CoolProp.CoolProp"] = cp_sub
except Exception as e:
    print("[renderer.js] Warning: Failed to initialize CoolProp Python bridge:", e)
        `);

        window._pyodideInstance = pyodide;
        return pyodide;
    })();

    return _pyodidePromise;
}

let _pythonCalculationFunction = null;
let _pythonCalculationScriptName = null;
let _pythonEnginePromise = null;

/**
 * Fetch Python script source with candidate path resolution for topic pages and courses.
 * @param {string} src
 * @returns {Promise<{text: string, url: string}>}
 */
async function fetchPythonScript(src) {
    if (!src || typeof src !== 'string') {
        throw new Error('[renderer.js] Invalid pythonScript path: ' + src);
    }
    const candidates = [];
    const urlParams = new URLSearchParams(window.location.search);
    const course = urlParams.get('course');
    const cleanBase = src.split('/').pop().split('\\').pop();

    if (course) {
        const courseRel = `../${course}/${cleanBase}`;
        if (!candidates.includes(courseRel)) candidates.push(courseRel);
    }

    if (!candidates.includes(src)) candidates.push(src);

    const sameFolder = `./${cleanBase}`;
    if (!candidates.includes(sameFolder)) candidates.push(sameFolder);

    if (course) {
        const directCourse = `${course}/${cleanBase}`;
        if (!candidates.includes(directCourse)) candidates.push(directCourse);
    }

    if (!candidates.includes(cleanBase)) candidates.push(cleanBase);

    for (const url of candidates) {
        try {
            const resp = await fetch(url);
            if (resp.ok) {
                const text = await resp.text();
                return { text, url };
            }
        } catch (e) {
            // Check next candidate
        }
    }
    throw new Error(`[renderer.js] Failed to fetch Python script '${src}'. Tried candidate paths: [${candidates.join(', ')}]`);
}

/**
 * Scan pageData.inputOutput for pythonScript, load Pyodide runtime and the script,
 * and register the calculation function.
 * Supports { "path": "...", "function": "..." } object or string path.
 * @param {Object} pageData
 * @returns {Promise<void>}
 */
async function ensurePythonEngine(pageData) {
    if (!pageData || !pageData.inputOutput || !pageData.inputOutput.pythonScript) {
        return;
    }

    const pyScriptCfg = pageData.inputOutput.pythonScript;
    let scriptSrc = null;
    let specifiedFunc = null;

    if (typeof pyScriptCfg === 'object' && pyScriptCfg !== null) {
        scriptSrc = pyScriptCfg.path || pyScriptCfg.src;
        specifiedFunc = pyScriptCfg.function || pyScriptCfg.name;
    } else if (typeof pyScriptCfg === 'string') {
        scriptSrc = pyScriptCfg;
        specifiedFunc = pageData.inputOutput.pythonFunction;
    }

    if (!scriptSrc) return;

    const cacheKey = `${scriptSrc}::${specifiedFunc || ''}`;
    if (_pythonEnginePromise && _pythonCalculationScriptName === cacheKey) {
        return _pythonEnginePromise;
    }

    _pythonEnginePromise = (async () => {
        try {
            const pyodide = await getPyodideInstance();
            const { text: pyCode } = await fetchPythonScript(scriptSrc);

            // Execute script in Pyodide
            await pyodide.runPythonAsync(pyCode);

            // Determine calculation function: use specified function directly
            let targetFunc = null;
            if (specifiedFunc) {
                targetFunc = pyodide.globals.get(specifiedFunc);
                if (typeof targetFunc !== 'function') {
                    console.error(`[renderer.js] Function '${specifiedFunc}' was not found in Python script '${scriptSrc}'.`);
                    return;
                }
            } else {
                const candidateNames = ['calculate', 'compute', 'main', 'run'];
                for (const name of candidateNames) {
                    const fn = pyodide.globals.get(name);
                    if (typeof fn === 'function') {
                        targetFunc = fn;
                        break;
                    }
                }
            }

            if (typeof targetFunc !== 'function') {
                console.error(`[renderer.js] No calculation function found in Python script '${scriptSrc}'. Expected { "path": "...", "function": "function_name" }.`);
                return;
            }

            _pythonCalculationFunction = targetFunc;
            _pythonCalculationScriptName = cacheKey;

            // Trigger recompute if controls are already active
            if (typeof window.forceCompute === 'function') {
                window.forceCompute();
            }
        } catch (err) {
            console.error(`[renderer.js] Failed to initialize Python calculation engine '${scriptSrc}':`, err);
        }
    })();

    return _pythonEnginePromise;
}

/**
 * Execute the registered Python calculation function with the current input state dictionary.
 * @param {Object} state - Interactive state
 * @returns {Object|null} Dictionary of calculated outputs or null on failure
 */
function runPythonCalculation(state) {
    if (!_pythonCalculationFunction || !window._pyodideInstance) {
        return null;
    }

    const pyodide = window._pyodideInstance;

    // Filter out internal state keys and functions to provide a clean dictionary
    const inputs = {};
    for (const [key, val] of Object.entries(state || {})) {
        if (!key.startsWith('_') && typeof val !== 'function') {
            inputs[key] = val;
        }
    }

    let pyInputs = null;
    let rawResult = null;

    try {
        pyInputs = pyodide.toPy(inputs);
        rawResult = _pythonCalculationFunction(pyInputs);

        let jsResult = {};
        if (rawResult && typeof rawResult.toJs === 'function') {
            jsResult = rawResult.toJs({ dict_converter: Object.fromEntries });
        } else if (rawResult && typeof rawResult === 'object') {
            jsResult = rawResult;
        }
        return jsResult;
    } catch (err) {
        console.error('[renderer.js] Error executing Python calculation function:', err);
        return null;
    } finally {
        if (pyInputs && typeof pyInputs.destroy === 'function') {
            pyInputs.destroy();
        }
        if (rawResult && typeof rawResult.destroy === 'function') {
            rawResult.destroy();
        }
    }
}

/**
 * Fetch and execute a Python plot script via Pyodide, wrapping exported functions.
 * @param {string} src
 * @param {Array<string>} expectedList
 * @param {Object} returnedFunctions
 */
async function loadPyodidePlotScript(src, expectedList, returnedFunctions) {
    const pyodide = await getPyodideInstance();
    const resp = await fetch(src);
    if (!resp.ok) {
        throw new Error(`[renderer.js] Failed to fetch Python script '${src}': HTTP ${resp.status}`);
    }
    const pyCode = await resp.text();

    await pyodide.runPythonAsync(pyCode);

    const targetNames = new Set(expectedList);
    if (targetNames.size === 0) {
        const globalKeys = pyodide.runPython("list(globals().keys())").toJs();
        globalKeys.forEach(name => {
            if (!name.startsWith('_')) {
                const item = pyodide.globals.get(name);
                if (typeof item === 'function') {
                    targetNames.add(name);
                }
            }
        });
    }

    targetNames.forEach(funcName => {
        const pyFunc = pyodide.globals.get(funcName);
        if (typeof pyFunc === 'function') {
            returnedFunctions[funcName] = function(plotCtx) {
                try {
                    let rawResult;
                    try {
                        rawResult = pyFunc(plotCtx);
                    } catch (callErr) {
                        if (callErr && callErr.message && callErr.message.includes('takes 0 positional arguments')) {
                            rawResult = pyFunc();
                        } else {
                            throw callErr;
                        }
                    }

                    if (rawResult && typeof rawResult.toJs === 'function') {
                        const jsResult = rawResult.toJs({ dict_converter: Object.fromEntries });
                        if (typeof rawResult.destroy === 'function') {
                            rawResult.destroy();
                        }
                        return jsResult;
                    }
                    return rawResult;
                } catch (err) {
                    console.error(`[renderer.js] Error executing Python function '${funcName}':`, err);
                    throw err;
                }
            };
        }
    });
}

/**
 * Dynamically load an external custom plot script file (JS or Python), catch returned function exports,
 * validate expected function names, and map them to unique function names.
 * @param {string} src - Script URL or relative path
 * @param {Array<string>|string} [expectedFuncNames] - List of expected function names
 * @returns {Promise<Object>} Returns map of original function names to unique registered function names
 */
async function loadCustomPlotScript(src, expectedFuncNames = []) {
    if (!src) return {};

    const expectedList = Array.isArray(expectedFuncNames)
        ? expectedFuncNames.filter(Boolean)
        : (expectedFuncNames ? [expectedFuncNames] : []);

    if (_loadedCustomPlotScripts.has(src)) {
        const existingMapping = _loadedCustomPlotScripts.get(src);
        expectedList.forEach(funcName => {
            const key = `${src}::${funcName}`;
            if (!_scriptUniqueNameMap.has(key)) {
                console.warn(`[renderer.js] Warning: expected function '${funcName}' was not previously registered for '${src}'.`);
            }
        });
        return existingMapping;
    }

    let returnedFunctions = {};

    const isPython = typeof src === 'string' && src.trim().toLowerCase().split('?')[0].endsWith('.py');

    if (isPython) {
        await loadPyodidePlotScript(src, expectedList, returnedFunctions);
    } else {
        try {
            window._lastCustomModuleExports = null;
            const mod = await import(src);
            if (mod) {
                if (mod.default && typeof mod.default === 'object') {
                    Object.assign(returnedFunctions, mod.default);
                }
                Object.assign(returnedFunctions, mod);
            }
        } catch (e) {
            // Fallback for non-ES module scripts
            await new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = (err) => reject(err);
                document.head.appendChild(script);
            });

            if (window._lastCustomModuleExports && window._lastCustomModuleExports.exports) {
                Object.assign(returnedFunctions, window._lastCustomModuleExports.exports);
            }
        }
    }

    // Store custom helper functions scope for evaluation (without placing on window)
    _scriptFunctionsScope.set(src, returnedFunctions);

    // Fallback check on window / plotRenderers for functions matching expected names
    expectedList.forEach(funcName => {
        if (!returnedFunctions[funcName]) {
            if (window.plotRenderers && typeof window.plotRenderers[funcName] === 'function') {
                returnedFunctions[funcName] = window.plotRenderers[funcName];
            } else if (typeof window[funcName] === 'function') {
                returnedFunctions[funcName] = window[funcName];
            }
        }
    });

    // Validate that ALL expected function names were provided
    const missing = expectedList.filter(funcName => typeof returnedFunctions[funcName] !== 'function');
    if (missing.length > 0) {
        const errMsg = `[renderer.js] Custom plot script validation failed for '${src}': Expected function(s) [${missing.join(', ')}] were not provided by the script.`;
        console.error(errMsg);
        throw new Error(errMsg);
    }

    // Assign each returned function to a UNIQUE function name
    const scriptMapping = {};
    Object.keys(returnedFunctions).forEach(origName => {
        const fn = returnedFunctions[origName];
        if (typeof fn === 'function') {
            const uniqueId = ++_customScriptCounter;
            const uniqueName = `__custom_${origName}_${uniqueId}`;

            window.plotRenderers[uniqueName] = fn;

            const fullKey = `${src}::${origName}`;
            _scriptUniqueNameMap.set(fullKey, uniqueName);
            _scriptUniqueNameMap.set(origName, uniqueName);
            scriptMapping[origName] = uniqueName;
        }
    });

    _loadedCustomPlotScripts.set(src, scriptMapping);
    return scriptMapping;
}

/**
 * Scan pageData.plots for specified external custom scripts, validate their function names, and load them.
 * @param {Object} pageData
 * @returns {Promise<void>}
 */
async function ensureCustomPlotScripts(pageData) {
    if (!pageData || !pageData.plots) return;

    const scriptFuncsMap = new Map();

    if (Array.isArray(pageData.plots.customScripts)) {
        const funcNamesList = pageData.plots.customScriptFunctions || pageData.plots.customFunctions || pageData.plots.customScriptFunctionNames || [];
        pageData.plots.customScripts.forEach((src, idx) => {
            if (typeof src === 'string') {
                if (!scriptFuncsMap.has(src)) scriptFuncsMap.set(src, new Set());
                const expected = Array.isArray(funcNamesList[idx]) ? funcNamesList[idx] : (typeof funcNamesList[idx] === 'string' ? [funcNamesList[idx]] : []);
                expected.forEach(fn => scriptFuncsMap.get(src).add(fn));
            }
        });
    }

    if (Array.isArray(pageData.plots.settings)) {
        const flatSettings = pageData.plots.settings.flat();
        flatSettings.forEach(p => {
            if (p && typeof p.customScript === 'string') {
                const src = p.customScript;
                if (!scriptFuncsMap.has(src)) scriptFuncsMap.set(src, new Set());

                const targetFn = p.customRender || p.customPlot || p.customRenderer;
                if (typeof targetFn === 'string') {
                    scriptFuncsMap.get(src).add(targetFn);
                }

                const addFuncs = p.customScriptFunctions || p.customFunctions || p.customScriptFunctionNames;
                if (Array.isArray(addFuncs)) {
                    addFuncs.forEach(fn => typeof fn === 'string' && scriptFuncsMap.get(src).add(fn));
                }
            }
        });
    }

    const promises = Array.from(scriptFuncsMap.entries()).map(([src, funcSet]) => {
        return loadCustomPlotScript(src, Array.from(funcSet));
    });
    await Promise.all(promises);
}

/**
 * Resolve a custom render function from plot configuration using unique mapped function names.
 * @param {Object} plotConfig
 * @returns {Function|null}
 */
function getCustomRenderFunction(plotConfig) {
    if (!plotConfig) return null;
    const target = plotConfig.customRender || plotConfig.customPlot || plotConfig.customRenderer;
    if (typeof target === 'function') return target;

    if (typeof target === 'string') {
        const scriptSrc = plotConfig.customScript;
        if (scriptSrc) {
            const fullKey = `${scriptSrc}::${target}`;
            if (_scriptUniqueNameMap.has(fullKey)) {
                const uniqueName = _scriptUniqueNameMap.get(fullKey);
                if (window.plotRenderers && typeof window.plotRenderers[uniqueName] === 'function') {
                    return window.plotRenderers[uniqueName];
                }
            }
        }

        if (_scriptUniqueNameMap.has(target)) {
            const uniqueName = _scriptUniqueNameMap.get(target);
            if (window.plotRenderers && typeof window.plotRenderers[uniqueName] === 'function') {
                return window.plotRenderers[uniqueName];
            }
        }

        if (window.plotRenderers && typeof window.plotRenderers[target] === 'function') {
            return window.plotRenderers[target];
        }
        if (typeof window[target] === 'function') {
            return window[target];
        }
    }
    return null;
}

// ---------------------------------------------------------
// SECTION D: Plot Integration
// ---------------------------------------------------------

function _calculateState(baseState, xVal, plotConfig, pageData) {
    const tempState = { ...baseState };
    tempState[plotConfig.x] = xVal;

    let pyOutputs = null;
    if (pageData.inputOutput && pageData.inputOutput.pythonScript) {
        pyOutputs = runPythonCalculation(tempState);
        if (pyOutputs && typeof pyOutputs === 'object') {
            Object.assign(tempState, pyOutputs);
        }
    }

    if (pageData.inputOutput && Array.isArray(pageData.inputOutput.outputs)) {
        pageData.inputOutput.outputs.forEach(output => {
            if (pyOutputs && output.id in pyOutputs) {
                tempState[output.id] = pyOutputs[output.id];
            } else if (output.type === 'calculation' && output.value) {
                tempState[output.id] = evaluateFormula(output.value, tempState);
            }
        });
    }
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

/**
 * Determine if an item is a coordinate pair or point object rather than a series descriptor.
 */
function isPointItem(item) {
    if (!item) return false;
    if (Array.isArray(item)) {
        return typeof item[0] === 'number' || (!isNaN(parseFloat(item[0])) && item.length >= 2);
    }
    if (typeof item === 'object') {
        return ('x' in item || 'y' in item);
    }
    return false;
}

/**
 * Convert a data point [x, y] or {x, y} to pixel coordinates using D3 scales.
 */
function toPixelPoint(pt, xScale, yScale) {
    if (!pt) return null;
    let xv, yv;
    if (Array.isArray(pt)) {
        xv = typeof pt[0] === 'number' ? pt[0] : parseFloat(pt[0]);
        yv = typeof pt[1] === 'number' ? pt[1] : parseFloat(pt[1]);
    } else if (typeof pt === 'object') {
        xv = pt.x !== undefined ? (typeof pt.x === 'number' ? pt.x : parseFloat(pt.x)) : (pt[0] !== undefined ? parseFloat(pt[0]) : undefined);
        yv = pt.y !== undefined ? (typeof pt.y === 'number' ? pt.y : parseFloat(pt.y)) : (pt[1] !== undefined ? parseFloat(pt[1]) : undefined);
    }
    if (xv === undefined || yv === undefined || isNaN(xv) || isNaN(yv)) return null;
    return [xScale(xv), yScale(yv)];
}

/**
 * Linearly interpolate Y value corresponding to a target X value from an array of data points.
 */
function interpolateYFromPoints(pts, targetX) {
    if (!pts || !Array.isArray(pts) || pts.length === 0) return undefined;
    const cleanPts = pts.map(pt => {
        if (!pt) return null;
        let xv, yv;
        if (Array.isArray(pt)) {
            xv = typeof pt[0] === 'number' ? pt[0] : parseFloat(pt[0]);
            yv = typeof pt[1] === 'number' ? pt[1] : parseFloat(pt[1]);
        } else if (typeof pt === 'object') {
            xv = pt.x !== undefined ? parseFloat(pt.x) : parseFloat(pt[0]);
            yv = pt.y !== undefined ? parseFloat(pt.y) : parseFloat(pt[1]);
        }
        if (xv === undefined || yv === undefined || isNaN(xv) || isNaN(yv)) return null;
        return [xv, yv];
    }).filter(Boolean).sort((a, b) => a[0] - b[0]);

    if (cleanPts.length === 0) return undefined;
    if (targetX <= cleanPts[0][0]) return cleanPts[0][1];
    if (targetX >= cleanPts[cleanPts.length - 1][0]) return cleanPts[cleanPts.length - 1][1];

    for (let i = 0; i < cleanPts.length - 1; i++) {
        const x0 = cleanPts[i][0];
        const y0 = cleanPts[i][1];
        const x1 = cleanPts[i + 1][0];
        const y1 = cleanPts[i + 1][1];
        if (targetX >= x0 && targetX <= x1) {
            if (Math.abs(x1 - x0) < 1e-12) return y0;
            const t = (targetX - x0) / (x1 - x0);
            return y0 + t * (y1 - y0);
        }
    }
    return cleanPts[0][1];
}

function injectPlots(state, pageData) {
    if (!pageData.plots || !pageData.plots.settings || pageData.plots.settings.length === 0 || typeof d3 === 'undefined') return;

    const svg = d3.select('#plot');
    if (svg.empty()) return;
    svg.selectAll('*').remove(); // Clear previous plot

    const rawSettings = pageData.plots.settings;
    // Plots with a `showWhen` condition are only drawn while it evaluates truthy
    const isShown = p => !p || !p.showWhen || !!evaluateFormula(p.showWhen, state);
    let rows = [];
    if (Array.isArray(rawSettings) && rawSettings.length > 0) {
        if (Array.isArray(rawSettings[0])) {
            rows = rawSettings.map(row => row.filter(isShown)).filter(row => row.length > 0);
        } else {
            const shownSettings = rawSettings.filter(isShown);
            const cols = (pageData.plots.plotColumns && pageData.plots.plotColumns > 0)
                ? Math.min(pageData.plots.plotColumns, shownSettings.length)
                : shownSettings.length;
            for (let i = 0; i < shownSettings.length; i += cols) {
                rows.push(shownSettings.slice(i, i + cols));
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
    let minObservedLeft = 0;
    let globalPlotIndex = 0;

    rowLayouts.forEach((layout, rowIndex) => {
        let currentX = m.l;
        const plot_y_offset = rowYOffsets[rowIndex];

        layout.rowPlots.forEach((plotConfig, colIndex) => {
            const iw = layout.plotWidths[colIndex];
            const ih = layout.plotHeights[colIndex];
            const plot_x_offset = currentX;
            currentX += iw + gapX;

            const isEmptySlot = !plotConfig || Object.keys(plotConfig).length === 0 || (!plotConfig.x && !plotConfig.y && !plotConfig.series && !plotConfig.points);
            if (isEmptySlot) return;

            const plotIndex = globalPlotIndex++;

            const preCustomFn = getCustomRenderFunction(plotConfig);
            let preMode = (plotConfig.mode || (preCustomFn || plotConfig.series || plotConfig.points ? 'override' : 'standard')).toLowerCase();
            if (preMode === 'standalone') preMode = 'override';

            let currentYVal = state[plotConfig.y];
            if ((currentYVal === undefined || isNaN(currentYVal)) && preMode !== 'override' && preMode !== 'points' && !preCustomFn) return;

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
                        return (currentYVal !== undefined && !isNaN(currentYVal)) ? (currentYVal <= evaluatedMax) : true;
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
            const yLabelLeft = plot_x_offset - yAxisBBox.width - 40;
            minObservedLeft = Math.min(minObservedLeft, yLabelLeft - 8 * scale);

            const yLabelFO = svg.append('foreignObject')
                .attr('width', ih)
                .attr('height', 50)
                .attr('transform', `translate(${yLabelLeft}, ${plot_y_offset + ih}) rotate(-90)`);

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

            // Add clip path for the plot
            const clipId = `clip-${plotIndex}`;
            svg.append('clipPath').attr('id', clipId)
                .append('rect').attr('x', plot_x_offset).attr('y', plot_y_offset)
                .attr('width', iw).attr('height', ih);

            // Lazy load custom script if not preloaded
            if (plotConfig.customScript && !_loadedCustomPlotScripts.has(plotConfig.customScript)) {
                loadCustomPlotScript(plotConfig.customScript).then(() => {
                    if (typeof window.forceCompute === 'function') {
                        window.forceCompute();
                    }
                });
            }

            const customRenderFn = getCustomRenderFunction(plotConfig);
            let mode = (plotConfig.mode || (customRenderFn || plotConfig.series || plotConfig.points ? 'override' : 'standard')).toLowerCase();
            if (mode === 'standalone') mode = 'override';

            // Custom layer group clipped to plot boundaries
            const plotG = svg.append('g')
                .attr('class', `custom-plot-layer plot-${plotIndex}`)
                .attr('clip-path', `url(#${clipId})`);

            const plotCtx = {
                svg,
                g: plotG,
                plotConfig,
                customData: plotConfig.customData || plotConfig.customParams || {},
                state,
                pageData,
                x,
                y,
                xMinVal,
                xMaxVal,
                yMinVal,
                yMax,
                m,
                iw,
                ih,
                scale,
                plot_x_offset,
                plot_y_offset,
                clipId,
                accessibleVals,
                xVals,
                getPoint,
                d3,
                CoolProp: window.CoolProp || window.coolprop || window.CoolPropModule,
                PropsSI: window.PropsSI,
                HAPropsSI: window.HAPropsSI,
                evaluateFormula,
                parseText,
                _plot,
                forceCompute: window.forceCompute
            };

            // Mode 'before': execute custom renderer before standard curves
            if (customRenderFn && mode === 'before') {
                try {
                    customRenderFn(plotCtx);
                } catch (err) {
                    console.error(`[renderer.js] Error in custom plot renderer ('${plotConfig.customRender}'):`, err);
                }
            }

            const currentXVal = state[plotConfig.x];

            let solidData = [];
            let dottedData = [];
            let customSeriesList = null;
            let customSolidColor = '#0075ff';
            let customSolidWidth = 2 * scale;
            let customSolidDashed = false;

            // Mode 'points': custom script provides data points for renderer to plot
            if (mode === 'points') {
                let customPointsResult = null;
                if (customRenderFn) {
                    try {
                        customPointsResult = customRenderFn(plotCtx);
                    } catch (err) {
                        console.error(`[renderer.js] Error in custom points renderer ('${plotConfig.customRender}'):`, err);
                    }
                }
                const rawPointsData = customPointsResult !== undefined && customPointsResult !== null
                    ? customPointsResult
                    : (plotCtx.curvePoints || plotCtx.pointsData || (Array.isArray(plotCtx.points) && plotCtx.points !== plotConfig.points ? plotCtx.points : null));

                if (rawPointsData) {
                    if (Array.isArray(rawPointsData) && rawPointsData.length > 0 && !isPointItem(rawPointsData[0]) && (rawPointsData[0].points || Array.isArray(rawPointsData[0]))) {
                        // Multi-series array: [{ points, color, dashed, opacity, strokeWidth, name }, ...] or [[[x,y],...], ...]
                        customSeriesList = rawPointsData.map((series, sIdx) => {
                            const sPts = Array.isArray(series) ? series : (series.points || []);
                            const sColor = series.color || (sIdx === 0 ? '#0075ff' : (sIdx === 1 ? '#dc2626' : (sIdx === 2 ? '#16a34a' : '#d97706')));
                            const sDashed = series.dashed !== undefined ? series.dashed : false;
                            const sOpacity = series.opacity !== undefined ? series.opacity : 1;
                            const sWidth = series.strokeWidth || (2 * scale);
                            const sName = series.name || `series-${sIdx}`;
                            const mappedData = sPts.map(pt => toPixelPoint(pt, x, y)).filter(Boolean);
                            return {
                                data: mappedData,
                                color: sColor,
                                dashed: sDashed,
                                opacity: sOpacity,
                                strokeWidth: sWidth,
                                name: sName
                            };
                        });

                        if ((currentYVal === undefined || isNaN(currentYVal)) && currentXVal !== undefined && !isNaN(currentXVal)) {
                            const firstSeries = Array.isArray(rawPointsData[0]) ? rawPointsData[0] : (rawPointsData[0].points || []);
                            const interp = interpolateYFromPoints(firstSeries, currentXVal);
                            if (interp !== undefined && !isNaN(interp)) {
                                currentYVal = interp;
                                if (plotConfig.y) state[plotConfig.y] = currentYVal;
                            }
                        }
                    } else if (typeof rawPointsData === 'object' && !Array.isArray(rawPointsData) && (rawPointsData.solid || rawPointsData.dotted)) {
                        // Explicit solid and dotted segments: { solid: [...], dotted: [...] }
                        const solidPts = rawPointsData.solid || [];
                        const dottedPts = rawPointsData.dotted || [];
                        solidData = solidPts.map(pt => toPixelPoint(pt, x, y)).filter(Boolean);
                        dottedData = dottedPts.map(pt => toPixelPoint(pt, x, y)).filter(Boolean);
                        if (rawPointsData.color) customSolidColor = rawPointsData.color;
                        if (rawPointsData.strokeWidth) customSolidWidth = rawPointsData.strokeWidth;
                        if (rawPointsData.dashed !== undefined) customSolidDashed = rawPointsData.dashed;

                        if ((currentYVal === undefined || isNaN(currentYVal)) && currentXVal !== undefined && !isNaN(currentXVal)) {
                            const interp = interpolateYFromPoints([...solidPts, ...dottedPts], currentXVal);
                            if (interp !== undefined && !isNaN(interp)) {
                                currentYVal = interp;
                                if (plotConfig.y) state[plotConfig.y] = currentYVal;
                            }
                        }
                    } else {
                        // Single dataset: array of points [[x, y], ...], { points: [...] }, or { x: [], y: [] }
                        let pts = [];
                        if (Array.isArray(rawPointsData)) {
                            pts = rawPointsData;
                        } else if (rawPointsData.points && Array.isArray(rawPointsData.points)) {
                            pts = rawPointsData.points;
                            if (rawPointsData.color) customSolidColor = rawPointsData.color;
                            if (rawPointsData.strokeWidth) customSolidWidth = rawPointsData.strokeWidth;
                            if (rawPointsData.dashed !== undefined) customSolidDashed = rawPointsData.dashed;
                        } else if (Array.isArray(rawPointsData.x) && Array.isArray(rawPointsData.y)) {
                            pts = rawPointsData.x.map((xv, idx) => [xv, rawPointsData.y[idx]]);
                        }

                        if (dottedMin !== undefined && dottedMax !== undefined) {
                            const solidPts = [];
                            const dottedPts = [];
                            pts.forEach(pt => {
                                const xv = Array.isArray(pt) ? pt[0] : (pt && pt.x);
                                if (xv !== undefined && xv >= dottedMin && xv <= dottedMax) {
                                    dottedPts.push(pt);
                                } else {
                                    solidPts.push(pt);
                                }
                            });
                            solidData = solidPts.map(pt => toPixelPoint(pt, x, y)).filter(Boolean);
                            dottedData = dottedPts.map(pt => toPixelPoint(pt, x, y)).filter(Boolean);
                        } else {
                            solidData = pts.map(pt => toPixelPoint(pt, x, y)).filter(Boolean);
                        }

                        if ((currentYVal === undefined || isNaN(currentYVal)) && currentXVal !== undefined && !isNaN(currentXVal)) {
                            const interp = interpolateYFromPoints(pts, currentXVal);
                            if (interp !== undefined && !isNaN(interp)) {
                                currentYVal = interp;
                                if (plotConfig.y) state[plotConfig.y] = currentYVal;
                            }
                        }
                    }
                }
            } else if (mode !== 'override') {
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
            }

            // Draw solid and dotted parts of the curve (unless override mode)
            if (mode !== 'override') {
                if (customSeriesList && customSeriesList.length > 0) {
                    customSeriesList.forEach((series, sIdx) => {
                        if (series.data && series.data.length > 0) {
                            _plot(series.data, plotIndex, series.name || `series-${sIdx}`, series.dashed, series.opacity, series.color, series.strokeWidth);
                        }
                    });
                } else {
                    if (solidData.length > 0) {
                        _plot(solidData, plotIndex, 'solid', customSolidDashed, 1, customSolidColor, customSolidWidth);
                    }
                    if (dottedData.length > 0) {
                        _plot(dottedData, plotIndex, 'dotted', true, 0.7, 'gray', customSolidWidth);
                    }
                }

                // Draw reference lines and labels
                drawReferenceLines(plotCtx);

                // Active curve label
                drawActiveLabel(solidData, dottedData, plotCtx);
            }

            // Mode 'overlay' / 'override': execute custom renderer
            if (customRenderFn && (mode === 'overlay' || mode === 'override')) {
                try {
                    customRenderFn(plotCtx);
                } catch (err) {
                    console.error(`[renderer.js] Error in custom plot renderer ('${plotConfig.customRender}'):`, err);
                }
            }

            // Draw configured points, connecting segments, nondraggable point markers, and point labels
            drawPlotPoints(plotCtx);
            // Series share axes and are painted in declaration order.
            (plotConfig.series || []).forEach(series => drawPlotPoints({ ...plotCtx, plotConfig: series }));

            // Draw Draggable Point & Hit area (if x and y defined, not override mode, and showPoint is not false)
            const ptGrayed = dottedMin < currentXVal && currentXVal < dottedMax;
            const shouldShowInteractivePoint = plotConfig.showPoint !== false && plotConfig.draggablePoint !== false && plotConfig.showDraggablePoint !== false && !plotConfig.hidePoint && !plotConfig.hideDraggablePoint;

            if (shouldShowInteractivePoint && plotConfig.x && plotConfig.y && mode !== 'override' && currentXVal !== undefined && !isNaN(currentXVal) && currentYVal !== undefined && !isNaN(currentYVal)) {
                // Optional per-plot lock: when set, the point can't be dragged unless
                // the x-variable's dropdown is on its 'custom' choice.
                const dropdownElForLock = document.getElementById(`input_${plotConfig.x}_dropdown`);
                const isLocked = !!plotConfig.lockDragUnlessCustom && dropdownElForLock && dropdownElForLock.value !== 'custom';

                const dragpt = svg.append('circle').attr('class', 'dragpt')
                    .attr('r', 6 * scale)
                    .attr('cx', x(currentXVal))
                    .attr('cy', y(currentYVal))
                    .style('fill', ptGrayed ? 'gray' : '#0075ff')
                    .style('stroke', 'none')
                    .style('cursor', isLocked ? 'not-allowed' : null);

                // Interaction Background
                const hit = svg.append('rect').attr('class', 'hit')
                    .attr('x', plot_x_offset).attr('y', plot_y_offset)
                    .attr('width', iw).attr('height', ih)
                    .style('cursor', isLocked ? 'not-allowed' : null);

                const drag = d3.drag()
                    .filter(() => !isLocked)
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
            }
        });
    });

    if (maxObservedBottom > H) {
        H = Math.ceil(maxObservedBottom);
        if (svgEl) {
            svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
        }
    }

    // Rotated y labels can extend beyond the fixed left margin at narrow widths.
    if (svgEl && minObservedLeft < 0) {
        svgEl.setAttribute('viewBox', `${minObservedLeft} 0 ${W - minObservedLeft} ${H}`);
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
    const { svg, plotConfig, state, accessibleVals, xVals, getPoint, clipId, pageData, ih, plot_y_offset } = plotCtx;
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
            .attr('d', d3.line().defined(d => d && !isNaN(d[1]) && d[1] >= plot_y_offset && d[1] <= plot_y_offset + ih)(refData));

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
    const { svg, ih, iw, scale, plot_x_offset, plot_y_offset } = plotCtx;

    if (refSetting.labelPosition === 'above' || refSetting.labelPosition === 'below') {
        // Anchor at the horizontal middle of the plot (50% of its width),
        // offset 18px up or down depending on whether this is the upper or
        // lower dashed line.
        const targetX = plot_x_offset + iw * 0.5;
        let anchorPoint = null;
        let bestDist = Infinity;
        refData.forEach(pt => {
            if (pt && !isNaN(pt[0]) && !isNaN(pt[1]) && pt[1] >= plot_y_offset && pt[1] <= (plot_y_offset + ih)) {
                const dist = Math.abs(pt[0] - targetX);
                if (dist < bestDist) {
                    bestDist = dist;
                    anchorPoint = pt;
                }
            }
        });

        if (anchorPoint) {
            const foHeight = 20 * scale;
            const foWidth = 120 * scale;
            const verticalOffset = 18 * scale;

            const centerY = refSetting.labelPosition === 'above'
                ? anchorPoint[1] - verticalOffset
                : anchorPoint[1] + verticalOffset;

            const foX = anchorPoint[0] - foWidth / 2;
            let foY = centerY - foHeight / 2;

            // Clamp within plot boundaries plus a small margin
            const minYBound = plot_y_offset;
            const maxYBound = plot_y_offset + ih - foHeight;
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
                .style('text-align', 'center')
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
    const { svg, plotConfig, state, scale, ih, iw, plot_x_offset, plot_y_offset } = plotCtx;
    if (!plotConfig.activeLabel) return;

    let activeText = plotConfig.activeLabel;
    activeText = activeText.replace(/\{([^}]+)\}/g, (_, key) => {
        const val = state[key];
        if (typeof val === 'number') {
            return Number.isInteger(val) ? val.toFixed(1) : parseFloat(val.toFixed(4)).toString();
        }
        return val !== undefined ? val : '';
    });

    // Anchor at 75% of the plot's width from left to right, offset 18px up.
    const activeData = solidData.length > 0 ? solidData : dottedData;
    const targetX = plot_x_offset + iw * 0.75;
    let anchorPoint = null;
    let bestDist = Infinity;
    activeData.forEach(pt => {
        if (pt && !isNaN(pt[0]) && !isNaN(pt[1]) && pt[1] >= plot_y_offset && pt[1] <= (plot_y_offset + ih)) {
            const dist = Math.abs(pt[0] - targetX);
            if (dist < bestDist) {
                bestDist = dist;
                anchorPoint = pt;
            }
        }
    });

    if (anchorPoint) {
        const foWidth = 150 * scale;
        const foHeight = 22 * scale;
        const verticalOffset = 18 * scale;

        const centerY = anchorPoint[1] - verticalOffset;

        const foX = anchorPoint[0] - foWidth / 2;
        let foY = centerY - foHeight / 2;

        const minYBound = plot_y_offset;
        const maxYBound = plot_y_offset + ih - foHeight;
        foY = Math.max(minYBound, Math.min(maxYBound, foY));

        const fo = svg.append('foreignObject')
            .attr('x', foX)
            .attr('y', foY)
            .attr('width', foWidth)
            .attr('height', foHeight)
            .style('overflow', 'visible');

        const activeDiv = fo.append('xhtml:div')
            .style('font-size', `${.875 * scale}rem`)
            .style('font-weight', 'bold')
            .style('color', '#0075ff')
            .style('text-align', 'center')
            .style('width', '100%');

        if (mathjaxCache.has(activeText)) {
            activeDiv.html(mathjaxCache.get(activeText));
        } else {
            activeDiv.html(parseText(activeText))
                .classed('needs-typeset', true)
                .attr('data-raw-text', activeText);
        }
    }
}

function drawPlotPoints(plotCtx) {
    const { svg, plotConfig, state, x, y, scale, clipId } = plotCtx;
    if (!plotConfig || !plotConfig.points) {
        return;
    }

    let rawPoints = plotConfig.points;
    if (typeof rawPoints === 'string' && Array.isArray(state[rawPoints])) {
        rawPoints = state[rawPoints];
    }
    if (!Array.isArray(rawPoints) || rawPoints.length === 0) {
        return;
    }

    const customScope = (plotConfig.customScript && _scriptFunctionsScope.get(plotConfig.customScript)) || null;

    const pointColors = Array.isArray(plotConfig.pointColors) ? plotConfig.pointColors : [];
    const pointLabels = Array.isArray(plotConfig.pointLabels) ? plotConfig.pointLabels : [];

    // Evaluate coordinates for each point
    const evaluatedPoints = [];
    rawPoints.forEach((pt, idx) => {
        if (!Array.isArray(pt) || pt.length < 2) return;
        const rawX = pt[0];
        const rawY = pt[1];

        const valX = typeof rawX === 'string' ? evaluateFormula(rawX, state, customScope) : rawX;
        const valY = typeof rawY === 'string' ? evaluateFormula(rawY, state, customScope) : rawY;

        if (valX == null || valY == null || !Number.isFinite(Number(valX)) || !Number.isFinite(Number(valY))) return;

        const px = x(valX);
        const py = y(valY);

        if (isNaN(px) || isNaN(py)) return;

        evaluatedPoints.push({
            valX,
            valY,
            px,
            py,
            originalIndex: idx
        });
    });

    if (evaluatedPoints.length === 0) return;

    const defaultStrokeColor = plotConfig.pointsColor || '#0075ff';

    const segmentColors = Array.isArray(plotConfig.pointSegmentColors) ? plotConfig.pointSegmentColors : [];

    // 1. Draw solid line segments connecting adjacent points
    for (let i = 0; i < evaluatedPoints.length - 1; i++) {
        const p1 = evaluatedPoints[i];
        const p2 = evaluatedPoints[i + 1];

        if (plotConfig.showLines === false || p2.originalIndex !== p1.originalIndex + 1) continue;
        let segColor = defaultStrokeColor;

        if (segmentColors[p1.originalIndex] !== undefined && segmentColors[p1.originalIndex] !== null && segmentColors[p1.originalIndex] !== '') {
            segColor = segmentColors[p1.originalIndex];
        } else if (pointColors[p1.originalIndex] !== undefined && pointColors[p1.originalIndex] !== null && pointColors[p1.originalIndex] !== '' && pointColors[p1.originalIndex] !== 'none' && pointColors[p1.originalIndex] !== 'transparent') {
            segColor = pointColors[p1.originalIndex];
        } else if (pointColors[p2.originalIndex] !== undefined && pointColors[p2.originalIndex] !== null && pointColors[p2.originalIndex] !== '' && pointColors[p2.originalIndex] !== 'none' && pointColors[p2.originalIndex] !== 'transparent') {
            segColor = pointColors[p2.originalIndex];
        }

        svg.append('line')
            .attr('class', 'point-segment')
            .attr('clip-path', `url(#${clipId})`)
            .attr('x1', p1.px)
            .attr('y1', p1.py)
            .attr('x2', p2.px)
            .attr('y2', p2.py)
            .style('stroke', segColor)
            .style('stroke-width', `${(plotConfig.lineWidth ?? 2) * scale}px`)
            .style('stroke-dasharray', plotConfig.lineDash || (plotConfig.dashed ? `${4 * scale} ${4 * scale}` : null))
            .style('opacity', plotConfig.opacity ?? 1)
            .style('stroke-linecap', 'round');
    }

    // 2. Draw nondraggable points
    evaluatedPoints.forEach(p => {
        const ptColor = pointColors[p.originalIndex] || defaultStrokeColor;
        if (plotConfig.showPoints === false || ptColor === 'none' || ptColor === 'transparent') return;

        svg.append('circle')
            .attr('class', 'nondragpt')
            .attr('clip-path', `url(#${clipId})`)
            .attr('cx', p.px)
            .attr('cy', p.py)
            .attr('r', (plotConfig.pointRadius ?? 5) * scale)
            .style('fill', ptColor)
            .style('stroke', '#ffffff')
            .style('stroke-width', `${1.5 * scale}px`)
            .style('cursor', 'default');
    });

    // 3. Draw point labels
    evaluatedPoints.forEach(p => {
        const labelDef = pointLabels[p.originalIndex];
        if (labelDef === undefined || labelDef === null || labelDef === '' || (typeof labelDef === 'object' && !labelDef.text)) return;

        let labelText = '';
        let location = 'top';
        let customOffsetX = undefined;
        let customOffsetY = undefined;
        let labelColor = pointColors[p.originalIndex] || defaultStrokeColor;

        if (typeof labelDef === 'string') {
            labelText = labelDef;
        } else if (typeof labelDef === 'object') {
            labelText = labelDef.text !== undefined ? labelDef.text : (labelDef.label !== undefined ? labelDef.label : (labelDef.content !== undefined ? labelDef.content : ''));
            if (labelDef.location) location = labelDef.location;

            customOffsetX = labelDef.offsetX !== undefined ? labelDef.offsetX : (labelDef['offset x'] !== undefined ? labelDef['offset x'] : labelDef.xOffset);
            customOffsetY = labelDef.offsetY !== undefined ? labelDef.offsetY : (labelDef['offset y'] !== undefined ? labelDef['offset y'] : labelDef.yOffset);

            if (labelDef.color) labelColor = labelDef.color;
        }

        if (typeof labelText !== 'string') labelText = String(labelText);
        if (!labelText || labelText.trim() === '') return; // Empty string omits label

        const locStr = location.toString().toLowerCase().trim().replace(/-/g, ' ');
        const dist = 14 * scale;

        let baseDx = 0;
        let baseDy = -dist;
        let textAnchor = 'center';
        let align = 'bottom';

        switch (locStr) {
            case 'top':
            case 'north':
            case 'n':
                baseDx = 0; baseDy = -dist; textAnchor = 'center'; align = 'bottom';
                break;
            case 'bottom':
            case 'south':
            case 's':
                baseDx = 0; baseDy = dist; textAnchor = 'center'; align = 'top';
                break;
            case 'left':
            case 'west':
            case 'w':
                baseDx = -dist; baseDy = 0; textAnchor = 'right'; align = 'middle';
                break;
            case 'right':
            case 'east':
            case 'e':
                baseDx = dist; baseDy = 0; textAnchor = 'left'; align = 'middle';
                break;
            case 'top left':
            case 'topleft':
            case 'nw':
            case 'northwest':
                baseDx = -dist * 0.707; baseDy = -dist * 0.707; textAnchor = 'right'; align = 'bottom';
                break;
            case 'top right':
            case 'topright':
            case 'ne':
            case 'northeast':
                baseDx = dist * 0.707; baseDy = -dist * 0.707; textAnchor = 'left'; align = 'bottom';
                break;
            case 'bottom left':
            case 'bottomleft':
            case 'sw':
            case 'southwest':
                baseDx = -dist * 0.707; baseDy = dist * 0.707; textAnchor = 'right'; align = 'top';
                break;
            case 'bottom right':
            case 'bottomright':
            case 'se':
            case 'southeast':
                baseDx = dist * 0.707; baseDy = dist * 0.707; textAnchor = 'left'; align = 'top';
                break;
            case 'center':
            case 'middle':
                baseDx = 0; baseDy = 0; textAnchor = 'center'; align = 'middle';
                break;
            default:
                baseDx = 0; baseDy = -dist; textAnchor = 'center'; align = 'bottom';
                break;
        }

        let finalDx = baseDx;
        let finalDy = baseDy;

        if (customOffsetX !== undefined && customOffsetX !== null && !isNaN(parseFloat(customOffsetX))) {
            finalDx = parseFloat(customOffsetX) * scale;
        }
        if (customOffsetY !== undefined && customOffsetY !== null && !isNaN(parseFloat(customOffsetY))) {
            finalDy = parseFloat(customOffsetY) * scale;
        }

        // Exact label displacement in screen pixels (positive y points down).
        if (Array.isArray(labelDef.offset)) {
            const [dx, dy] = labelDef.offset;
            finalDx = dx * scale;
            finalDy = dy * scale;
            textAnchor = labelDef.anchor || 'left';
            align = labelDef.align || 'middle';
        }
        const foWidth = 100 * scale;
        const foHeight = 26 * scale;

        let foX = p.px + finalDx;
        if (textAnchor === 'center') foX -= foWidth / 2;
        else if (textAnchor === 'right') foX -= foWidth;

        let foY = p.py + finalDy;
        if (align === 'middle') foY -= foHeight / 2;
        else if (align === 'bottom') foY -= foHeight;

        const fo = svg.append('foreignObject')
            .attr('x', foX)
            .attr('y', foY)
            .attr('width', foWidth)
            .attr('height', foHeight)
            .style('overflow', 'visible');

        const div = fo.append('xhtml:div')
            .style('font-size', `${0.875 * scale}rem`)
            .style('font-weight', '600')
            .style('color', labelColor)
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')
            .style('justify-content', textAnchor === 'center' ? 'center' : (textAnchor === 'right' ? 'flex-end' : 'flex-start'))
            .style('align-items', align === 'middle' ? 'center' : (align === 'bottom' ? 'flex-end' : 'flex-start'))
            .style('line-height', '1.2');

        if (mathjaxCache.has(labelText)) {
            div.html(mathjaxCache.get(labelText));
        } else {
            div.html(parseText(labelText))
                .classed('needs-typeset', true)
                .attr('data-raw-text', labelText);
        }
    });
}

// Expands each "swap" input into a selector dropdown, one slider per option, and one output per option.
// The selected option is an input (its output passes the slider value through); the others are
// calculated from their `formula`. Swap outputs are prepended so later outputs can reference them.
function expandSwapInputs(inputOutput) {
    if (!inputOutput || !Array.isArray(inputOutput.inputs)) return;
    if (!inputOutput.inputs.some(input => input && input.type === 'swap')) return;

    const expandedInputs = [];
    const swapOutputs = [];
    inputOutput._swaps = [];

    inputOutput.inputs.forEach(input => {
        if (!input || input.type !== 'swap') {
            expandedInputs.push(input);
            return;
        }

        const options = input.options || [];
        expandedInputs.push({
            type: 'dropdown',
            id: input.id,
            text: input.text,
            choices: options.map(opt => ({ text: opt.choiceText || opt.text, value: opt.id })),
            initialChoiceIndex: input.initialChoiceIndex,
            notes: input.notes
        });

        options.forEach(opt => {
            const { choiceText, formula, decimals, ...sliderDef } = opt;
            expandedInputs.push({ type: 'slider', ...sliderDef });
            swapOutputs.push({
                id: opt.id,
                text: opt.text,
                type: 'calculation',
                value: `${input.id} == '${opt.id}' ? ${opt.id} : (${formula})`,
                decimals: decimals
            });
        });

        inputOutput._swaps.push({ id: input.id, optionIds: options.map(opt => opt.id) });
    });

    inputOutput.inputs = expandedInputs;
    inputOutput.outputs = [...swapOutputs, ...(inputOutput.outputs || [])];
}

function renderInputOutput(inputOutput) {
    expandSwapInputs(inputOutput);
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

        // Ensure external custom plot scripts are loaded before computation
        await ensureCustomPlotScripts(pageData);

        // Ensure Python calculation engine is initialized if configured
        await ensurePythonEngine(pageData);

        renderInputOutput(pageData.inputOutput);
        setupCalculationEngine(pageData);
        initStickyFloatCards();

        // Auto-initialize CoolProp if available and trigger recalculation
        initCoolProp().then(cp => {
            if (cp && typeof window.forceCompute === 'function') {
                window.forceCompute();
            }
        });
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
