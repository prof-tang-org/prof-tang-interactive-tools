const fs = require('fs');
const path = require('path');

const file = 'd:/Documents/thermofluidlearn/prof-tang-interactive-tools/me200/3.57-eq.html';
let content = fs.readFileSync(file, 'utf8');

// Update CSS
content = content.replace(
  'grid-template-columns:repeat(2,minmax(120px,1fr));',
  'grid-template-columns:repeat(3,minmax(100px,1fr));'
);

// Update input V2 limits
content = content.replace(
  '<input type="number" id="v2-out" class="num-sm" min="0.05" max="0.2" step="0.001" value="0.15" onchange="handleV2Input(this)" />',
  '<input type="number" id="v2-out" class="num-sm" min="0.01" max="2" step="0.01" value="1.0" onchange="handleV2Input(this)" />'
);
content = content.replace(
  '<input type="range" id="v2-in" min="0.05" max="0.2" step="0.001" value="0.15" oninput="handleV2Input(this)" style="flex:1" />',
  '<input type="range" id="v2-in" min="0.01" max="2" step="0.01" value="1.0" oninput="handleV2Input(this)" style="flex:1" />'
);

// Update KPIs
content = content.replace(
  '<div class="kpi">\n            <div><div class="lab">Final pressure \\(p_2\\)</div><div class="val"><span id="p2-kpi">...</span> kPa</div></div>\n            <div><div class="lab">Work \\(W\\)</div><div class="val"><span id="w-kpi">...</span> kJ</div></div>\n          </div>',
  '<div class="kpi">\n            <div><div class="lab">Final temp \\(T_2\\)</div><div class="val"><span id="t2-kpi">...</span> K</div></div>\n            <div><div class="lab">Final pressure \\(p_2\\)</div><div class="val"><span id="p2-kpi">...</span> kPa</div></div>\n            <div><div class="lab">Work \\(W\\)</div><div class="val"><span id="w-kpi">...</span> kJ</div></div>\n          </div>'
);

// Update Viz div
content = content.replace(
  '<div class="viz">\n        <svg id="plot" viewBox="0 0 760 320" aria-label="Plot"></svg>\n      </div>',
  '<div class="viz" style="overflow-x: auto;">\n        <svg id="plot" viewBox="0 0 1100 320" style="min-width: 900px;" aria-label="Plot"></svg>\n      </div>'
);

// Replace script block
const scriptStart = '  <script>\n    /* ---------- constants & helpers ---------- */';
const scriptEnd = '    window.addEventListener(\'DOMContentLoaded\', init);\n  </script>';

