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

/** Shared listen cue. The thing you heard stays off the screen. */
export const LISTEN_CHOOSE_CUE = "What did you hear?";

/**
 * Format sample inside a listen task line. `lang` empty leaves the sample unmarked.
 * @param {string} example
 * @param {{ lang?: string }} [opts]
 */
export function listenExampleHtml(example, opts = {}) {
  const eg = String(example || "").trim();
  if (!eg) return "";
  const lang = opts.lang == null ? "de" : opts.lang;
  if (!lang) return ` (e.g. ${escapeHtml(eg)})`;
  return ` (e.g. <span lang="${escapeHtml(lang)}">${escapeHtml(eg)}</span>)`;
}

/**
 * Task line under “What did you hear?” — “Pick the article (e.g. die)”.
 * @param {string} task
 * @param {string} [example]
 * @param {{ lang?: string }} [opts]
 */
export function listenChooseAsk(task, example, opts = {}) {
  return `${task || ""}${listenExampleHtml(example, opts)}`;
}

/**
 * Numbers-style listen prompt. Default cue is “What did you hear?”.
 * Pass `cueHtml: ""` when the task line is the whole prompt.
 * @param {HTMLElement} el
 * @param {{
 *   cueHtml?: string,
 *   ask?: string,
 *   askHtml?: string,
 *   task?: string,
 *   example?: string,
 *   lang?: string,
 * }} [opts]
 */
export function mountListenChooseStimulus(el, opts = {}) {
  const cueHtml = opts.cueHtml === undefined ? LISTEN_CHOOSE_CUE : opts.cueHtml;
  const askHtml =
    opts.askHtml != null
      ? opts.askHtml
      : opts.task
        ? listenChooseAsk(opts.task, opts.example, { lang: opts.lang })
        : undefined;
  return mountTtsStimulus(el, {
    cueHtml: cueHtml || undefined,
    askHtml,
    ask: askHtml == null ? opts.ask : undefined,
  });
}

/**
 * Centered Play control used by every Listen & choose quiz.
 * @param {HTMLElement} host
 * @param {{
 *   id?: string,
 *   label?: string,
 *   className?: string,
 *   isDisabled?: () => boolean,
 *   onPlay?: () => void,
 * }} [opts]
 */
export function mountListenPlayButton(host, opts = {}) {
  if (!host) return null;
  host.hidden = false;
  host.className = opts.className || "numbers-listen-play";
  host.innerHTML = "";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-primary play-btn";
  if (opts.id) btn.id = opts.id;
  btn.textContent = opts.label || "Play";
  const fire = () => {
    if (opts.isDisabled?.()) return;
    opts.onPlay?.();
  };
  btn.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    fire();
  });
  btn.addEventListener("click", fire);
  host.appendChild(btn);
  return btn;
}
