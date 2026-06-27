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
1. The user visits an HTML skeleton file (e.g., `templates/eq_schem_plot-io.html`) with specific query parameters:
   ```
   /templates/eq_schem_plot-io.html?course=me310&topic=10.26-eq
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

Create a `.js` file inside the course directory (e.g., `me200/my-topic.js`). Copy and paste the template below, or duplicate [template.js](./template.js), to get started:

```javascript
const pageData = {
    "title": "Sample Topic Name",
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
            "type": "header",
            "text": "Core Concept Header"
        },
        {
            "type": "note",
            "text": "This is a note explaining that **bold**, *italics*, and __underlines__ are supported."
        },
        {
            "type": "equation",
            "text": "E = m c^2"
        },
        {
            "type": "list",
            "header": "Variable Definitions",
            "content": [
                { "text": "$E$ — energy (J)" },
                { "text": "$m$ — mass (kg)" },
                { "text": "$c$ — speed of light ($3 \\times 10^8$ m/s)" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me200/sample-schem.png",
        "alt": "A visual diagram of the sample concept."
    },
    "inputOutput": {
        "fixedInputs": [
            {
                "id": "constant-c",
                "text": "Speed of Light c (m/s)",
                "value": 299792458
            }
        ],
        "inputs": [
            {
                "type": "slider",
                "id": "mass-m",
                "text": "Mass (m) in kg",
                "min": 0,
                "max": 10,
                "initialValue": 1,
                "step": 0.1
            }
        ],
        "outputs": [
            {
                "text": "Energy E (Joules)",
                "id": "energy-E",
                "type": "calculation",
                "value": "mass-m * constant-c * constant-c"
            }
        ]
    },
    "plots": {
        "settings": [
            {
                "x": "mass-m",
                "y": "energy-E",
                "xLabel": "Mass m (kg)",
                "yLabel": "Energy E (J)",
                "xMin": 0,
                "xMax": 10,
                "yMin": 0,
                "yMax": 9e17,
                "yTickInterval": 1.5e17
            }
        ],
        "text": "Drag the slider or the point on the plot to dynamically update the energy calculation."
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
| **`header`** | `text` (String) | Renders a level 3 heading (`<h3>`). Supports rich formatting. |
| **`equation`** | `text` (String) | Renders a MathJax display block (`\( equation \)`). Do **not** wrap in `$$` or `$` delimiters. |
| **`note`** | `text` (String or Array) | Renders notes styled with the `.note` class. If an array of strings is passed, each string generates a separate paragraph (`<p>`). |
| **`list`** | `header` (String), `content` (Array) | Renders a bulleted list. The header is bolded, and the `content` is an array of objects of the form `{ "text": "item text" }`. |
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
* `text` (String): Label description.
* `value` (Number): Value.

#### 2. `inputs` (Array of Objects)
Interactive controls rendered inside the `#controls` container.
* `id` (String): Unique identifier. Used directly in calculation formulas.
* `text` (String): Label text (supports inline math/formatting).
* `type` (String): The type of UI control:
  * **`slider`**: A slider synced with a numeric text box. Shows bounds labels under the track.
  * **`number`**: A small standalone numeric input box.
  * **`dropdown`**: A selection menu. Requires a `choices` array of `{ "text": "Label", "value": "val" }` objects. Can include optional `notes` text.
  * **`slider-dropdown`**: A slider combined with a select box next to it (e.g. for choosing units).
* `min` (Number): Minimum allowed value.
* `max` (Number): Maximum allowed value.
* `step` (Number): Tick interval for the slider.
* `initialValue` (Number): Default starting value.

#### 3. `outputs` (Array of Objects)
Dynamically updated outputs rendered under `#outputs`.
* `id` (String): Unique identifier. Can be referenced by *subsequent* outputs or plot configs.
* `text` (String): Label description.
* `type` (String):
  * **`calculation`**: Evaluates a mathematical formula based on the current state.
  * **`map`**: Evaluates values based on a dropdown index selection. Requires:
    * `key` (String): The `id` of the dropdown input.
    * `value` (Array): An array of values ordered to match the index of the selected dropdown option.

---

## 4. Writing Formulas & Calculations

### Formula Parsing Rules:
* All variables are stored in a reactive state map. 
* Calculations are written as standard JavaScript expression strings (e.g., `"volume-1 * temp-2"`).
* **Automatic Math Prefixing**: The engine automatically translates standard math operations to their native JavaScript `Math` object equivalents. You should write `sqrt(...)`, `log(...)`, `pow(...)`, `sin(...)`, etc. The renderer converts them to `Math.sqrt(...)`, `Math.log(...)`, etc.
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

The `plots` object governs one or more side-by-side curves rendered in D3.js.

```javascript
"plots": {
    "settings": [
        {
            "x": "mass-m",            // Input ID mapped to X-Axis
            "y": "energy-E",          // State ID mapped to Y-Axis
            "xLabel": "Mass (kg)",
            "yLabel": "Energy (J)",
            "xMin": 0,
            "xMax": 10,
            "yMin": 0,
            "yMax": 9e17,
            "yTickInterval": 1e17
        }
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
* **Dynamic Y-Scaling**:
  * You can pass an array of numbers to `yMax` and `yTickInterval` (e.g., `yMax: [50, 100]`).
  * The engine will evaluate the current Y-axis point and snap the scale boundaries to the matching limit index in the array to accommodate large changes in value.

---

## 6. Succinct Step-by-Step for Creating a New Page

For a fast, error-free workflow, follow these steps to add a new interactive topic:

1. **Pick the Template**: Determine if your topic needs derivations, equations, and/or plots. Choose the appropriate skeleton HTML in the `templates/` folder (e.g. `eq_schem_plot-io.html`).
2. **Create the Script File**: Create a new `.js` file in the course subdirectory, naming it according to the topic index (e.g., `me310/10.27-eq.js`).
3. **Insert Boilerplate**: Copy the skeleton code from the [Quick Start Boilerplate](#2-quick-start-boilerplate) section and paste it into your new file.
4. **Customize Metadata**: Change the `title` and set up the column sizes under `layout.grid`.
5. **Populate Equations**: Fill out `equationElements` with standard JSON configurations (headers, notes, lists, equations). Use standard LaTeX inside `$` or `$$` for automatic translation.
6. **Define Inputs & Constants**: Specify constants under `fixedInputs` and sliders/dropdowns under `inputs`.
7. **Write Math Expressions**: Add output fields under `outputs` and write standard JavaScript math expressions (e.g., `mass * R * temp`). Keep names synced with your input/fixed IDs.
8. **Configure Plots (D3)**: If using plots, set mapping IDs, titles, tick intervals, and bounds under `plots.settings`.
9. **Test locally**: Load your page using the `?course=meXXX&topic=YYY` query parameters on your local server to verify interactivity.

---

## 7. Prompting an Agentic AI to Generate `pageData`

When utilizing an agentic AI coding assistant to create these topic files, you can get highly accurate results on the first try by providing a structured prompt. 

> [!WARNING]
> **Take Care with Editing Core Engine Files**
> Tell the AI assistant it must NOT modify `templates/renderer.js` or `templates/temp-styles.css` unless explicit approval or direct instruction to edit them was given.

### Prompt Blueprint
Copy and customize this template when prompting an AI assistant:

```markdown
Please generate a topic configuration file `meXXX/YYY-eq.js` defining a global `pageData` object using the schema in `templates/README.md`. 

This page should use the template: `templates/[template_name].html` (Choose from: `eq_schem_plot-io.html`, `eq_deriv-schem-io-plot.html`, or `eq_deriv-schem-io_wide-plot.html`).

Here are the specifications for the topic:
- **Title**: "[Insert Topic Title]"
- **Course**: "meXXX"
- **Equations to show**:
  * [Equation 1 as LaTeX] (e.g., $$T_2 = T_1 (p_2 / p_1)^{(n-1)/n}$$)
  * [Equation 2 as LaTeX]
- **Variable definitions**:
  * [Variable 1 symbol] - [Description] (e.g., T_1 - inlet temperature)
  * [Variable 2 symbol] - [Description] (e.g., p_1 - inlet pressure)
- **Schematic**:
  * Path: "../assets/meXXX/YYY-eq.png"
  * Alt: "[Descriptive alt text]"
- **Inputs**:
  * [Input 1 ID]: "[Input 1 Name]" (Slider from [Min] to [Max], step [Step], initial [Value])
  * [Input 2 ID]: "[Input 2 Name]" (Dropdown with options: [Option 1], [Option 2])
- **Fixed Constants**:
  * [Constant ID]: "[Constant Name]" = [Value]
- **Outputs & Formulas**:
  * [Output 1 ID]: [Formula] (e.g., `volume = (R * temp) / pressure`)
  * [Output 2 ID]: [Formula]
- **Plots**:
  * Plot 1: [Y-axis variable ID] vs [X-axis variable ID], bounds X:[Min, Max], Y:[Min, Max], tick interval [Value].
  * Note below plot: "[Text]"

Guidelines for the AI:
1. Reference the existing topic file `me310/10.26-eq.js` as a structural reference.
2. Ensure math functions in the output calculations (like sqrt, sin, pow, abs) are written as simple strings; the renderer will automatically prepend `Math.`.
3. Wrap hyphenated variable IDs properly if using ternary logic (e.g., `abs(polytropic-n - 1) < 1e-4`).
4. Ensure all notes, list items, and headers use proper LaTeX notation wrapping (single `$` for inline, double `$$` for blocks) so MathJax parses them correctly.
5. Do NOT modify `templates/renderer.js` or `templates/temp-styles.css` unless explicit approval has been given.
6. Print out the local test link/URL for this page (e.g., `/templates/[template_name].html?course=meXXX&topic=YYY-eq`).
```
