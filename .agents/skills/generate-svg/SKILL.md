---
name: generate-svg
description: Guidelines for generating simple SVG schematics with basic geometric shapes for physics and fluid mechanics topic pages.
---

# SVG Generation Guidelines

This skill provides guidelines and best practices for creating clean, simple vector graphics (SVGs) for engineering/physics schematics (e.g. pipe flows, boundary layers). The goal is to output clean markup with general geometric shapes that the user can easily open and edit in vector editors (like Inkscape or Illustrator).

## 1. Structure and Dimensions

* **Standard ViewBox**: Always specify a `viewBox` (e.g., `viewBox="0 0 600 300"`) and relative sizing `width="100%"` and `height="100%"` to keep the graphic responsive.
* **Semantic Grouping**: Group related components using `<g>` containers with clear `id` or `class` attributes (e.g., `<g id="flow-arrows">`, `<g id="pipe-bounds">`).
* **Direct SVG Rendering**: Only generate SVG files when creating schematics. Do not generate or convert SVG files to PNG files, as the browser renders SVGs directly for both simulator cards and thumbnails.

## 2. Geometric Simplicity

* Prefer simple primitives:
  * `<rect>` for solid structures, pipes, or flat plates.
  * `<circle>` for particle models, nodes, or pivot points.
  * `<line>` or `<path>` for lines, boundaries, and velocity distributions.
* Keep points on paths minimal to make manual adjustments simple.
* Use standard vector math shapes and avoid auto-generated bloated path strings.

## 3. Styling Standards

* Use direct SVG attributes or simple inline style definitions (e.g. `stroke="currentColor"`, `stroke-width="2"`, `fill="none"`).
* **Color Palette**:
  * Outlines and bounds: `#1e293b` (slate-800) or `#475569` (slate-600) with a thickness of `2` or `3` pixels.
  * Fluids/Flows: `#3b82f6` (blue-500) or `#60a5fa` (blue-400), with semi-transparent fills if representing regions.
  * Dimensions/Arrows: `#ef4444` (red-500) or `#f97316` (orange-500).
* Use dashed patterns (`stroke-dasharray="4 4"`) to represent imaginary boundaries or reference lines.

## 4. Text and Labels

* Use the `<text>` element with clean sans-serif typography:
  ```xml
  <text x="100" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#1e293b" text-anchor="middle">label</text>
  ```
* Do not embed complex MathJax in the SVG. Keep labels to simple unicode/plain-text symbols (e.g. `D`, `L`, `V`, `h_L`, `x`, `y`).
* Always specify `text-anchor="middle"` (or `start`/`end`) to control position alignment reliably.

## 5. Arrows and Markers

* Use reusable `<marker>` elements defined in the `<defs>` section for drawing consistent arrowheads:
  ```xml
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 2 L 10 5 L 0 8 z" fill="#ef4444" />
    </marker>
  </defs>
  ```
* Apply standard markers to paths using `marker-end="url(#arrow)"`.

## 6. Boilerplate Example

Here is a template SVG for a pipe segment:
```xml
<svg viewBox="0 0 600 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
    </marker>
  </defs>

  <!-- Pipe Walls -->
  <g id="pipe-walls" stroke="#475569" stroke-width="3" fill="none">
    <line x1="50" y1="50" x2="550" y2="50" />
    <line x1="50" y1="150" x2="550" y2="150" />
  </g>

  <!-- Flow Arrows -->
  <g id="flow-vectors" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)">
    <line x1="100" y1="100" x2="200" y2="100" />
    <line x1="250" y1="100" x2="350" y2="100" />
    <line x1="400" y1="100" x2="500" y2="100" />
  </g>

  <!-- Labels -->
  <g id="labels" font-family="system-ui, sans-serif" font-size="16" fill="#1e293b">
    <text x="300" y="130" text-anchor="middle">Velocity, V</text>
    <text x="30" y="105" text-anchor="end">D</text>
  </g>

  <!-- Dimension Indicator -->
  <line x1="45" y1="50" x2="45" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow)" marker-start="url(#arrow)" />
</svg>
```
