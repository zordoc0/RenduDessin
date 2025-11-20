// COMPOSITION I

// ----------------------------------------------------
let DESSIN = 14; // [14,15,16,17,18]

// ----------------------------------------------------
// Sketch artistique (réécriture pour p5.js)
// - Animation organique basée sur bruit et polygones étoilés
// - Touche `s` : sauvegarde PNG, `r` : randomise la composition

let t = 0;
let paletteSets;
let palette;
let centers = [];
let K1 = 6; // nombre de centres autour du cercle
let R1; // rayon des centres (sera calculé en setup)
let petals = 10;

function setup() {
  createCanvas(windowWidth * 0.9, windowHeight * 0.8);
  colorMode(HSL, 360, 100, 100, 1);
  noStroke();

  // palettes variées selon l'ambiance
  paletteSets = {
    dreamy: ['#6D5ACB', '#8EC5FF', '#FFD166', '#FF6B6B', '#C77DFF'],
    dawn: ['#0F172A', '#1E3A8A', '#F97316', '#FFD580', '#FEF3C7'],
    forest: ['#0B3D2E', '#17694A', '#3FBF99', '#A7F3D0', '#E6FFFA'],
    berry: ['#2D033B', '#6A0572', '#C92A7A', '#FF7BAC', '#FFD6E8']
  };

  palette = pickPalette('dreamy');
  R1 = min(width, height) * 0.28;
  resetCenters();
}

function draw() {
  t += 0.008;
  drawBackgroundGradient();

  // subtle vignette
  push();
  translate(width / 2, height / 2);
  for (let i = 0; i < centers.length; i++) {
    const c = centers[i];
    const n = noise(c.ox * 1.2 + t * 0.3, c.oy * 0.6 + t * 0.2);
    drawStar(c.x, c.y, petals + floor(n * 8), c.size * (0.6 + n * 0.9), c.hue, n * 0.8);
  }
  pop();

  // floating light halos
  blendMode(ADD);
  for (let i = 0; i < 8; i++) {
    const ox = width * (0.15 + 0.7 * noise(i * 3 + t * 0.11));
    const oy = height * (0.15 + 0.7 * noise(i * 5 + t * 0.08));
    const rr = 100 + 220 * noise(i * 7 + t * 0.04);
    const col = color(palette[i % palette.length]);
    fill(hue(col), saturation(col), brightness(col), 0.04 + 0.04 * sin(t + i));
    ellipse(ox, oy, rr, rr);
  }
  blendMode(BLEND);
}

function drawStar(cx, cy, points, radius, hueBase, n) {
  push();
  translate(cx - width / 2, cy - height / 2);
  rotate(noise(cx * 0.001, cy * 0.001, t * 0.2) * TWO_PI);

  // layered shells
  for (let layer = 0; layer < 4; layer++) {
    const r = radius * (0.35 + layer * 0.25);
    const alpha = 0.28 - layer * 0.06;
    const steps = points + layer * 2;
    const col = color(adjustHue(palette[floor(map(layer, 0, 3, 0, palette.length)) % palette.length], layer * 8));
    fill(hue(col), saturation(col), brightness(col), alpha);
    beginShape();
    for (let i = 0; i < steps; i++) {
      const a = map(i, 0, steps, 0, TWO_PI);
      const noiseFactor = noise(cos(a) * 0.5 + t * 0.35, sin(a) * 0.5 + t * 0.35, layer * 0.7);
      const rr = r * (0.6 + 0.5 * sin(t * 0.5 + i) * noiseFactor);
      const x = cos(a) * rr;
      const y = sin(a) * rr;
      curveVertex(x, y);
    }
    endShape(CLOSE);
  }

  // center dot
  const ccol = color(palette[floor(map(n, 0, 1, 0, palette.length)) % palette.length]);
  fill(hue(ccol), saturation(ccol), brightness(ccol), 0.95);
  ellipse(0, 0, radius * 0.28, radius * 0.28);
  pop();
}

function drawBackgroundGradient() {
  const c1 = color('#0B1020');
  const c2 = color('#2B1E5F');
  for (let y = 0; y < height; y++) {
    const inter = pow(y / height, 1.2);
    const c = lerpColor(c1, c2, inter);
    stroke(hue(c), saturation(c), brightness(c));
    line(0, y, width, y);
  }
}

function resetCenters() {
  centers = [];
  for (let i = 0; i < K1; i++) {
    const ang = TWO_PI * i / K1 + noise(i) * 0.6;
    const x = width / 2 + cos(ang) * R1 * (0.7 + 0.6 * noise(i + 10));
    const y = height / 2 + sin(ang) * R1 * (0.7 + 0.6 * noise(i + 20));
    const size = min(width, height) * (0.08 + 0.06 * i) * (0.8 + 0.6 * noise(i + 30));
    centers.push({x: x, y: y, size: size, ox: cos(ang), oy: sin(ang), hue: i});
  }
}

function pickPalette(name) {
  const p = paletteSets[name] || Object.values(paletteSets)[0];
  // convert to p5 color
  return p.map(c => color(c));
}

function adjustHue(colHex, delta) {
  const c = color(colHex);
  return (hue(c) + delta) % 360;
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('art_dessin', 'png');
  if (key === 'r' || key === 'R') {
    randomizeComposition();
  }
  if (key === 'p' || key === 'P') {
    // cycle palettes
    const keys = Object.keys(paletteSets);
    const idx = keys.indexOf(Object.keys(paletteSets).find(k => paletteSets[k] === palette.map(c => c.toString())));
  }
}

function randomizeComposition() {
  K1 = floor(random(4, 12));
  petals = floor(random(6, 18));
  R1 = min(width, height) * random(0.2, 0.36);
  const keys = Object.keys(paletteSets);
  palette = pickPalette(keys[floor(random(keys.length))]);
  resetCenters();
}

function windowResized() {
  resizeCanvas(windowWidth * 0.9, windowHeight * 0.8);
  R1 = min(width, height) * 0.28;
  resetCenters();
}

