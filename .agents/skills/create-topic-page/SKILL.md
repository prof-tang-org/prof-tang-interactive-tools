---
name: create-topic-page
description: Instructions for creating a new interactive topic page config or modifying a physics/fluid mechanics equation dataset (pageData)
---

# Creating and Modifying Topic Pages (pageData)

This skill provides the structure, rules, schemas, and templates for creating and modifying interactive physics/fluid mechanics pages in this repository.

## 1. Schema & Context
Every topic is defined in a JavaScript file (e.g., `me310/reynolds-number.js`) that sets up a `pageData` object:
```javascript
/** @type {PageData} */
const pageData = {
    // configuration
};
```
This is dynamically consumed by [templates/renderer.js](file:///d:/Documents/thermofluidlearn/prof-tang-interactive-tools/templates/renderer.js) via the main topic pages.

---

## 2. Topic Element Guidelines (AGENTS.md compliance)

### Assumptions
* Use `type: "assumptions"`
* **Single assumption**: Use a single-string array. This renders a header and description on separate lines without bullets:
  ```json
  {
      "type": "assumptions",
      "content": [
          "One-dimensional open channel flow"
      ]
  }
  ```
* **Multiple assumptions**: Use multiple strings. This renders them as a bulleted list:
  ```json
  {
      "type": "assumptions",
      "content": [
          "Steady-state",
          "Negligible gravity effects"
      ]
  }
  ```

### Equations
* Use `type: "equations"`. The note headers (`**Equation**` or `**Equations**`) are automatically prepended based on equation count.
* If you need explanatory text *between* equations, wrap it in single quotes:
  ```json
  {
      "type": "equations",
      "content": [
          "Re_x = \\frac{\\rho U x}{\\mu}",
          "'where the local velocity is calculated at distance $x$ from the leading edge:'",
          "U_x = U"
      ]
  }
  ```

### Symbols
* Use `type: "symbols"`.
* Each item under `content` must have `symbol` (LaTeX math) and `definition` (description string).
* **CRITICAL**: Definitions must **never** contain units. Do NOT write `velocity (m/s)` or `velocity in m/s`. Write `velocity` only.
  ```json
  {
      "type": "symbols",
      "content": [
          { "symbol": "$x$", "definition": "position" },
          { "symbol": "$v$", "definition": "velocity" }
      ]
  }
  ```

---

## 3. Inputs & Outputs (`inputOutput`)
The `inputOutput` section coordinates interactive values, dynamic formulas, and static mappings.

### Inputs
* **Slider**: A basic range input.
  ```json
  {
      "type": "slider",
      "id": "U",
      "text": "Upstream Velocity, $U$ [m/s]",
      "min": 0.2,
      "max": 5.0,
      "initialValue": 1.0,
      "step": 0.1
  }
  ```
* **Dropdown**: Maps choice selection index to other variables.
  ```json
  {
      "type": "dropdown",
      "id": "fluid",
      "text": "Fluid Type",
      "choices": [
          { "text": "Water", "value": "water" },
          { "text": "Air", "value": "air" }
      ],
      "initialChoiceIndex": 0
  }
  ```

### Outputs
* **Map**: Selects a value from an array based on a dropdown's selected index.
  ```json
  {
      "text": "Fluid Density, $\\rho$ [kg/m³]",
      "id": "rho",
      "type": "map",
      "value": [998.2, 1.204],
      "key": "fluid"
  }
  ```
* **Calculation**: Dynamically evaluates a mathematical formula.
  * Supported math functions: `pow`, `sqrt`, `exp`, `log`, `sin`, `cos`, `tan`, `abs`.
  * Formulas must reference input/output IDs (e.g. `U * x / nu`).
  ```json
  {
      "text": "Reynolds Number, $Re_x$",
      "id": "reynolds",
      "type": "calculation",
      "value": "rho * U * x / mu"
  }
  ```

---

## 4. Plot Settings (`plots`)
The plots display interactive curves. 

* **Active Plot Curves**: The X-axis (`x`) must reference an input ID. The Y-axis (`y`) can reference an input or output ID.
* **Dynamic Bounds (`yMax`, `yMin`, `yTickInterval`)**:
  * Can be static numbers (e.g., `"yMin": 0`).
  * Can be arrays mapped to dropdown index (e.g., `"yMax": [6, 20]`, `"key": "fluid"`).
  * Can be dynamic JS formula strings (e.g., `"yMax": "(5 / kinematic-viscosity) < 5e5 ? 5e5 : 5e6"`).
* **Crash Prevention Guardrail**: Always check that `yTickInterval` or calculated intervals are large enough. If `(yMax - yMin) / yTickInterval > 200`, the browser will drop tick values or crash! Ensure the values prevent infinite/excessive tick generation.
* **Reference Curves**: ONLY add static reference curves if they are explicitly requested in the user's prompt (e.g., "$U = 1\text{ m/s}$"). Do not assume or add them by default.
  ```json
  "reference": [
      {
          "U": 1.0,
          "text": "$U = 1\\text{ m/s}$",
          "labelPosition": "above"
      }
  ]
  ```

---

## 5. Complete Template Reference

Use this skeleton when creating a brand new topic file:

```javascript
/** @type {PageData} */
const pageData = {
    "title": "Topic Title Here",
    "layout": {
        "grid": [
            { "desktop": "1.2fr 0.8fr", "mobile": "100%" },
            { "desktop": "0.8fr 1.2fr", "mobile": "100%" }
        ]
    },
    "equationElements": [
        {
            "type": "assumptions",
            "content": [
                "Assumption 1",
                "Assumption 2"
            ]
        },
        {
            "type": "equations",
            "content": [
                "y = m x + b",
                "'where the parameters are defined as:'"
            ]
        },
        {
            "type": "symbols",
            "content": [
                { "symbol": "$y$", "definition": "dependent variable" },
                { "symbol": "$x$", "definition": "independent variable" }
            ]
        }
    ],
    "schematic": {
        "src": "../assets/me310/topic-schem.png",
        "alt": "Alt description of schematic"
    },
    "inputOutput": {
        "inputs": [
            {
                "type": "dropdown",
                "id": "fluid",
                "text": "Fluid Type",
                "choices": [
                    { "text": "Water", "value": "water" },
                    { "text": "Air", "value": "air" }
                ],
                "initialChoiceIndex": 0
            },
            {
                "type": "slider",
                "id": "x",
                "text": "Distance, $x$ [m]",
                "min": 0,
                "max": 1,
                "initialValue": 0.5,
                "step": 0.05
            }
        ],
        "outputs": [
            {
                "text": "Density, $\\rho$ [kg/m³]",
                "id": "rho",
                "type": "map",
                "value": [998.2, 1.204],
                "key": "fluid"
            },
            {
                "text": "Calculation Result, $R$",
                "id": "R",
                "type": "calculation",
                "value": "rho * x * 2"
            }
        ],
        "outputColumns": 3
    },
    "plots": {
        "aspectRatio": 1.5,
        "settings": [
            {
                "x": "x",
                "y": "R",
                "xLabel": "$x \\text{ [m]}$",
                "yLabel": "$R \\text{ [units]}$",
                "xMin": 0,
                "xMax": 1,
                "yMin": 0,
                "yMax": [2000, 3],
                "yTickInterval": [400, 0.5],
                "key": "fluid"
            }
        ],
        "text": "Interactive plot instruction text here."
    }
};
```

---

## 6. Verification and Workflow Guidelines

### A. Template Prompting
* If the user asks to create or modify a page but does **not** specify which template HTML to use (e.g. `eq_deriv-schem-io-plot.html`, `eq_schem_plot-io.html`, etc.), you must **prompt the user** to clarify and select/specify the template before defining the implementation plan.

### B. Math in Artifacts (Readability)
* Always render mathematical equations, ranges, and formulas in **plain text / unicode** (e.g. `h_L = f * (l / D) * (V^2 / 2g)`) inside implementation plans, task checklists, and walkthrough artifacts. Do NOT use LaTeX math formatting (such as `$`, `\frac`, or `\tau`) in these markdown files as the preview rendering environment does not compile them.

### C. Validation & Verification
* **CRITICAL**: Always ask for user confirmation/permission **before** validating the page using the `browser_subagent` tool. Do not run it automatically without consent.

### D. Schematic and Card Images
* If no schematic image or thumbnail drawing is provided:
  1. Complete the implementation and load the page in the browser (or have the user load it).
  2. Capture a screenshot of the D3 plot or page.
  3. Crop and save that screenshot to the `assets/` directory to serve as the schematic/thumbnail image.
* If a new schematic drawing is required:
  1. Generate an SVG with clean, general shapes for the user to edit later.
  2. Follow the detailed SVG layout and formatting guidelines in the `generate-svg` skill.

### E. Wide Layout Guidelines (io_wide)
* For wide templates (e.g. `eq_deriv-schem-io_wide-plot.html`):
  1. **Plot Aspect Ratio**: Set a larger plot `aspectRatio`, starting at `2.75` (e.g. `"aspectRatio": 2.75`), to prevent vertical stretching and ensure a clean presentation in wide viewport sections.
  2. **Grid Layout**: Balance the space allocated to the inputs card vs. the outputs card based on the number of inputs/outputs and how many columns they span, so that the individual input sliders and output blocks have a similar visual width. For example, if there are 4 inputs taking up 2 columns and only 1 output card, use a `"desktop": "2fr 1fr"` grid layout:
     ```json
     {
         "desktop": "2fr 1fr",
         "mobile": "100%"
     }
     ```


