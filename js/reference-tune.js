/**
 * Interactive Reference ## Tune player (Learn surface only).
 * Zero-dependency Web Audio — marimba / synth / percussion.
 */

import { escapeHtml as esc } from "./md-lite.js?v=20261120-arrow";

const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

let sharedCtx = null;
let playToken = 0;

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function sfxEnabled() {
  try {
    const v = localStorage.getItem("schnapp-sfx");
    if (v === "0" || v === "off" || v === "false") return false;
  } catch {
    /* ignore */
  }
  return true;
}

function getAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) {
    try {
      sharedCtx = new AC();
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

function noteToFreq(token) {
  const m = String(token || "").match(/^([A-G])(#|b)?([0-8])$/);
  if (!m) return null;
  let semis = SEMITONE[m[1]];
  if (m[2] === "#") semis += 1;
  if (m[2] === "b") semis -= 1;
  const octave = Number(m[3]);
  const midi = (octave + 1) * 12 + semis;
  return 440 * 2 ** ((midi - 69) / 12);
}

function schedulePerc(ctx, when, dur) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * Math.min(dur, 0.12)));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1800, when);
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.35, when + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.min(dur, 0.1));
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(when);
  src.stop(when + Math.min(dur, 0.12) + 0.02);
}

function scheduleTone(ctx, freq, when, dur, instrument) {
  if (!freq || dur <= 0) return;
  const master = ctx.createGain();
  master.connect(ctx.destination);

  if (instrument === "marimba") {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.setValueAtTime(freq, when);
    osc2.frequency.setValueAtTime(freq * 2.01, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.22, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(master);
    master.gain.value = 0.85;
    osc.start(when);
    osc2.start(when);
    osc.stop(when + dur + 0.03);
    osc2.stop(when + dur + 0.03);
    return;
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.18, when + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(when);
  osc.stop(when + dur + 0.03);
}

/**
 * @param {object} tune
 * @param {number} [keyIndex] play one key; omit for full phrase
 * @param {{ onHighlight?: (i: number|null, syl: number|null) => void, onDone?: () => void }} [hooks]
 */
export function playReferenceTune(tune, keyIndex, hooks = {}) {
  if (!tune?.keys?.length || !sfxEnabled()) {
    hooks.onDone?.();
    return () => {};
  }
  const ctx = getAudioCtx();
  if (!ctx) {
    hooks.onDone?.();
    return () => {};
  }

  const token = ++playToken;
  const reduced = prefersReducedMotion();
  const keys =
    keyIndex == null
      ? tune.keys.map((k, i) => ({ ...k, _i: i }))
      : [{ ...tune.keys[keyIndex], _i: keyIndex }];

  const schedule = () => {
    if (token !== playToken) return;
    const t0 = ctx.currentTime + 0.05;
    let lastEnd = 0;

    for (const key of keys) {
      const baseOffset =
        keyIndex == null ? 0 : -(key.syllableOffsetsSec?.[0] || 0);
      for (let j = 0; j < key.notes.length; j++) {
        const note = key.notes[j];
        const start =
          t0 + (key.syllableOffsetsSec[j] || 0) + baseOffset;
        const dur = key.syllableDurationsSec[j] || 0.08;
        lastEnd = Math.max(lastEnd, start + dur - t0);
        if (note === "REST") continue;
        if (note === "PERC" || tune.instrument === "percussion") {
          schedulePerc(ctx, start, Math.max(0.04, dur));
          continue;
        }
        const freq = noteToFreq(note);
        if (freq) scheduleTone(ctx, freq, start, dur, tune.instrument || "marimba");
      }
    }

    if (!reduced && hooks.onHighlight) {
      const paint = () => {
        if (token !== playToken) {
          hooks.onHighlight(null, null);
          return;
        }
        const elapsed = ctx.currentTime - t0;
        let activeI = null;
        let activeSyl = null;
        for (const key of keys) {
          const baseOffset =
            keyIndex == null ? 0 : -(key.syllableOffsetsSec?.[0] || 0);
          const kStart = (key.keyStartSec || 0) + baseOffset;
          const kEnd = (key.keyEndSec || 0) + baseOffset - 0.02;
          if (elapsed >= kStart && elapsed < kEnd) {
            activeI = key._i;
            for (let j = 0; j < key.notes.length; j++) {
              const s0 = (key.syllableOffsetsSec[j] || 0) + baseOffset;
              const s1 = s0 + (key.beats[j] || 0) * (tune.secPerBeat || 0.4);
              if (elapsed >= s0 && elapsed < s1) {
                activeSyl = j;
                break;
              }
            }
            break;
          }
        }
        hooks.onHighlight(activeI, activeSyl);
        if (elapsed < lastEnd + 0.05) {
          requestAnimationFrame(paint);
        } else {
          hooks.onHighlight(null, null);
          hooks.onDone?.();
        }
      };
      requestAnimationFrame(paint);
    } else {
      const ms = Math.max(50, lastEnd * 1000 + 40);
      setTimeout(() => {
        if (token === playToken) hooks.onDone?.();
      }, ms);
    }
  };

  const stop = () => {
    playToken += 1;
    hooks.onHighlight?.(null, null);
  };

  if (ctx.state === "suspended") {
    void ctx.resume().then(schedule).catch(() => hooks.onDone?.());
  } else {
    schedule();
  }
  return stop;
}

function stopAllTunes() {
  playToken += 1;
}

/** Split caption on · / middot for karaoke syllable spans. */
function captionSyllables(caption) {
  const raw = String(caption || "").trim();
  if (!raw) return [];
  return raw
    .split(/\s*·\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function renderCaptionHtml(caption) {
  const parts = captionSyllables(caption);
  if (!parts.length) return "";
  if (parts.length === 1) {
    return `<span class="ref-tune-caption">${esc(parts[0])}</span>`;
  }
  const spans = parts
    .map(
      (p, j) =>
        `<span class="ref-tune-syl" data-ref-tune-syl="${j}">${esc(p)}</span>`
    )
    .join(`<span class="ref-tune-syl-sep" aria-hidden="true">·</span>`);
  return `<span class="ref-tune-caption">${spans}</span>`;
}

/**
 * HTML for the Learn tune card (mount point for interactivity).
 * @param {object} tune
 */
export function renderTuneCardHtml(tune) {
  if (!tune?.keys?.length) return "";
  const showCaptions = tune.keys.some((k) => k.caption);
  const badges = [
    tune.key ? `<span class="ref-tune-badge">${esc(tune.key)}</span>` : "",
    tune.timeSignature
      ? `<span class="ref-tune-badge">${esc(tune.timeSignature)}</span>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const keysHtml = tune.keys
    .map((k, i) => {
      const variant = k.variant === "filler" ? " is-filler" : " is-target";
      const caption = showCaptions ? renderCaptionHtml(k.caption || "") : "";
      const breakEl = k.lineBreakBefore
        ? `<span class="ref-tune-break" aria-hidden="true"></span>`
        : "";
      return `${breakEl}
      <button type="button"
        class="ref-tune-key${variant}${showCaptions ? " has-caption" : ""}"
        data-ref-tune-key="${i}"
        aria-label="Play ${esc(k.word)}">
        ${k.label ? `<span class="ref-tune-label">${esc(k.label)}</span>` : ""}
        <span class="ref-tune-word" lang="de">${esc(k.word)}</span>
        ${caption}
      </button>`;
    })
    .join("");

  return `
    <section class="ref-tune" data-ref-tune>
      <div class="ref-tune-head">
        <div class="ref-tune-copy">
          <h4 class="ref-tune-title">${esc(tune.title)}</h4>
          ${
            tune.subtitle
              ? `<p class="ref-tune-subtitle">${esc(tune.subtitle)}</p>`
              : ""
          }
          ${badges ? `<div class="ref-tune-badges">${badges}</div>` : ""}
        </div>
        <button type="button" class="btn btn-primary ref-tune-play" data-ref-tune-play>
          Play phrase
        </button>
      </div>
      <div class="ref-tune-keys" role="group" aria-label="Mnemonic keys">${keysHtml}</div>
    </section>`;
}

/**
 * Wire all `[data-ref-tune]` cards inside a Learn root.
 * @param {HTMLElement|null} root
 * @param {{ getTune?: (el: Element) => object|null }} [opts]
 */
export function mountReferenceTunes(root, opts = {}) {
  if (!root) return;
  stopAllTunes();
  root.querySelectorAll("[data-ref-tune]").forEach((card) => {
    const tune =
      opts.getTune?.(card) ||
      (card.__tuneData ? card.__tuneData : null);
    if (!tune?.keys?.length) return;

    const setActive = (i, syl) => {
      card.querySelectorAll("[data-ref-tune-key]").forEach((btn) => {
        const idx = Number(btn.getAttribute("data-ref-tune-key"));
        const on = i != null && idx === i;
        btn.classList.toggle("is-active", on);
        btn.classList.toggle("is-syl-0", on && syl === 0);
        btn.classList.toggle("is-syl-1", on && syl === 1);
        btn.classList.toggle("is-syl-2", on && syl === 2);
        btn.querySelectorAll("[data-ref-tune-syl]").forEach((span) => {
          const j = Number(span.getAttribute("data-ref-tune-syl"));
          span.classList.toggle("is-live", on && syl === j);
        });
      });
    };

    let stop = null;
    const play = (keyIndex) => {
      stop?.();
      setActive(null, null);
      stop = playReferenceTune(tune, keyIndex, {
        onHighlight: setActive,
        onDone: () => setActive(null, null),
      });
    };

    card.querySelector("[data-ref-tune-play]")?.addEventListener("click", () => {
      play(undefined);
    });
    card.querySelectorAll("[data-ref-tune-key]").forEach((btn) => {
      btn.addEventListener("click", () => {
        play(Number(btn.getAttribute("data-ref-tune-key")));
      });
    });
  });
}

/**
 * Attach compiled tune data onto the card element for mounting.
 * @param {HTMLElement|null} root
 * @param {object|null} tune
 */
export function bindTuneData(root, tune) {
  if (!root || !tune) return;
  const card = root.querySelector("[data-ref-tune]");
  if (card) card.__tuneData = tune;
}
