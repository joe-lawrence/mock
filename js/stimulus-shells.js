/**
 * Stimulus shells — shared question / cue UIs (spec §7 / Slice 3).
 * Pair with answer-shells.js response hosts.
 */

import { STIMULUS } from "./interaction-presets.js";

export { STIMULUS };

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Mark prompt host as a stimulus shell.
 * @param {HTMLElement} el
 * @param {{ stimulus?: string }} [opts]
 */
export function prepareStimulusHost(el, opts = {}) {
  if (!el) return el;
  const stimulus = opts.stimulus || "";
  // Keep `.prompt` for existing layout; add shell classes for tokens.
  const keep = ["prompt", "stimulus-shell"];
  if (stimulus) keep.push(`stimulus-shell--${stimulus}`);
  el.className = keep.join(" ");
  if (stimulus) el.dataset.stimulus = stimulus;
  else delete el.dataset.stimulus;
  return el;
}

/**
 * Compose cue / visual / ask HTML for a stimulus shell.
 * @param {{
 *   visualHtml?: string,
 *   cueHtml?: string,
 *   askHtml?: string,
 *   ask?: string,
 * }} opts
 */
export function composeStimulusBody(opts = {}) {
  const chunks = [];
  if (opts.visualHtml) {
    chunks.push(
      `<div class="quiz-visual stimulus-shell-visual">${opts.visualHtml}</div>`
    );
  }
  if (opts.cueHtml) {
    chunks.push(`<div class="stimulus-shell-cue">${opts.cueHtml}</div>`);
  }
  const ask =
    opts.askHtml != null
      ? opts.askHtml
      : opts.ask != null
        ? escapeHtml(opts.ask)
        : "";
  if (ask) {
    chunks.push(`<span class="convert-ask stimulus-shell-ask">${ask}</span>`);
  }
  return chunks.join("");
}

/**
 * Mount a stimulus into the prompt host.
 * @param {HTMLElement} el
 * @param {{
 *   stimulus: string,
 *   bodyHtml?: string,
 *   visualHtml?: string,
 *   cueHtml?: string,
 *   askHtml?: string,
 *   ask?: string,
 * }} opts
 */
export function mountStimulusShell(el, opts = {}) {
  const stimulus = opts.stimulus || "";
  prepareStimulusHost(el, { stimulus });
  el.innerHTML =
    opts.bodyHtml != null ? opts.bodyHtml : composeStimulusBody(opts);
  return { host: el, stimulus };
}

export function mountValueStimulus(el, opts = {}) {
  return mountStimulusShell(el, { ...opts, stimulus: STIMULUS.VALUE });
}

export function mountDigitStimulus(el, opts = {}) {
  return mountStimulusShell(el, { ...opts, stimulus: STIMULUS.DIGIT });
}

export function mountTtsStimulus(el, opts = {}) {
  return mountStimulusShell(el, { ...opts, stimulus: STIMULUS.TTS });
}

export function mountVisualStimulus(el, opts = {}) {
  return mountStimulusShell(el, { ...opts, stimulus: STIMULUS.VISUAL });
}

export function mountProofreadStimulus(el, opts = {}) {
  return mountStimulusShell(el, {
    ...opts,
    stimulus: STIMULUS.PROOFREAD_FRAME,
  });
}

export function mountSentenceStimulus(el, opts = {}) {
  return mountStimulusShell(el, { ...opts, stimulus: STIMULUS.SENTENCE });
}

export function mountClozeStimulus(el, opts = {}) {
  return mountStimulusShell(el, { ...opts, stimulus: STIMULUS.CLOZE_FRAME });
}
