/* Grid-noise rendering for the static HTML in #page.
 * Configuration lives in index.html's header; edit it and reload.
 * The DOM remains underneath the pointer-transparent canvas for accessibility.
 * Inline HTML/CSS is rasterized after fonts load, on resize, and on DOM edits.
 * External images/fonts and animated media would need a different capture path.
 * Effect formulas follow https://grid-noise-animator.vercel.app/en.html.
 */
(() => {
  "use strict";
  const settings = noiseSettings;
  const page = document.getElementById("page");
  const canvas = document.getElementById("noise-effect");
  const context = canvas.getContext("2d");
  const source = document.createElement("canvas");
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  const staging = document.createElement("canvas");
  const stagingContext = staging.getContext("2d");
  const tau = Math.PI * 2;
  const clamp = (value, max = 1) => Math.max(0, Math.min(max, value));
  const count = settings.gridSize ** 2;
  const phases = Float32Array.from({ length: count * 6 }, () => Math.random() * tau);
  const parameters = new Float32Array(count * 12);
  const seeds = new Float32Array(count * 2);
  let width, height, scale, pixels, packedSource, output, packedOutput;
  let hsl, lowHsl, edges, overlay, cells;
  let frame = 0, lastTime = -Infinity, captureVersion = 0, resizeFrame;

  function toHsl(data) {
    const result = new Float32Array(width * height * 3);
    for (let p = 0, i = 0; p < data.length; p += 4, i += 3) {
      const r = data[p] / 255, g = data[p + 1] / 255, b = data[p + 2] / 255;
      const hi = Math.max(r, g, b), lo = Math.min(r, g, b), delta = hi - lo;
      const light = (hi + lo) / 2;
      let hue = 0;
      if (delta) {
        if (hi === r) hue = ((g - b) / delta + 6) % 6;
        else if (hi === g) hue = (b - r) / delta + 2;
        else hue = (r - g) / delta + 4;
      }
      result[i] = hue * 60;
      result[i + 1] = delta ? delta / (1 - Math.abs(2 * light - 1)) : 0;
      result[i + 2] = light;
    }
    return result;
  }

  function channel(hue, saturation, lightness, offset) {
    const k = ((hue / 30 + offset) % 12 + 12) % 12;
    return (lightness - saturation * Math.min(lightness, 1 - lightness)
      * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  }

  function buildCells() {
    const n = settings.gridSize;
    const cellWidth = width / n, cellHeight = height / n;
    cells = new Uint32Array(width * height);
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const id = row * n + col;
        seeds[id * 2] = (col + 0.25 + Math.random() * 0.5) * cellWidth;
        seeds[id * 2 + 1] = (row + 0.25 + Math.random() * 0.5) * cellHeight;
        const left = Math.round(col * cellWidth), right = Math.round((col + 1) * cellWidth);
        for (let y = Math.round(row * cellHeight); y < Math.round((row + 1) * cellHeight); y++) {
          cells.fill(id, y * width + left, y * width + right);
        }
      }
    }
    if (!settings.enhancedMode) return;
    for (let y = 0; y < height; y++) {
      const row = Math.floor(y / cellHeight);
      for (let x = 0; x < width; x++) {
        const col = Math.floor(x / cellWidth);
        let distance = Infinity, nearest = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(n - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(n - 1, col + 1); c++) {
            const id = r * n + c;
            const d = (x - seeds[id * 2]) ** 2 + (y - seeds[id * 2 + 1]) ** 2;
            if (d < distance) { distance = d; nearest = id; }
          }
        }
        cells[y * width + x] = nearest;
      }
    }
  }

  function buildOverlay() {
    overlay = null;
    const text = settings.embedText;
    if (!settings.mlProtection && !(text.enabled && text.text)) return;
    overlay = new Float32Array(width * height * 3);
    // A fixed, low-amplitude pattern; no claim of reliable ML protection.
    if (settings.mlProtection) {
      let seed = 0x12345678;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
        return (seed >>> 0) / 4294967296;
      };
      for (let ch = 0; ch < 3; ch++) {
        for (let wave = 0; wave < 5; wave++) {
          const frequency = tau / ((2 + random() * 3) * scale);
          const angle = random() * Math.PI, phase = random() * tau;
          const dx = Math.cos(angle) * frequency, dy = Math.sin(angle) * frequency;
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              overlay[(y * width + x) * 3 + ch] += 1.2 * Math.sin(x * dx + y * dy + phase);
            }
          }
        }
      }
    }
    if (text.enabled && text.text) {
      stagingContext.clearRect(0, 0, width, height);
      const size = Math.max(10 * scale, Math.round(Math.min(width, height) * 0.06));
      stagingContext.font = `bold ${size}px monospace`;
      stagingContext.textBaseline = "top";
      stagingContext.fillStyle = "white";
      const label = text.text.slice(0, 32) + "   ";
      const step = stagingContext.measureText(label).width;
      let row = 0;
      for (let y = -size * 1.7; y < height + size; y += size * 1.7, row++) {
        for (let x = -step - (row % 2) * step / 2; x < width; x += step) {
          stagingContext.fillText(label, x, y);
        }
      }
      const mask = stagingContext.getImageData(0, 0, width, height).data;
      const amount = text.darkness * (text.dark ? -1 : 1);
      for (let i = 0; i < width * height; i++) {
        for (let ch = 0; ch < 3; ch++) overlay[i * 3 + ch] += mask[i * 4 + 3] / 255 * amount;
      }
    }
    for (let ch = 0; ch < 3; ch++) {
      let sum = 0;
      for (let i = ch; i < overlay.length; i += 3) sum += overlay[i];
      const mean = sum / (width * height);
      for (let i = ch; i < overlay.length; i += 3) overlay[i] -= mean;
    }
  }

  async function capture() {
    const version = ++captureVersion;
    const cssWidth = Math.ceil(page.getBoundingClientRect().width);
    const cssHeight = Math.ceil(Math.max(page.scrollHeight, page.getBoundingClientRect().height));
    const ratio = window.devicePixelRatio || 1;
    const w = Math.round(cssWidth * ratio), h = Math.round(cssHeight * ratio);
    const clone = page.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    clone.style.width = `${cssWidth}px`;
    clone.style.minHeight = `${cssHeight}px`;
    const style = document.createElement("style");
    style.textContent = [...document.querySelectorAll("style")].map(node => node.textContent).join("\n");
    clone.prepend(style);
    const markup = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${cssWidth} ${cssHeight}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`;
    const image = new Image();
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    await image.decode();
    if (version !== captureVersion) return;
    width = w; height = h; scale = ratio;
    for (const target of [canvas, source, staging]) { target.width = width; target.height = height; }
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    sourceContext.drawImage(image, 0, 0);
    pixels = sourceContext.getImageData(0, 0, width, height).data;
    packedSource = new Uint32Array(pixels.buffer);
    output = context.createImageData(width, height);
    packedOutput = new Uint32Array(output.data.buffer);
    hsl = toHsl(pixels);
    lowHsl = edges = null;
    if (settings.detailMode) {
      stagingContext.filter = `blur(${settings.detailBlurPixels * scale}px)`;
      stagingContext.drawImage(source, 0, 0);
      stagingContext.filter = "none";
      const low = stagingContext.getImageData(0, 0, width, height).data;
      lowHsl = toHsl(low);
      edges = new Float32Array(width * height * 3);
      for (let i = 0; i < width * height; i++) {
        for (let ch = 0; ch < 3; ch++) edges[i * 3 + ch] = pixels[i * 4 + ch] - low[i * 4 + ch];
      }
    }
    buildCells();
    buildOverlay();
    draw(performance.now() / 1000);
    canvas.hidden = false;
  }

  function updateParameters(time) {
    const phase = frame * tau / settings.syncCycle;
    const frameTheta = Math.random() * tau;
    const period = Math.max(width, height) / 2.5;
    const warp = settings.warp.enabled ? settings.warp.pixels * scale : 0;
    for (let id = 0; id < count; id++) {
      const p = id * 12, b = id * 6;
      const row = Math.floor(id / settings.gridSize), col = id % settings.gridSize;
      let theta, light, saturation, dx, dy, bright;
      if (settings.syncCycle >= 2) {
        theta = phases[b] + phase;
        light = Math.cos(phases[b + 1] + phase);
        saturation = Math.cos(phases[b + 2] + phase);
        dx = Math.cos(phases[b + 3] + phase);
        dy = Math.cos(phases[b + 4] + phase);
        bright = Math.cos(phases[b + 5] + phase);
      } else {
        theta = Math.random() * tau;
        light = Math.random() * 2 - 1;
        saturation = Math.random() * 2 - 1;
        dx = Math.random() * 2 - 1; dy = Math.random() * 2 - 1;
        bright = Math.random() * 2 - 1;
        if (settings.noiseType === "blue") {
          const bluePhase = frameTheta + ((row + col) % 2) * Math.PI;
          const amplitude = 0.5 + Math.random() * 0.5;
          theta = bluePhase + (Math.random() - 0.5) * Math.PI / 3;
          light = Math.cos(bluePhase) * amplitude;
          saturation = Math.sin(bluePhase) * amplitude;
        }
      }
      const chroma = settings.hueVariance / 180 * 128;
      parameters[p] = dx * warp;
      parameters[p + 1] = dy * warp;
      parameters[p + 2] = chroma * Math.cos(theta);
      parameters[p + 3] = chroma * (-0.5 * Math.cos(theta) - Math.sqrt(3) / 2 * Math.sin(theta));
      parameters[p + 4] = chroma * (-0.5 * Math.cos(theta) + Math.sqrt(3) / 2 * Math.sin(theta));
      parameters[p + 5] = saturation * settings.saturationVariance / 100;
      parameters[p + 6] = light * settings.lightnessVariance / 100;
      const center = ((col + 0.5) * width + (row + 0.5) * height) / settings.gridSize;
      parameters[p + 7] = ((center * Math.SQRT1_2 / period + time * 0.15) % 1) * 360;
      parameters[p + 8] = 0;
      parameters[p + 9] = 0.5;
      if (settings.sparkle.enabled && Math.random() < settings.sparkle.strength / 100 * 0.18) {
        const dark = Math.random() < 0.5;
        parameters[p + 8] = dark ? 0.35 + Math.random() * 0.45 : 0.65 + Math.random() * 0.3;
        parameters[p + 9] = dark ? 0.1 + Math.random() * 0.18 : 0.5;
      }
      parameters[p + 10] = 1 + bright * settings.detailBrightness / 100;
    }
  }

  function draw(time) {
    updateParameters(time);
    const colorEffects = settings.detailMode || settings.hueVariance || settings.lightnessVariance
      || settings.saturationVariance || settings.iridescentWave.enabled || settings.sparkle.enabled
      || settings.cellRainbow.enabled || overlay;
    const data = output.data;
    const irid = settings.iridescentWave.enabled ? settings.iridescentWave.strength / 100 * 90 : 0;
    const darkening = settings.sparkle.enabled ? settings.sparkle.strength / 100 * 0.32 : 0;
    const rainbow = settings.cellRainbow.enabled ? settings.cellRainbow.strength / 100 * 0.62 : 0;
    const period = Math.max(width, height) / 2.5;
    const cellWidth = width / settings.gridSize, cellHeight = height / settings.gridSize;
    for (let y = 0, i = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++) {
        const id = cells[i], p = id * 12;
        const sx = Math.max(0, Math.min(width - 1, Math.floor(x + parameters[p])));
        const sy = Math.max(0, Math.min(height - 1, Math.floor(y + parameters[p + 1])));
        const sample = sy * width + sx;
        // Default screenshot settings need only a nearest-neighbor pixel copy.
        if (!colorEffects) { packedOutput[i] = packedSource[sample]; continue; }
        const buffer = lowHsl || hsl;
        const index = (lowHsl ? i : sample) * 3;
        const hue = buffer[index];
        const saturation = clamp(buffer[index + 1] + parameters[p + 5]);
        const light = clamp(buffer[index + 2] + parameters[p + 6] - darkening);
        let r = clamp(channel(hue, saturation, light, 0) + parameters[p + 2], 255);
        let g = clamp(channel(hue, saturation, light, 8) + parameters[p + 3], 255);
        let b = clamp(channel(hue, saturation, light, 4) + parameters[p + 4], 255);
        if (edges) {
          r = clamp(r + edges[sample * 3] * parameters[p + 10], 255);
          g = clamp(g + edges[sample * 3 + 1] * parameters[p + 10], 255);
          b = clamp(b + edges[sample * 3 + 2] * parameters[p + 10], 255);
        }
        if (irid) {
          const wave = ((x + y) * Math.SQRT1_2 / period + time * 0.15) * tau;
          const c = Math.cos(wave), s = Math.sin(wave);
          r = clamp(r + irid * c, 255);
          g = clamp(g + irid * (-0.5 * c - Math.sqrt(3) / 2 * s), 255);
          b = clamp(b + irid * (-0.5 * c + Math.sqrt(3) / 2 * s), 255);
        }
        const sparkle = parameters[p + 8];
        if (sparkle) {
          r = r * (1 - sparkle) + channel(parameters[p + 7], 1, parameters[p + 9], 0) * sparkle;
          g = g * (1 - sparkle) + channel(parameters[p + 7], 1, parameters[p + 9], 8) * sparkle;
          b = b * (1 - sparkle) + channel(parameters[p + 7], 1, parameters[p + 9], 4) * sparkle;
        }
        if (rainbow) {
          const left = Math.round((id % settings.gridSize) * cellWidth);
          const top = Math.round(Math.floor(id / settings.gridSize) * cellHeight);
          const hue = parameters[p + 7] + (x - left + y - top) * Math.SQRT1_2 / Math.max(cellWidth, cellHeight) * 360;
          r = r * (1 - rainbow) + channel(hue, 1, 0.42, 0) * rainbow;
          g = g * (1 - rainbow) + channel(hue, 1, 0.42, 8) * rainbow;
          b = b * (1 - rainbow) + channel(hue, 1, 0.42, 4) * rainbow;
        }
        data[i * 4] = r + (overlay ? overlay[i * 3] : 0);
        data[i * 4 + 1] = g + (overlay ? overlay[i * 3 + 1] : 0);
        data[i * 4 + 2] = b + (overlay ? overlay[i * 3 + 2] : 0);
        data[i * 4 + 3] = 255;
      }
    }
    if (settings.blur.enabled) {
      stagingContext.putImageData(output, 0, 0);
      context.clearRect(0, 0, width, height);
      context.filter = `blur(${settings.blur.pixels * scale}px)`;
      context.drawImage(staging, 0, 0);
      context.filter = "none";
    } else context.putImageData(output, 0, 0);
  }

  function animate(now) {
    requestAnimationFrame(animate);
    if (!output || document.hidden || now - lastTime < 1000 / settings.fps) return;
    lastTime = now;
    if (settings.enhancedMode && settings.morphFrames > 0 && frame % settings.morphFrames === 0) buildCells();
    draw(now / 1000);
    frame++;
  }

  function scheduleCapture() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => capture().catch(reportError));
  }

  function reportError(error) {
    canvas.hidden = true;
    console.error("Unable to render the page noise effect:", error);
  }

  document.fonts.ready.then(capture).then(() => requestAnimationFrame(animate)).catch(reportError);
  new ResizeObserver(scheduleCapture).observe(page);
  new MutationObserver(scheduleCapture).observe(page, { subtree: true, childList: true, characterData: true, attributes: true });
  window.addEventListener("resize", scheduleCapture);
})();
