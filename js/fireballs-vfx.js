/**
 * Fireballs VFX (adapted from squash-tracks presentationShared trail/fireballs).
 * One-shot canvas burst driven by requestAnimationFrame — no workout timeline.
 */

const SPARKS_PHYS_VEL_SCALE = 1.35;
const SPARKS_PHYS_DRAG = 0.988;
const SPARKS_PHYS_MAX_STEPS = 64;
/** Spawn near the bottom (toolbar band); rise fills most of the canvas. */
const FIREBALLS_BAND_Y_CENTER = 0.92;
const FIREBALLS_BAND_Y_WAVE = 0.015;
/** Long enough to read as a rise, not a one-frame flash. */
const BURST_DURATION_MS = 2200;
const HUE_CENTER = 10;
const HUE_SPREAD = 30;
/** Density vs presentationShared's 280 — more balls, same burst length. */
const FIREBALLS_REF_N = 520;
const FIREBALLS_MAX_N = 640;

/** @type {{ canvas: HTMLCanvasElement, raf: number, onDone?: () => void } | null} */
let active = null;

function makeRng(seed) {
  let s = seed >>> 0;
  return function next() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sparkPhysicsMicroStep(x, y, vx, vy, g, frac) {
  const vs = SPARKS_PHYS_VEL_SCALE * frac;
  const drag = SPARKS_PHYS_DRAG;
  x += vx * vs;
  y += vy * vs;
  vy += g * frac;
  vx *= Math.pow(drag, frac);
  return { x, y, vx, vy };
}

function integrateSparkParticle(ox, oy, vx0, vy0, g, burstT) {
  let x = ox;
  let y = oy;
  let vx = vx0;
  let vy = vy0;
  if (burstT <= 0) return { x: ox, y: oy };
  const edge = burstT * SPARKS_PHYS_MAX_STEPS;
  const full = Math.min(SPARKS_PHYS_MAX_STEPS, Math.max(0, Math.floor(edge + 1e-12)));
  const frac = Math.max(0, edge - full);
  for (let k = 0; k < full; k++) {
    const u = sparkPhysicsMicroStep(x, y, vx, vy, g, 1);
    x = u.x;
    y = u.y;
    vx = u.vx;
    vy = u.vy;
  }
  if (frac > 1e-10) {
    const u = sparkPhysicsMicroStep(x, y, vx, vy, g, frac);
    x = u.x;
    y = u.y;
  }
  return { x, y };
}

function reducedMotion() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} t 0..1
 * @param {number} seed
 */
function paintFireballsFrame(canvas, t, seed) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cwRaw = Math.max(1, canvas.clientWidth || 1);
  const cw = Math.max(32, Math.round(cwRaw / 16) * 16);
  const dpr = w / cw;
  const refCw = 800;
  const n = Math.max(140, Math.min(FIREBALLS_MAX_N, Math.round((cw * FIREBALLS_REF_N) / refCw)));
  const gStep = 0.1 * dpr;
  // Hold full brightness through most of the rise; fade only late.
  const burstFade = Math.max(0, 1 - Math.pow(t, 1.65) * 0.92);
  const rnd = makeRng(seed >>> 0);
  const denom = Math.max(1, n - 1);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const u = i / denom;
    const ox = w * (0.02 + u * 0.96) + (rnd() - 0.5) * 14 * dpr;
    const oy =
      h * (FIREBALLS_BAND_Y_CENTER + Math.sin(u * Math.PI) * FIREBALLS_BAND_Y_WAVE) +
      (rnd() - 0.5) * 10 * dpr;
    const angle = -Math.PI / 2 + (rnd() - 0.5) * 0.78;
    const sp = (1.8 + rnd() * 2.8) * dpr;
    const vx0 = Math.cos(angle) * sp * (0.55 + rnd());
    // Strong upward bias so the climb covers the reveal, without rocketing off in one frame.
    const vy0 = Math.sin(angle) * sp * (0.7 + rnd() * 0.55) - 0.85 * dpr;
    const pos = integrateSparkParticle(ox, oy, vx0, vy0, gStep, t);
    const x = pos.x + (rnd() - 0.5) * 2 * dpr;
    const y = pos.y + (rnd() - 0.5) * 2 * dpr;
    const life = Math.max(0.12, 0.45 + rnd() * 0.4);
    const aLife = burstFade * Math.min(1, (t + 0.12) / life) * Math.min(1, 0.55 + rnd() * 0.45);
    const hue = HUE_CENTER + (rnd() - 0.5) * 2 * HUE_SPREAD;
    const pr = (1.05 + rnd() * 1.75) * dpr;
    const a = Math.min(0.98, aLife * 1.35);
    const grd = ctx.createRadialGradient(x, y, 0, x, y, pr * 3);
    grd.addColorStop(0, "hsla(" + hue + ",100%,70%," + a + ")");
    grd.addColorStop(0.4, "hsla(" + hue + ",90%,50%," + a * 0.6 + ")");
    grd.addColorStop(1, "hsla(" + hue + ",80%,40%,0)");
    ctx.fillStyle = grd;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, pr * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function sizeCanvas(canvas) {
  // Prefer the canvas's own box (extended reveal VFX uses top/bottom).
  let rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    const parent = canvas.parentElement;
    rect = parent ? parent.getBoundingClientRect() : rect;
  }
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const bw = Math.max(1, Math.floor(rect.width * dpr));
  const bh = Math.max(1, Math.floor(rect.height * dpr));
  // Avoid clearing the bitmap on sub-pixel layout jitter (looks like a one-frame flash).
  if (Math.abs(canvas.width - bw) > 1 || Math.abs(canvas.height - bh) > 1) {
    canvas.width = bw;
    canvas.height = bh;
  }
}

/** Stop any running fireballs and clear the canvas. */
export function stopFireballs() {
  if (!active) return;
  if (active.raf) cancelAnimationFrame(active.raf);
  const ctx = active.canvas.getContext("2d");
  if (ctx) ctx.clearRect(0, 0, active.canvas.width, active.canvas.height);
  active.canvas.hidden = true;
  const done = active.onDone;
  active = null;
  done?.();
}

/**
 * Play one fireballs burst on `canvas`.
 * @param {HTMLCanvasElement} canvas
 * @param {{ seed?: number, durationMs?: number, onDone?: () => void }} [opts]
 */
export function playFireballs(canvas, opts = {}) {
  stopFireballs();
  if (!canvas || !canvas.getContext) return;
  if (reducedMotion()) {
    canvas.hidden = true;
    opts.onDone?.();
    return;
  }
  const seed =
    opts.seed != null && Number.isFinite(Number(opts.seed))
      ? Number(opts.seed) >>> 0
      : (Math.floor(Math.random() * 0x100000000) >>> 0);
  const durationMs = Math.max(200, Number(opts.durationMs) || BURST_DURATION_MS);
  canvas.hidden = false;
  canvas.setAttribute("aria-hidden", "true");
  sizeCanvas(canvas);
  const started = performance.now();
  active = { canvas, raf: 0, onDone: opts.onDone };

  const tick = (now) => {
    if (!active || active.canvas !== canvas) return;
    const t = Math.max(0, Math.min(1, (now - started) / durationMs));
    sizeCanvas(canvas);
    paintFireballsFrame(canvas, t, seed);
    if (t >= 1) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.hidden = true;
      const done = active.onDone;
      active = null;
      done?.();
      return;
    }
    active.raf = requestAnimationFrame(tick);
  };
  active.raf = requestAnimationFrame(tick);
}

export const FIREBALLS_BURST_MS = BURST_DURATION_MS;
