# Topic Page Configuration Guidelines

When editing or creating `pageData` configuration objects in this repository, always adhere to the following conventions for `equationElements`:

## 1. Assumptions Section
If the page has assumptions, use `type: "assumptions"`:
- **Single Assumption**: Place the assumption description in a single-item array under `content`. This renders the header and text on separate lines without a bullet:
  ```json
  {
      "type": "assumptions",
      "content": [
          "One-dimensional open channel flow"
      ]
  }
  ```
- **Multiple Assumptions**: Place them as multiple strings in the `content` array:
  ```json
  {
      "type": "assumptions",
      "content": [
          "First assumption description",
          "Second assumption description"
      ]
  }
  ```

## 2. Equations Section
Place equations inside `type: "equations"`. The renderer automatically injects the note header (`**Equation**` or `**Equations**` depending on the count) above the equations:
```json
{
    "type": "equations",
    "content": [
        "c = \\sqrt{gy}"
    ]
}
```

## 3. Symbols Section
Define symbols using `type: "symbols"`.
- **Structured Content**: Each item in `content` must have `symbol` (LaTeX math) and `definition` (description string).
- **No Units**: Symbol definitions must **never** contain units (e.g. use "mass", not "mass (kg)" or "mass in kg").
```json
{
    "type": "symbols",
    "content": [
        { "symbol": "$x$", "definition": "position" },
        { "symbol": "$v$", "definition": "velocity" }
    ]
}
```

## 4. Local Testing Server
When running local testing or using a browser agent, always use `http://127.0.0.1:5500/` instead of `localhost:8000` or `localhost`, as a Live Server is already running on port 5500 and localhost may cause issues.

Confirm with the user when you plan on validating with browser agent to check if it is necessary.

## 5. Core Architecture & Key Files

### A. Dynamic Data Loading Flow
1. **Topic Files** (e.g. [me310/9.15-eq.js](file:///d:/Documents/thermofluidlearn/prof-tang-interactive-tools/me310/9.15-eq.js)) define a `pageData` configuration object.
2. The interactive HTML pages load [templates/renderer.js](file:///d:/Documents/thermofluidlearn/prof-tang-interactive-tools/templates/renderer.js) which reads `pageData` and:
   - Sets up layout grids and parses LaTeX/Markdown headers (via `parseText`).
   - Renders equation cards, symbols list, and the schematic image.
   - Instantiates inputs (sliders, dropdowns), sets up custom event listeners, and tracks current interactive state.
   - Calculates outputs and draws D3.js interactive graphs (plots).

### B. Input/Output State Evaluation
- **State Object**: Slider and dropdown inputs store their current value in an interactive state map (e.g., `fluid: "water"`, `U: 0.6`, `x: 0.15`).
- **Calculations**: Defined as formula strings (e.g. `"5 * x / sqrt(reynolds) * 1000"`). They are parsed dynamically via `evaluateFormula(formula, state)`.
- **Mapping values**: Defined using `"type": "map"` with a `value` array and a `key` field referencing a dropdown ID (e.g. mapping `fluid` choice to `rho` value).
- **Dynamic Plot Bounds**: Bounds like `yMax`, `yMin`, and `yTickInterval` can be:
  - Numeric constants.
  - Arrays mapped to dropdown indices (e.g. `[6, 20]`).
  - Mathematical formula strings evaluated on current input state (e.g. `"(5 / kinematic-viscosity) < 5e5 ? 5e5 : 5e6"`).

### C. D3.js Plotting
- `templates/renderer.js` uses D3.js linear scales, axes, line generators, and drag behaviors.
- Plots are reactive: drag points or input sliders trigger an update cycle that re-evaluates all calculations and redraws lines/points dynamically.