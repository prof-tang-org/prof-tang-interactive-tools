# Topic Page Generation Guide (`renderer.js`)

This guide explains how to create topic-specific JavaScript configuration files (like `me310/10.26-eq.js`) that dynamically render interactive page layouts, equations, input controls, dynamic calculations, and plots using `templates/renderer.js`.

---

## Table of Contents
1. [Overview of the Page Generation Pipeline](#1-overview-of-the-page-generation-pipeline)
2. [Quick Start Boilerplate](#2-quick-start-boilerplate)
3. [`pageData` Property Reference](#3-pagedata-property-reference)
4. [Writing Formulas & Calculations](#4-writing-formulas--calculations)
5. [D3 Plot Configuration (`plots`)](#5-d3-plot-configuration-plots)
6. [Succinct Step-by-Step for Creating a New Page](#6-succinct-step-by-step-for-creating-a-new-page) (Quick Checklist)
7. [Prompting an Agentic AI to Generate pageData](#7-prompting-an-agentic-ai-to-generate-pagedata)

---

## 1. Overview of the Page Generation Pipeline

Rather than creating separate HTML pages for every physics/engineering topic, the project uses a **template-based page generation system**. 

### The Render Cycle:
1. The user visits an HTML skeleton file (e.g., `templates/eq_plot-io.html`) with specific query parameters:
   ```
   /templates/eq_plot-io.html?course=me310&topic=10.26-eq
   ```
2. The HTML skeleton loads [renderer.js](./renderer.js) at the bottom.
3. [renderer.js](./renderer.js) parses the `course` and `topic` parameters and dynamically inserts a `<script>` tag pointing to the topic configuration:
   ```html
   <script src="../me310/10.26-eq.js"></script>
   ```
4. Once loaded, the topic script registers a global `pageData` object.
5. [renderer.js](./renderer.js) processes `pageData` to configure layouts, parse Markdown & LaTeX, bind events to sliders/dropdowns, run calculations, and render D3 plots.

> [!IMPORTANT]
> **Temporary Architecture Notice**
> The dynamic client-side loading method detailed above is a **temporary method**. Once the website is largely finalized, it is recommended to develop a **static page generator (SSG)** to pre-build static HTML pages. Transitioning to a static generation model will allow for cleaner, more professional URLs (e.g. `/me310/hydraulic-jump` instead of parameters) and faster page loading times by eliminating dynamic script injections and DOM building overhead.

---

## 2. Quick Start Boilerplate

Create a `.js` file inside the course directory (e.g., `me310/my-topic.js`). Copy and paste the template below, or duplicate [template.js](./template.js), to get started:

```javascript
/** @type {PageData} */
const pageData = {
    "title": "Pipe Flow & Reynolds Number",
    "layout": {
        "grid": [
            {
                "desktop": "1.2fr 0.8fr",
                "mobile": "100%"
            }
        ],
        "breakpoint": "768px"
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Steady, incompressible fluid flow in a circular pipe",
                "Fully developed flow regime"
            ]
        },
        {
            "type": "equations",
            "content": [
                "Re = \\frac{\\rho V D}{\\mu}",
                "'where the friction factor for laminar flow is:'",
                "f = \\frac{64}{Re}"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$Re$", "definition": "Reynolds number" },
                { "symbol": "$\\rho$", "definition": "density" },
                { "symbol": "$V$", "definition": "velocity" },
                { "symbol": "$D$", "definition": "pipe diameter" },
                { "symbol": "$\\mu$", "definition": "dynamic viscosity" },
                { "symbol": "$f$", "definition": "Darcy friction factor" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/sample-schem.png",
        "alt": "A visual diagram of the sample concept."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "fluid-type",
                "text": "Selected Fluid",
                "value": "Water"
            },
            {
                "id": "roughness-eps",
                "text": "Roughness, $\\varepsilon$ [mm]",
                "type": "calculation",
                "value": "fluid == 'water' ? 0.045 : 0.015",
                "decimals": 3
            }
        ],
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Fluid Type",
                "choices": [
                    { "text": "Water (20°C)", "value": "water" },
                    { "text": "Air (20°C)", "value": "air" }
                ],
                "initialChoiceIndex": 0,
                "notes": "Select fluid to load standard density and viscosity."
            },
            {
                "type": "slider",
                "id": "velocity",
                "text": "Flow Velocity, $V$ [m/s]",
                "min": 0.1,
                "max": 5.0,
                "step": 0.1,
                "initialValue": 1.5,
                "notation": "standard"
            },
            {
                "type": "slider-dropdown",
                "id": "diameter",
                "text": "Pipe Diameter, $D$ [m]",
                "min": 0.01,
                "max": 0.5,
                "step": 0.01,
                "initialValue": 0.05,
                "initialChoiceIndex": 1,
                "choices": [
                    { "text": "Custom...", "value": "custom" },
                    { "text": "DN50 (0.05 m)", "value": "0.05" },
                    { "text": "DN100 (0.10 m)", "value": "0.10" },
                    { "text": "DN200 (0.20 m)", "value": "0.20" }
                ]
            }
        ],
        "outputs": [
            {
                "text": "Density, $\\rho$ [kg/m³]",
                "id": "rho",
                "type": "map",
                "key": "fluid",
                "value": [998.2, 1.204]
            },
            {
                "text": "Dynamic Viscosity, $\\mu$ [Pa·s]",
                "id": "mu",
                "type": "map",
                "key": "fluid",
                "value": [1.002e-3, 1.825e-5]
            },
            {
                "text": "Reynolds Number, $Re$",
                "id": "reynolds",
                "type": "calculation",
                "value": "rho * velocity * diameter / mu",
                "decimals": 0
            },
            {
                "text": "Flow Regime",
                "id": "flow-regime",
                "type": "calculation",
                "value": "reynolds < 2300 ? 'Laminar ($Re < 2300$)' : (reynolds < 4000 ? 'Transitional' : 'Turbulent ($Re > 4000$)')"
            }
        ],
        "outputColumns": 4,
        "dottedRange": {
            "variable": "velocity",
            "min": 0.0,
            "max": 0.05
        }
    },
    "plots": {
        "aspectRatio": 1.2,
        "plotColumns": 2,
        "settings": [
            {
                "x": "velocity",
                "y": "reynolds",
                "xLabel": "$V \\text{ [m/s]}$",
                "yLabel": "$Re$",
                "xMin": 0,
                "xMax": 5.0,
                "xTickInterval": 1.0,
                "yMin": 0,
                "yMax": [300000, 25000],
                "yTickInterval": [50000, 5000],
                "key": "fluid",
                "activeLabel": "$D = {diameter}\\text{ m}$",
                "reference": [
                    {
                        "diameter": 0.10,
                        "text": "DN100 reference",
                        "labelPosition": "above"
                    }
                ]
            },
            {
                "x": "diameter",
                "y": "reynolds",
                "xLabel": "$D \\text{ [m]}$",
                "yLabel": "$Re$",
                "xMin": 0,
                "xMax": 0.5,
                "xTickInterval": 0.1,
                "yMin": 0,
                "yMax": [300000, 25000],
                "yTickInterval": [50000, 5000],
                "key": "fluid",
                "activeLabel": "$V = {velocity}\\text{ m/s}$"
            }
        ],
        "text": "Adjust fluid, velocity, and pipe diameter to examine their effect on the Reynolds number and flow regime."
    }
};
```

---

## 3. `pageData` Property Reference

### `title` (String)
The display title of the interactive tool. Placed inside the header bar `#header-title`.

### `layout` (Object)
Defines how columns are sized dynamically.
* **`grid`** (Array of Objects): Each object corresponds to a `.grid` layout row in the HTML template.
  * `desktop`: CSS template columns string for screen widths above the breakpoint (e.g. `"1.2fr 0.8fr"`).
  * `mobile`: CSS template columns string for screens below the breakpoint (e.g. `"100%"`).
* **`breakpoint`** (String, optional): The screen width threshold for switching to mobile styles (default: `"768px"`).

---

### `equationElements` & `derivationElements` (Arrays of Objects)
An ordered series of blocks rendered inside the equations card.

| Element Type | Required Fields | Description |
| :--- | :--- | :--- |
| **`assumptions`** | `content` (Array) | Renders the assumptions section. Displays header and text on separate lines without a bullet if content contains only 1 item, or as a bulleted list if there are multiple. |
| **`equations`** | `content` (Array) | Renders equation blocks, automatically adding `**Equation**` or `**Equations**` above them. Strings wrapped in single quotes (e.g., `"'where...'"` render as intermediate notes. Velocity must always use capital $V$. |
| **`symbols`** | `content` (Array) | Renders the symbols list with the header `"Symbols"`. Symbol items must be structured: `{ "symbol": "$x$", "definition": "desc" }`. Definitions must **never** contain units. |
| **`header`** | `text` (String) | Renders a level 3 heading (`<h3>`). Supports rich formatting. |
| **`equation`** | `text` (String) | Renders a standalone MathJax display block (`\( equation \)`). Do **not** wrap in `$$` or `$` delimiters. |
| **`note`** | `text` (String or Array) | Renders notes styled with the `.note` class. If an array of strings is passed, each string generates a separate paragraph (`<p>`). |
| **`list`** | `header` (String), `content` (Array) | Renders a custom bulleted list. The header is bolded, and `content` is an array of objects `{ "text": "item text" }` or `{ "symbol": "$x$", "definition": "desc" }`. |
| **`schematic`** | `src` (String), `alt` (String) | Sets a local schematic image URL and alt text. (Equivalent to setting a top-level `schematic` object). |

> [!NOTE]
> **Custom Markdown & LaTeX Parser**
> text values inside `header`, `note`, and `list` items support standard formatting:
> * **Bold**: `**text**` &rarr; `<strong>text</strong>`
> * **Italics**: `*text*` &rarr; `<em>text</em>`
> * **Underline**: `__text__` &rarr; `<u>text</u>`
> * **MathJax Inline**: `$x = y$` &rarr; `\( x = y \)`
> * **MathJax Block**: `$$x = y$$` &rarr; `\[ x = y \]`
>
> *Escaping:* Standard HTML characters (`&`, `<`, `>`) are automatically escaped to prevent syntax breakages.

> [!IMPORTANT]
> **Standard Guidelines for `equationElements`**
> For consistency across all courses and topics, adhere to these standard conventions:
> * **Assumptions:** Always use `type: "assumptions"` rather than custom note/list headers.
> * **Equations:** Always use `type: "equations"` rather than custom note/list headers. Ensure velocity uses capital $V$.
> * **Symbols:** Always use `type: "symbols"` rather than custom `list` headers.
>   * *No Units:* Symbol definitions must **never** contain units (e.g. use "mass", not "mass (kg)" or "mass in kg").
>   * *Structure:* Items must use `{ "symbol": "$x$", "definition": "description" }` to automatically join them with standard spacing and em-dashes (` — `).

---

### `schematic` (Object)
Links an image to be displayed side-by-side with the equations.
* `src`: The path to the image, relative to the templates directory (e.g., `../assets/course/topic.png`).
* `alt`: Descriptive accessibility alt text for the diagram.

---

### `inputOutput` (Object)
The core of the simulation state. Contains variables, constants, interactive inputs, and computed outputs.

#### 1. `fixedInputs` (Array of Objects)
Constants used in math formulas but not editable by the user.
* `id` (String): Unique identifier.
* `text` (String): Label description (supports LaTeX and conditional ternary JS expression strings).
* `value` (Number | String): Constant number or conditional formula string.
* `type` (String, optional): Set to `"calculation"` when `value` evaluates dynamically from other state variables.
* `decimals` (Number | String, optional): Number of decimals or conditional JS expression (e.g. `"fluid == 'water' ? 3 : 2"`).

#### 2. `inputs` (Array of Objects)
Interactive controls rendered inside the `#controls` container.
* `id` (String): Unique identifier. Used directly in calculation formulas.
* `text` (String): Label text (supports inline math/formatting and conditional JS expressions).
* `type` (String): The type of UI control:
  * **`slider`**: A slider synced with a numeric text box. Shows bounds labels under the track.
  * **`number`**: A small standalone numeric input box.
  * **`dropdown`**: A selection menu. Requires a `choices` array of `{ "text": "Label", "value": "val" }` objects. Can include optional `notes` text. Supports custom numeric input when a `"custom"` option is present.
  * **`slider-dropdown`**: A slider combined with a select box next to it. Fully syncs numeric slider input and dropdown choice selections.
* `min` (Number | String): Minimum allowed value (can be a conditional JS expression string).
* `max` (Number | String): Maximum allowed value (can be a conditional JS expression string).
* `step` (Number | String): Tick interval for the slider (can be a conditional JS expression string).
* `initialValue` (Number): Default starting numeric value for `slider`, `number`, `dropdown`, or `slider-dropdown`.
* `choices` (Array of Objects): Preset choices for `dropdown` and `slider-dropdown`.
* `initialChoiceIndex` (Number, optional): Default selected index for `choices` (defaults to 0).
* `notes` (String, optional): Explanatory note displayed directly beneath the dropdown control.
* `notation` (String, optional): `"standard"` | `"scientific"`. Determines how numeric values are formatted and rendered. Defaults to `"standard"`.

#### 3. `outputs` (Array of Objects)
Dynamically updated outputs rendered under `#outputs`.
* `id` (String): Unique identifier. Can be referenced by *subsequent* outputs or plot configs.
* `text` (String): Label description (supports inline math and conditional JS expressions).
* `type` (String):
  * **`calculation`**: Evaluates a mathematical formula based on the current state.
  * **`map`**: Evaluates values based on a dropdown index selection. Requires:
    * `key` (String): The `id` of the dropdown input.
    * `value` (Array): An array of values ordered to match the index of the selected dropdown option.
* `decimals` (Number | String, optional): Decimal precision (integer or conditional JS expression string).
* `display` (String, optional): String template with `{value}` and `{variable_id}` placeholders to format output display.

#### 4. Additional `inputOutput` Options
* **`outputColumns`** (Number, optional): Number of columns to display outputs in a responsive grid (e.g. `3` or `4`).
* **`dottedRange`** (Object | Array of Objects, optional): Configuration to visually gray-out inputs/outputs when an input is within an invalid or non-applicable range:
  ```json
  "dottedRange": {
      "variable": "velocity",
      "min": 0.0,
      "max": 0.05
  }
  ```
* **`note`** (Object, optional): Adds a conceptual note below the outputs card: `{ "text": "Note content..." }`.

---

## 4. Writing Formulas & Calculations

### Formula Parsing Rules:
* All variables are stored in a reactive state map. 
* Calculations are written as standard JavaScript expression strings (e.g., `"volume-1 * temp-2"`).
* **Automatic Math Prefixing**: The engine automatically translates standard math operations to their native JavaScript `Math` object equivalents. You should write `sqrt(...)`, `log(...)`, `pow(...)`, `sin(...)`, `cos(...)`, `tan(...)`, `abs(...)`, `exp(...)`, etc. The renderer converts them to `Math.sqrt(...)`, `Math.log(...)`, etc.
* **Hyphenated Variables**: Variable IDs containing hyphens (e.g., `mass-m` or `pressure-2`) are parsed safely. The renderer sorts keys descending by length to prevent partial-word overlaps and replaces them with `state["var-name"]` queries.
* **Ternary Logic**: Conditional assignments are fully supported. For example:
  ```javascript
  "value": "abs(polytropic-n - 1.0) < 1e-4 ? (isothermal_formula) : (polytropic_formula)"
  ```

### Number Formatting
The renderer handles output printing through `formatNumber`:
* Inaccessible values (e.g., `NaN` or `Infinity`) render as `—`.
* Values where $|x| \ge 10000$ or $|x| < 0.001$ (and $\ne 0$) convert to scientific notation with 2 decimal places (e.g., `4.50e+05`).
* Other values are formatted using `parseFloat(val.toPrecision(4)).toString()`.

---

## 5. D3 Plot Configuration (`plots`)

The `plots` object governs one or more interactive curves rendered in D3.js. Plot settings are defined as a **2D array** where each inner array represents a row of plots in the grid layout.

```javascript
"plots": {
    "aspectRatio": 1.2,              // Width-to-height ratio (W / H) per individual plot (or array of numbers per row: [1.2, 2.0])
    "settings": [
        [                            // Row 1: Two side-by-side plots (50% width each)
            {
                "x": "velocity",                 // Input ID mapped to X-Axis
                "y": "reynolds",                 // State ID (input/output) mapped to Y-Axis
                "width": "50%",                  // Percentage width within the row (defaults to equal share)
                "aspectRatio": 1.2,              // Optional per-plot aspect ratio override
                "xLabel": "$V \\text{ [m/s]}$",  // X-Axis label (supports LaTeX math)
                "yLabel": "$Re$",                // Y-Axis label (supports LaTeX math)
                "xMin": 0,
                "xMax": 5.0,
                "xTickInterval": 1.0,            // Tick step interval along X-Axis
                "yMin": 0,
                "yMax": [300000, 25000],         // Static number, mapped array, or formula string
                "yTickInterval": [50000, 5000],  // Tick step interval along Y-Axis
                "key": "fluid",                  // Connects array bounds to dropdown choice index
                "activeLabel": "$D = {diameter}\\text{ m}$", // Dynamic label at end of active curve
                "reference": [                   // Auxiliary static reference curves
                    {
                        "diameter": 0.10,
                        "text": "DN100 reference",
                        "labelPosition": "above" // "above" | "below"
                    }
                ]
            },
            {
                "x": "diameter",
                "y": "reynolds",
                "width": "50%",
                "xLabel": "$D \\text{ [m]}$",
                "yLabel": "$Re$"
                // ...
            }
        ],
        [                            // Row 2: Single full-width plot (or use {} for an empty placeholder slot)
            {
                "x": "temperature",
                "y": "viscosity",
                "aspectRatio": 2.2           // Wider aspect ratio for full-width row plot
            }
        ]
    ],
    "text": "Plot explanation footer note..."
}
```

### Curve Drawing Details:
* **Resolution**: The engine generates curves by evaluating the function at 100 points between `xMin` and `xMax`.
* **State Syncing**: The current input/output state is rendered as a red circular dot (`circle.dragpt`).
* **Drag-to-Update**: Clicking and dragging the dot horizontally changes the input variable state, updating the sliders, inputs, math equations, and other curves dynamically in real-time.
* **Input-Bounded Styling**: 
  * Points of the curve that lie *between* the input's configured `min` and `max` limits are rendered as a **solid line** (accessible range).
  * Points outside those bounds (but within the plot boundaries) are rendered as a **dashed line** (inaccessible/theoretical range).
* **Dotted Range**: Set `dottedMin` and/or `dottedMax` on the plot setting to display theoretical/impossible regions along the X-axis as dotted lines.
* **Tick Customization**:
  * Rotate tick labels using `xTickRotation` or `yTickRotation` (integer angle in degrees, e.g. `45`).
  * Force exponential scientific notation on axes using `xExponential: true` or `yExponential: true`.
* **Dynamic Y-Scaling**:
  * You can pass an array of numbers to `yMax` and `yTickInterval` (e.g., `yMax: [50, 100]`), optionally tied to a dropdown using `"key": "dropdown_id"`.
  * If no `key` is supplied, the engine evaluates the current Y-axis point and snaps the scale boundaries to the matching limit index in the array to accommodate large changes in value.
  * You can also supply a JS formula string (e.g., `"(5 / nu) < 5e5 ? 5e5 : 5e6"`).
* **Crash Prevention**: Always ensure `yTickInterval` is sufficiently large so that `(yMax - yMin) / yTickInterval` does not exceed ~200, preventing browser stalls or crashes.

---

## 6. Succinct Step-by-Step for Creating a New Page

For a fast, error-free workflow, follow these steps to add a new interactive topic:

1. **Pick the Template**: Determine if your topic needs derivations, equations, and/or plots. Choose the appropriate skeleton HTML in the `templates/` folder (e.g. `eq_plot-io.html`).
2. **Create the Script File**: Create a new `.js` file in the course subdirectory, naming it according to the topic index (e.g., `me310/10.27-eq.js`).
3. **Insert Boilerplate**: Copy the skeleton code from the [Quick Start Boilerplate](#2-quick-start-boilerplate) section and paste it into your new file.
4. **Customize Metadata**: Change the `title` and set up the column sizes under `layout.grid`.
5. **Populate Equations**: Fill out `equationElements` with standard JSON configurations (headers, notes, lists, equations). Use standard LaTeX inside `$` or `$$` for automatic translation.
6. **Define Inputs & Constants**: Specify constants under `fixedInputs` and sliders/dropdowns under `inputs`.
7. **Write Math Expressions**: Add output fields under `outputs` and write standard JavaScript math expressions (e.g., `mass * R * temp`). Keep names synced with your input/fixed IDs.
8. **Configure Plots (D3)**: If using plots, set mapping IDs, titles, tick intervals, and bounds under `plots.settings`.
9. **Test locally**: Load your page using the `?course=meXXX&topic=YYY` query parameters on your local server to verify interactivity.

## 7. Prompting an Agentic AI to Generate `pageData`

When utilizing an agentic AI coding assistant to create these topic files, you can get highly accurate results on the first try by providing a structured prompt. By following the prompt blueprint below, the assistant will have all necessary constraints and context, even without access to a repository-specific `.skills` folder or external rule files.

> [!WARNING]
> **Take Care with Editing Core Engine Files**
> Tell the AI assistant it must NOT modify `templates/renderer.js` or `templates/temp-styles.css` unless explicit approval or direct instruction to edit them was given.

### Prompt Blueprint
Copy and customize this template when prompting an AI assistant:

```markdown
Please generate a topic configuration file `meXXX/YYY-eq.js` defining a global `pageData` object using the schema in `templates/README.md`. 

This page should use the template: `templates/[template_name].html` (Choose from: `eq_plot-io.html`, `eq_deriv-schem-io-plot.html`, or `eq_deriv-schem-io_wide-plot.html`).

Here are the specifications for the topic:
- **Title**: "[Insert Topic Title]"
- **Course**: "meXXX"
- **Equations to show**:
  * [Equation 1 as LaTeX]
  * [Equation 2 as LaTeX]
- **Variable definitions**:
  * [Variable 1 symbol] - [Description]
  * [Variable 2 symbol] - [Description]
- **Schematic**:
  * Path: "../assets/meXXX/YYY-eq.png"
  * Alt: "[Descriptive alt text]"
- **Inputs**:
  * [Input 1 ID]: "[Input 1 Name]" (Slider from [Min] to [Max], step [Step], initial [Value], notation: [standard/scientific])
  * [Input 2 ID]: "[Input 2 Name]" (Dropdown with options: [Option 1], [Option 2], with notes: "[Helper note text]")
- **Fixed Constants**:
  * [Constant ID]: "[Constant Name]" = [Value] (decimals: [Decimals value or conditional expression], type: [optional 'calculation'])
- **Outputs & Formulas**:
  * [Output 1 ID]: [Formula]
  * [Output 2 ID]: [Formula]
- **Plots**:
  * Plot 1: [Y-axis variable ID] vs [X-axis variable ID], bounds X:[Min, Max], Y:[Min, Max], tick interval [Value].
  * Note below plot: "[Text]"

Guidelines for the AI:

### 1. Reference & Structure
- Reference the existing topic file `me310/10.26-eq.js` as a structural reference.
- Explicitly import type definitions by placing `/** @type {PageData} */` right above the `pageData` declaration to enable IDE auto-completion and typing.

### 2. Equation Card Layout (`equationElements` & `derivationElements`)
- Support element layout types: `'header'`, `'equation'`, `'note'`, `'list'`, `'assumptions'`, `'equations'`, `'symbols'`, and `'schematic'`.
- Content formatting:
  - **Bold**: `**text**` &rarr; `<strong>`
  - **Italics**: `*text*` &rarr; `<em>`
  - **Underline**: `__text__` &rarr; `<u>`
  - **MathJax Inline**: `$x = y$` &rarr; `\( x = y \)`
  - **MathJax Block**: `$$x = y$$` &rarr; `\[ x = y \]`
  - A `'note'` block can accept an array of strings representing separate paragraphs.
- **Assumptions**: Use `type: "assumptions"`.
  - *Single assumption:* Place the description in a single-item array under `content` (e.g. `["One-dimensional open channel flow"]`). This renders the header and text on separate lines without a bullet.
  - *Multiple assumptions:* Place them as multiple strings in the `content` array to render them as a bulleted list.
- **Equations**: Place equations inside `type: "equations"`. The renderer automatically injects the note header (`**Equation**` or `**Equations**` depending on the count). Do not manually wrap equations in `$$` or `$`. If you need explanatory text/note *between* equations in the list, wrap that string in single quotes (e.g., `["c = \\sqrt{gy}", "'where the depth is:'", "y = \\text{depth}"]`).
- **Symbols**: Define symbols using `type: "symbols"`. Each item in `content` must have `symbol` (LaTeX math, e.g. `"$x$"`) and `definition` (description string).
  - *CRITICAL:* Symbol definitions must **never** contain units (e.g., use "mass", not "mass (kg)" or "mass in kg").

### 3. Inputs & Outputs (`inputOutput` config)
- **Fixed Inputs (`fixedInputs`)**: Represents read-only constant values in calculations.
  - Fields: `id`, `text`, `value` (can be a constant number or a formula string).
  - Optional fields: `type: "calculation"`, and `decimals` (integer number or conditional JS expression string, e.g., `"conversion-factor == 1.0 ? 3 : 2"`).
- **Interactive Controls (`inputs`)**:
  - Support four types: `slider`, `number`, `dropdown`, and `slider-dropdown` (combines slider and dropdown next to each other).
  - Fields: `type`, `id`, `text` (supports MathJax).
  - Slider/Number fields: `min`, `max`, `step` (can be numbers or conditional JS expression strings, e.g. `"fluid == 'water' ? 0.1 : 0.5"`), `initialValue`.
  - Dropdown/Slider-dropdown fields: `choices` (array of `{ "text": "Label", "value": "val" }`), `initialChoiceIndex`, and optional `notes` rendered under the control.
  - Custom user input: Add a choice with value `"custom"` to expose an editable numeric input box.
  - Optional `notation`: `"standard" | "scientific"` (defaults to `"standard"`).
- **Computed Outputs (`outputs`)**:
  - `type: "calculation"`: mathematical formulas must be standard JS expression strings (e.g., `"rho * U * x / mu"`). Common math functions like `pow`, `sqrt`, `exp`, `log`, `sin`, `cos`, `tan`, `abs` should be written as plain strings; the renderer will automatically prepend `Math.`.
  - `type: "map"`: evaluates a value from an array based on dropdown index selection. Requires `key` (dropdown ID) and `value` (array of values ordered to match the dropdown choices).
  - Optional fields: `decimals` (integer or conditional JS expression string).
- **Layout and Notes**:
  - Customize output columns layout using `outputColumns` (e.g. `3`).
  - Add a conceptual simulation note using `note: { text: "..." }`.
  - Highlight/gray-out ranges: Add `dottedRange` (object or array of objects: `{ "variable": "input_id", "min": 0, "max": 0.5 }`) to specify ranges where inputs/outputs are greyed out.

### 4. Interactive Plotting (`plots` config)
- **Aspect Ratio**: Set using `aspectRatio` (width-to-height ratio $W / H$ of each individual plot, defaults to `1.5`). The total SVG canvas height is automatically calculated based on row count, plot heights, margins, and gaps.
- **Plot Columns**: Set using `plotColumns` (number of columns per row for multi-plot layouts, e.g. `"plotColumns": 2`). Defaults to the total number of plots (single row).
- **Curve Bounds (`xMin`, `xMax`, `yMin`, `yMax`, `yTickInterval`, `xTickInterval`)**:
  - Must specify `x` (must be input ID) and `y` (input or output ID), `xLabel`, and `yLabel`.
  - `xMin`, `xMax`, `xTickInterval` can be numbers or conditional JS expressions.
  - `yMin` must be a number.
  - `yMax` and `yTickInterval` can be numbers, arrays, or JS formula strings (e.g., `"yMax": "(5 / kinematic-viscosity) < 5e5 ? 5e5 : 5e6"`).
  - Connect array bounds to a dropdown choices index using `key` (dropdown ID).
- **Crash Prevention**: Ensure `yTickInterval` is large enough so that `(yMax - yMin) / yTickInterval` is not excessively high. If the ratio exceeds 200, the browser can freeze/crash.
- **Tick Properties**:
  - Rotate tick labels using `xTickRotation` / `yTickRotation` (integer angle).
  - Format tick labels in exponential form using `xExponential: true` / `yExponential: true`.
- **Dotted Range**: Add `dottedMin` / `dottedMax` bounds along the X-axis to display theoretical/impossible regions as dotted lines.
- **Curve Annotations**:
  - `activeLabel`: Text label format rendered at the end of the active curve (supports MathJax and `{input_id}` placeholders, e.g. `"$n = {polytropic-n}$"`).
  - `reference`: Array of static auxiliary reference curves. Each item maps input IDs to target values (e.g. `"U": 1.0`), alongside a `text` label and optional `labelPosition` (`"above" | "below"`).

### 5. Wide Layout Guidelines (`io_wide` template)
- Balance desktop column widths for inputs and outputs in `layout.grid` (e.g. `"desktop": "2fr 1fr"`).

### 6. Artifact Formatting Constraints
- **CRITICAL:** Do NOT use LaTeX math formatting (such as `$`, `\frac`, or symbols) in markdown implementation plans, task lists, or walkthrough files/artifacts. The markdown preview environment does not compile them. Write all formulas and math in these markdown artifacts in **plain text / unicode** (e.g. `h_L = f * (l / D) * (V^2 / 2g)`).

### 7. Engine Modification Constraints
- Do NOT modify `templates/renderer.js` or `templates/temp-styles.css` under any circumstances unless explicitly instructed.

### 8. Verification & Local Testing
- Ask for permission/confirmation before running the page validation using the `browser_subagent` tool.
- If the required page template is not specified, prompt for clarification before starting.
- Test local pages using `http://127.0.0.1:5500/` as the host (e.g., `http://127.0.0.1:5500/templates/[template_name].html?course=meXXX&topic=YYY-eq`) since Live Server runs on port 5500. Do not use `localhost:8000` or `localhost`.
```