const newScript = `  <script>
    /* ---------- constants & helpers ---------- */
    const $ = id => document.getElementById(id);
    const p1 = 100; // kPa
    const T1 = 300; // K
    const V1 = 0.1; // m^3
    const N_MIN = 0;
    const N_MAX = 2;
    const V2_MIN = 0.01;
    const V2_MAX = 2.0;

    const N_SNAP_RANGE = 0.04;

    function handleNInput(el) {
      let val = parseFloat(el.value);
      if (val < N_MIN) val = N_MIN;
      if (val > N_MAX) val = N_MAX;

      if (el.id === 'n-in' && Math.abs(val - 1.0) <= N_SNAP_RANGE) {
        val = 1.0;
        el.value = 1.0;
      }
      
      if (el.id === 'n-in') {
        $('n-out').value = Number.isInteger(val) ? val.toFixed(1) : val;
      } else {
        el.value = val;
        $('n-in').value = val;
      }
      
      const isIsothermal = (val === 1.0);
      $('n-marker').style.background = isIsothermal ? '#3b82f6' : '#4b5563';
      
      const note = $('n1-note');
      if (note) {
        note.style.color = isIsothermal ? '#2563eb' : '';
        note.style.fontWeight = isIsothermal ? '600' : 'normal';
      }
      
      compute();
    }

    function handleV2Input(el) {
      let val = parseFloat(el.value);
      if (val < V2_MIN) val = V2_MIN;
      if (val > V2_MAX) val = V2_MAX;

      if (el.id === 'v2-out') {
        el.value = val;
        $('v2-in').value = val;
      } else {
        $('v2-out').value = val;
        $('v2-in').value = val;
      }
      compute();
    }

    function calcP2(v, n) {
      return p1 * Math.pow(V1 / v, n);
    }

    function calcT2(v, n) {
      return T1 * Math.pow(V1 / v, n - 1);
    }

    function calcW(v, n) {
      if (Math.abs(n - 1) < 1e-4) {
        return p1 * V1 * Math.log(v / V1); // kPa * m^3 = kJ
      }
      return p1 * V1 * (Math.pow(V1 / v, n) - 1) / (1 - n);
    }

    function compute(){
      const v2 = parseFloat($('v2-in').value);
      const n = parseFloat($('n-in').value);

      const p2 = calcP2(v2, n);
      const t2 = calcT2(v2, n);
      const w = calcW(v2, n);
      
      $('t2-kpi').textContent = t2.toFixed(1);
      $('p2-kpi').textContent = p2.toFixed(1);
      $('w-kpi').textContent = w.toFixed(2);
      
      drawPlot(v2, n);
    }

    function drawPlot(v2_val, n_val) {
      const svg = d3.select("#plot");
      svg.selectAll("*").remove();
      
      const width = 1100;
      const height = 320;
      const margin = { top: 20, right: 30, bottom: 40, left: 55 };
      const gap = 70;
      
      const plotW = (width - margin.left - margin.right - 2 * gap) / 3;
      const plotH = height - margin.top - margin.bottom;
      
      const v_domain = [0, 2];
      const v_points = d3.range(0.01, 2.01, 0.01);
      
      let w_max = -Infinity, w_min = Infinity;
      
      const n_arr = [0, n_val, 2];
      const data_all = n_arr.map(n => {
        return v_points.map(v => {
          const t = calcT2(v, n);
          const p = calcP2(v, n);
          const w = calcW(v, n);
          if (w > w_max) w_max = w;
          if (w < w_min) w_min = w;
          return {v, t, p, w, n};
        });
      });
      
      const xScale1 = d3.scaleLinear().domain(v_domain).range([margin.left, margin.left + plotW]);
      const yScale1 = d3.scaleLinear().domain([0, 700]).range([margin.top + plotH, margin.top]);
      
      const xScale2 = d3.scaleLinear().domain(v_domain).range([margin.left + plotW + gap, margin.left + 2*plotW + gap]);
      const yScale2 = d3.scaleLinear().domain([0, 450]).range([margin.top + plotH, margin.top]);
      
      const xScale3 = d3.scaleLinear().domain(v_domain).range([margin.left + 2*plotW + 2*gap, width - margin.right]);
      const yScale3 = d3.scaleLinear().domain([Math.min(0, w_min), Math.max(0, w_max)]).range([margin.top + plotH, margin.top]);
      
      svg.append("g").attr("class", "axis").attr("transform", \`translate(0,\${margin.top + plotH})\`).call(d3.axisBottom(xScale1).ticks(5));
      svg.append("g").attr("class", "axis").attr("transform", \`translate(\${margin.left},0)\`).call(d3.axisLeft(yScale1));
      
      svg.append("g").attr("class", "axis").attr("transform", \`translate(0,\${margin.top + plotH})\`).call(d3.axisBottom(xScale2).ticks(5));
      svg.append("g").attr("class", "axis").attr("transform", \`translate(\${margin.left + plotW + gap},0)\`).call(d3.axisLeft(yScale2));
      
      svg.append("g").attr("class", "axis").attr("transform", \`translate(0,\${margin.top + plotH})\`).call(d3.axisBottom(xScale3).ticks(5));
      svg.append("g").attr("class", "axis").attr("transform", \`translate(\${margin.left + 2*plotW + 2*gap},0)\`).call(d3.axisLeft(yScale3));
      
      svg.append("text").attr("class", "axis-title")
         .attr("x", margin.left + plotW/2).attr("y", height - 5).attr("text-anchor", "middle")
         .text("Volume V₂ (m³)");
      svg.append("text").attr("class", "axis-title")
         .attr("x", -(margin.top + plotH/2)).attr("y", 15).attr("text-anchor", "middle").attr("transform", "rotate(-90)")
         .text("Temperature T₂ (K)");
         
      svg.append("text").attr("class", "axis-title")
         .attr("x", margin.left + plotW + gap + plotW/2).attr("y", height - 5).attr("text-anchor", "middle")
         .text("Volume V₂ (m³)");
      svg.append("text").attr("class", "axis-title")
         .attr("x", -(margin.top + plotH/2)).attr("y", margin.left + plotW + gap - 40).attr("text-anchor", "middle").attr("transform", "rotate(-90)")
         .text("Pressure p₂ (kPa)");

      svg.append("text").attr("class", "axis-title")
         .attr("x", margin.left + 2*plotW + 2*gap + plotW/2).attr("y", height - 5).attr("text-anchor", "middle")
         .text("Volume V₂ (m³)");
      svg.append("text").attr("class", "axis-title")
         .attr("x", -(margin.top + plotH/2)).attr("y", margin.left + 2*plotW + 2*gap - 40).attr("text-anchor", "middle").attr("transform", "rotate(-90)")
         .text("Work W (kJ)");
         
      if (w_min < 0 && w_max > 0) {
        svg.append("line").attr("class", "zeroline")
           .attr("x1", xScale3(v_domain[0])).attr("y1", yScale3(0))
           .attr("x2", xScale3(v_domain[1])).attr("y2", yScale3(0));
      }
      
      // Clipping paths so curves don't bleed out of plots (since points might exceed 700K or 450kPa)
      svg.append("clipPath").attr("id", "clip1")
         .append("rect").attr("x", margin.left).attr("y", margin.top).attr("width", plotW).attr("height", plotH);
      svg.append("clipPath").attr("id", "clip2")
         .append("rect").attr("x", margin.left + plotW + gap).attr("y", margin.top).attr("width", plotW).attr("height", plotH);
      svg.append("clipPath").attr("id", "clip3")
         .append("rect").attr("x", margin.left + 2*plotW + 2*gap).attr("y", margin.top).attr("width", plotW).attr("height", plotH);

      const lineT = d3.line().x(d => xScale1(d.v)).y(d => yScale1(d.t));
      const lineP = d3.line().x(d => xScale2(d.v)).y(d => yScale2(d.p));
      const lineW = d3.line().x(d => xScale3(d.v)).y(d => yScale3(d.w));
      
      const colors = {0: "#9ca3af", 2: "#9ca3af"};
      
      data_all.forEach((data, i) => {
        const n = n_arr[i];
        const isUserN = (i === 1);
        const color = isUserN ? "#3b82f6" : colors[n];
        const strokeW = isUserN ? 2.5 : 1.5;
        const dash = isUserN ? "" : "4 4";
        
        svg.append("path").datum(data).attr("class", "curve")
           .style("stroke", color).style("stroke-width", strokeW).style("stroke-dasharray", dash)
           .attr("clip-path", "url(#clip1)").attr("d", lineT);
           
        svg.append("path").datum(data).attr("class", "curve")
           .style("stroke", color).style("stroke-width", strokeW).style("stroke-dasharray", dash)
           .attr("clip-path", "url(#clip2)").attr("d", lineP);
           
        svg.append("path").datum(data).attr("class", "curve")
           .style("stroke", color).style("stroke-width", strokeW).style("stroke-dasharray", dash)
           .attr("clip-path", "url(#clip3)").attr("d", lineW);
           
        if (!isUserN) {
          const last = data[data.length - 1];
          svg.append("text").attr("x", xScale1(last.v) + 5).attr("y", yScale1(Math.max(0, Math.min(700, last.t))))
             .style("font-size", "12px").style("fill", color).attr("alignment-baseline", "middle").text(\`n=\${n}\`);
          svg.append("text").attr("x", xScale2(last.v) + 5).attr("y", yScale2(Math.max(0, Math.min(450, last.p))))
             .style("font-size", "12px").style("fill", color).attr("alignment-baseline", "middle").text(\`n=\${n}\`);
          svg.append("text").attr("x", xScale3(last.v) + 5).attr("y", yScale3(last.w))
             .style("font-size", "12px").style("fill", color).attr("alignment-baseline", "middle").text(\`n=\${n}\`);
        } else {
          const last = data[data.length - 1];
          svg.append("text").attr("x", xScale1(last.v) + 5).attr("y", yScale1(Math.max(0, Math.min(700, last.t))))
             .style("font-size", "12px").style("fill", color).style("font-weight", "bold").attr("alignment-baseline", "middle").text(\`n=\${n_val.toFixed(1)}\`);
          svg.append("text").attr("x", xScale2(last.v) + 5).attr("y", yScale2(Math.max(0, Math.min(450, last.p))))
             .style("font-size", "12px").style("fill", color).style("font-weight", "bold").attr("alignment-baseline", "middle").text(\`n=\${n_val.toFixed(1)}\`);
          svg.append("text").attr("x", xScale3(last.v) + 5).attr("y", yScale3(last.w))
             .style("font-size", "12px").style("fill", color).style("font-weight", "bold").attr("alignment-baseline", "middle").text(\`n=\${n_val.toFixed(1)}\`);
        }
      });
      
      const t_dot = calcT2(v2_val, n_val);
      const p_dot = calcP2(v2_val, n_val);
      const w_dot = calcW(v2_val, n_val);
      
      const dragpt1 = svg.append("circle").attr("class", "dragpt")
         .attr("cx", xScale1(v2_val)).attr("cy", yScale1(Math.max(0, Math.min(700, t_dot)))).attr("r", 6);
      const dragpt2 = svg.append("circle").attr("class", "dragpt")
         .attr("cx", xScale2(v2_val)).attr("cy", yScale2(Math.max(0, Math.min(450, p_dot)))).attr("r", 6);
      const dragpt3 = svg.append("circle").attr("class", "dragpt")
         .attr("cx", xScale3(v2_val)).attr("cy", yScale3(w_dot)).attr("r", 6);

      const hit1 = svg.append("rect").attr("class", "hit")
         .attr("x", margin.left).attr("y", margin.top).attr("width", plotW).attr("height", plotH);
      const hit2 = svg.append("rect").attr("class", "hit")
         .attr("x", margin.left + plotW + gap).attr("y", margin.top).attr("width", plotW).attr("height", plotH);
      const hit3 = svg.append("rect").attr("class", "hit")
         .attr("x", margin.left + 2*plotW + 2*gap).attr("y", margin.top).attr("width", plotW).attr("height", plotH);

      const drag = d3.drag()
        .on("start drag", (event) => {
          let v_new;
          if (event.x < margin.left + plotW + gap/2) {
            const xm = Math.max(margin.left, Math.min(margin.left + plotW, event.x));
            v_new = xScale1.invert(xm);
          } else if (event.x < margin.left + 2*plotW + 1.5*gap) {
            const xm = Math.max(margin.left + plotW + gap, Math.min(margin.left + 2*plotW + gap, event.x));
            v_new = xScale2.invert(xm);
          } else {
            const xm = Math.max(margin.left + 2*plotW + 2*gap, Math.min(width - margin.right, event.x));
            v_new = xScale3.invert(xm);
          }
          v_new = Math.round(v_new / 0.01) * 0.01;
          v_new = Math.max(v_domain[0], Math.min(v_domain[1], v_new));

          const t_new = calcT2(v_new, n_val);
          const p_new = calcP2(v_new, n_val);
          const w_new = calcW(v_new, n_val);

          dragpt1.attr("cx", xScale1(v_new)).attr("cy", yScale1(Math.max(0, Math.min(700, t_new))));
          dragpt2.attr("cx", xScale2(v_new)).attr("cy", yScale2(Math.max(0, Math.min(450, p_new))));
          dragpt3.attr("cx", xScale3(v_new)).attr("cy", yScale3(w_new));

          $('v2-in').value = v_new.toFixed(2);
          $('v2-out').value = v_new.toFixed(2);
          
          $('t2-kpi').textContent = t_new.toFixed(1);
          $('p2-kpi').textContent = p_new.toFixed(1);
          $('w-kpi').textContent = w_new.toFixed(2);
        })
        .on("end", () => compute());

      hit1.call(drag);
      hit2.call(drag);
      hit3.call(drag);
    }

    function init(){
      $('v2-in').value = 1.0;
      $('n-in').value = 1.3;
      $('v2-out').value = 1.0;
      handleNInput($('n-in')); // this also calls compute()
      window.addEventListener('resize', compute);
    }
    window.addEventListener('DOMContentLoaded', init);
  </script>`;

const startIdx = content.indexOf(scriptStart);
const endIdx = content.indexOf(scriptEnd) + scriptEnd.length;

if (startIdx !== -1 && content.indexOf(scriptEnd) !== -1) {
  content = content.substring(0, startIdx) + newScript + content.substring(endIdx);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated 3.57-eq.html');
} else {
  console.log('Could not find script block to replace.');
}
