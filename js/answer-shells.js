/**
 * Answer shells — shared response UIs (spec §7 / Slice 2).
 * Pair with stimulus-shells.js (Slice 3) for question cues.
 */

import { RESPONSE } from "./interaction-presets.js";

export { RESPONSE };

/**
 * Reset the tray as an answer-shell host.
 * @param {HTMLElement} tray
 * @param {{ response: string, stacked?: boolean }} opts
 */
export function prepareAnswerHost(tray, opts) {
  if (!tray) return tray;
  const response = opts?.response || "";
  tray.innerHTML = "";
  tray.className = [
    "tray",
    "answer-shell",
    response ? `answer-shell--${response}` : "",
    opts?.stacked ? "is-stacked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  tray.dataset.response = response;
  return tray;
}

/**
 * Multi-select choice buttons.
 * @param {HTMLElement} host
 * @param {{
 *   choices: (string|number)[],
 *   ariaLabel?: string,
 *   stacked?: boolean,
 *   isDisabled?: () => boolean,
 *   onPick: (choice: string, btn: HTMLButtonElement) => void,
 * }} opts
 */
export function mountMultiSelectShell(host, opts) {
  const choices = opts.choices || [];
  prepareAnswerHost(host, {
    response: RESPONSE.MULTI_SELECT,
    stacked: opts.stacked,
  });
  if (opts.ariaLabel) host.setAttribute("aria-label", opts.ariaLabel);
  else host.removeAttribute("aria-label");

  const buttons = [];
  for (const choice of choices) {
    const label = String(choice);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice answer-shell-choice";
    btn.dataset.value = label;
    btn.textContent = label;
    btn.addEventListener("click", () => {
      if (opts.isDisabled?.()) return;
      opts.onPick(label, btn);
    });
    host.appendChild(btn);
    buttons.push(btn);
  }
  return { host, buttons };
}

/**
 * Build-chip tray (pick pieces into slots).
 * @param {HTMLElement} host
 * @param {{
 *   chips: string[],
 *   ariaLabel?: string,
 *   idPrefix?: string,
 *   formatLabel?: (text: string) => string,
 *   isDisabled?: () => boolean,
 *   onPick: (text: string, btn: HTMLButtonElement) => void,
 * }} opts
 */
export function mountBuildChipsShell(host, opts) {
  prepareAnswerHost(host, { response: RESPONSE.BUILD_CHIPS });
  if (opts.ariaLabel) host.setAttribute("aria-label", opts.ariaLabel);
  else host.removeAttribute("aria-label");

  const buttons = [];
  (opts.chips || []).forEach((text, i) => {
    const label = String(text);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "piece answer-shell-piece";
    btn.dataset.id = `${opts.idPrefix || "chip"}${i}`;
    btn.dataset.text = label;
    btn.textContent = opts.formatLabel ? opts.formatLabel(label) : label;
    btn.addEventListener("click", () => {
      if (opts.isDisabled?.()) return;
      opts.onPick(label, btn);
    });
    host.appendChild(btn);
    buttons.push(btn);
  });
  return { host, buttons };
}

/**
 * Freeform text + Check.
 * @param {HTMLElement} host
 * @param {{
 *   inputId?: string,
 *   checkBtnId?: string,
 *   inputClass?: string,
 *   placeholder?: string,
 *   ariaLabel?: string,
 *   inputMode?: string,
 *   maxLength?: number,
 *   pattern?: string,
 *   assisted?: boolean,
 *   isDisabled?: () => boolean,
 *   onInput?: (value: string, input: HTMLInputElement) => void,
 *   onSubmit: (value: string, input: HTMLInputElement) => void,
 * }} opts
 */
export function mountFreeformShell(host, opts) {
  prepareAnswerHost(host, { response: RESPONSE.FREEFORM });
  host.setAttribute("aria-label", opts.ariaLabel || "Answer");

  const input = document.createElement("input");
  input.type = "text";
  input.id = opts.inputId || "answer-shell-freeform";
  input.className =
    opts.inputClass || "numbers-convert-input answer-shell-input";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.placeholder = opts.placeholder || "Type your answer…";
  if (opts.inputMode) input.inputMode = opts.inputMode;
  if (opts.maxLength != null) input.maxLength = opts.maxLength;
  if (opts.pattern) input.pattern = opts.pattern;
  if (opts.ariaLabel) input.setAttribute("aria-label", opts.ariaLabel);

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "btn btn-primary answer-shell-check";
  if (opts.checkBtnId) checkBtn.id = opts.checkBtnId;
  checkBtn.textContent = "Check";

  const submit = () => {
    if (opts.isDisabled?.()) return;
    opts.onSubmit(input.value, input);
  };

  input.addEventListener("input", () => {
    if (opts.isDisabled?.()) return;
    opts.onInput?.(input.value, input);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    submit();
  });
  checkBtn.addEventListener("click", submit);

  host.append(input, checkBtn);
  return { host, input, checkBtn, submit };
}

/**
 * Binary / two-option choices (e.g. Richtig / Falsch).
 * @param {HTMLElement} host
 * @param {{
 *   options: { value: string, label: string }[],
 *   ariaLabel?: string,
 *   isDisabled?: () => boolean,
 *   onPick: (value: string, btn: HTMLButtonElement) => void,
 * }} opts
 */
export function mountBinaryShell(host, opts) {
  prepareAnswerHost(host, { response: RESPONSE.BINARY });
  if (opts.ariaLabel) host.setAttribute("aria-label", opts.ariaLabel);

  const buttons = [];
  for (const opt of opts.options || []) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice answer-shell-choice";
    btn.dataset.value = opt.value;
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      if (opts.isDisabled?.()) return;
      opts.onPick(opt.value, btn);
    });
    host.appendChild(btn);
    buttons.push(btn);
  }
  return { host, buttons };
}

/**
 * Mark stage with response (and optional stimulus) for CSS / inspection.
 * @param {HTMLElement | null} stage
 * @param {{ stimulus?: string, response?: string, presetId?: string }} ix
 */
export function markQuizStage(stage, ix = {}) {
  if (!stage) return;
  stage.classList.add("quiz-stage");
  if (ix.stimulus) stage.dataset.stimulus = ix.stimulus;
  else delete stage.dataset.stimulus;
  if (ix.response) stage.dataset.response = ix.response;
  else delete stage.dataset.response;
  if (ix.presetId) stage.dataset.preset = ix.presetId;
  else delete stage.dataset.preset;
}
