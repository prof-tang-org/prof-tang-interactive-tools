/**
 * @file typedefs.js
 * @description JSDoc Type Definitions for pageData configuration objects.
 * Use these definitions by placing `/** @type {PageData} *\/` right above the `pageData` declaration in topic files.
 */

/**
 * @typedef {Object} GridConfig
 * @property {string} [desktop] - Grid template columns representation for desktop screens (e.g. "1.2fr 0.8fr")
 * @property {string} [mobile] - Grid template columns representation for mobile screens (e.g. "100%")
 */

/**
 * @typedef {Object} LayoutConfig
 * @property {GridConfig[]} grid - Array of grid configurations for individual sections
 * @property {string} [breakpoint] - Width breakpoint below which layout falls back to mobile (e.g. "768px")
 */

/**
 * @typedef {Object} ListContentItem
 * @property {string} text - Item text, supports markdown and inline MathJax (e.g., "$Fr$ — Froude number")
 */

/**
 * @typedef {Object} EquationElement
 * @property {'header' | 'equation' | 'note' | 'list' | 'schematic'} type - Element layout component type
 * @property {string | string[]} [text] - Content text (supports markdown/MathJax). For 'note' type, can also be an array of strings representing paragraph lines.
 * @property {string} [header] - Header label (specific to 'list' type)
 * @property {ListContentItem[]} [content] - Sub-items/list content (specific to 'list' type)
 * @property {string} [src] - Image path (specific to 'schematic' type)
 * @property {string} [alt] - Image alternative description (specific to 'schematic' type)
 */

/**
 * @typedef {Object} SchematicConfig
 * @property {string} src - Relative path to the schematic image (e.g. "../assets/me310/10.26-eq.png")
 * @property {string} alt - Alternative text description for accessibility
 */

/**
 * @typedef {Object} FixedInput
 * @property {string} id - Unique identifier for the fixed input parameter
 * @property {string} text - Display text / label of the input (supports MathJax)
 * @property {number} value - The constant numeric value
 */

/**
 * @typedef {Object} DropdownChoice
 * @property {string} text - User-facing label in the dropdown menu
 * @property {string | number} value - The parameter value when selected. Use "custom" to expose a custom numeric input.
 */

/**
 * @typedef {Object} InputConfig
 * @property {'slider' | 'number' | 'dropdown' | 'slider-dropdown'} type - Type of input control
 * @property {string} id - Unique identifier used in equations and plots
 * @property {string} [text] - Label for the input control (supports MathJax)
 * @property {number | string} [min] - Minimum boundary value or JS conditional expression (e.g. 0.1, or "conversion-factor == 1.0 ? 5.0 : 15.0")
 * @property {number | string} [max] - Maximum boundary value or JS conditional expression
 * @property {number | string} [step] - Value step interval or JS conditional expression
 * @property {number} [initialValue] - Default starting value for the input (for slider, number, dropdown, and slider-dropdown)
 * @property {DropdownChoice[]} [choices] - Array of options (for dropdown and slider-dropdown)
 * @property {number} [initialChoiceIndex] - Index of the initial selected choice (for dropdown and slider-dropdown)
 * @property {string} [notes] - Small descriptive notes rendered under the control (for dropdown and slider-dropdown)
 */

/**
 * @typedef {Object} OutputConfig
 * @property {string} text - Output display label (supports MathJax)
 * @property {string} id - Unique output identifier
 * @property {'calculation' | 'map'} type - Mode of evaluation
 * @property {string | Array<number | string>} value - Mathematical formula string (for 'calculation') or index-based map values array (for 'map')
 * @property {string} [key] - Reference ID of the input dropdown parameter used for indexing map arrays (required for 'map' type)
 */

/**
 * @typedef {Object} DottedRangeConfig
 * @property {string} variable - ID of the input variable to monitor
 * @property {number | string} min - Lower boundary of the grayed/dotted range
 * @property {number | string} max - Upper boundary of the grayed/dotted range
 */

/**
 * @typedef {Object} InputOutputConfig
 * @property {FixedInput[]} [fixedInputs] - Read-only constant values in calculations
 * @property {InputConfig[]} inputs - Interactive control parameters
 * @property {OutputConfig[]} outputs - Computed outcomes
 * @property {number} [outputColumns] - Columns for grid-rendering of the outputs (e.g., 3)
 * @property {{ text: string }} [note] - Optional conceptual note describing the simulation
 * @property {DottedRangeConfig | DottedRangeConfig[]} [dottedRange] - Configuration for range where inputs and outputs are grayed out
 */

/**
 * @typedef {Object.<string, any>} ReferenceSetting
 * @description Key-value mapping of input IDs to target values for plotting static reference curves (e.g. polytropic-n: 1.4), alongside an optional text label.
 * @property {string} [text] - Label indicating the parameters of the reference curve (supports MathJax, e.g. "$n = 1.4$")
 */

/**
 * @typedef {Object} PlotSetting
 * @property {string} x - Unique ID of the variable to plot on the X-axis (must be an input parameter)
 * @property {string} y - Unique ID of the variable to plot on the Y-axis (can be an input or output parameter)
 * @property {string} xLabel - Label for the X-axis (supports MathJax)
 * @property {string} yLabel - Label for the Y-axis (supports MathJax)
 * @property {number | string} xMin - X-axis lower boundary (number or JS conditional expression)
 * @property {number | string} xMax - X-axis upper boundary (number or JS conditional expression)
 * @property {number} yMin - Y-axis lower boundary
 * @property {number | number[]} yMax - Y-axis upper boundary (number, or array of numbers for dynamic scaling options depending on curve values)
 * @property {number | string | number[]} [xTickInterval] - Tick spacing on the X-axis (supports formulas and arrays)
 * @property {number | number[]} [yTickInterval] - Tick spacing on the Y-axis (supports arrays)
 * @property {number} [xTickRotation] - Angle of rotation for X-axis tick labels (e.g. 45)
 * @property {number} [yTickRotation] - Angle of rotation for Y-axis tick labels (e.g. 45)
 * @property {number} [dottedMin] - Start boundary of dotted range along the X-axis (useful for showing physically impossible regions)
 * @property {number} [dottedMax] - End boundary of dotted range along the X-axis
 * @property {string} [activeLabel] - Optional text label format rendered at the end of the active curve (supports MathJax and `{input_id}` placeholders, e.g. "$n = {polytropic-n}$")
 */

/**
 * @typedef {Object} PlotsConfig
 * @property {number} [aspectRatio] - Width-to-height ratio of the SVG plot wrapper
 * @property {ReferenceSetting[]} [reference-settings] - Configurations for auxiliary static reference curves
 * @property {PlotSetting[]} settings - List of active interactive charts to plot side-by-side
 * @property {string} text - Instructive annotation text shown below the chart container
 */

/**
 * @typedef {Object} PageData
 * @property {string} title - The title of the interactive simulation page
 * @property {LayoutConfig} [layout] - Layout grid and breakpoint details
 * @property {EquationElement[]} equationElements - HTML-renderable equation cards, symbols list, notes, and header descriptions
 * @property {EquationElement[]} [derivationElements] - Additional steps or notes rendered under the derivation section
 * @property {SchematicConfig} [schematic] - Page-level configuration for the system schematic diagram
 * @property {InputOutputConfig} inputOutput - Configuration for user inputs, fixed inputs, and outputs
 * @property {PlotsConfig} [plots] - Chart settings, reference curves, and plots annotations
 */
