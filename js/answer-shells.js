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
 * Normalize a multi-select choice to { value, label, caption }.
 * @param {string|number|{ value?: string|number, id?: string|number, label?: string, caption?: string, sub?: string }} choice
 */
export function normalizeMultiSelectChoice(choice) {
  if (choice != null && typeof choice === "object") {
    const value = String(choice.value ?? choice.id ?? "");
    const out = {
      value,
      label: String(choice.label ?? value),
      caption:
        choice.caption != null
          ? String(choice.caption)
          : choice.sub != null
            ? String(choice.sub)
            : "",
    };
    if (choice.iconHtml) out.iconHtml = String(choice.iconHtml);
    if (choice.ariaLabel) out.ariaLabel = String(choice.ariaLabel);
    return out;
  }
  const value = String(choice);
  return { value, label: value, caption: "" };
}

/**
 * Multi-select choice buttons.
 * @param {HTMLElement} host
 * @param {{
 *   choices: (string|number|{ value?: string|number, id?: string|number, label?: string, caption?: string, sub?: string })[],
 *   ariaLabel?: string,
 *   stacked?: boolean,
 *   multiple?: boolean,
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
  for (const raw of choices) {
    const { value, label, caption, iconHtml, ariaLabel } = normalizeMultiSelectChoice(raw);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice answer-shell-choice";
    btn.dataset.value = value;
    if (opts.multiple) btn.setAttribute("aria-pressed", "false");
    if (caption || iconHtml) {
      if (caption) btn.classList.add("has-caption");
      const main = document.createElement("span");
      main.className = "choice-label";
      if (iconHtml) main.innerHTML = iconHtml;
      else main.textContent = label;
      btn.appendChild(main);
      if (caption) {
        const sub = document.createElement("span");
        sub.className = "choice-sub";
        sub.textContent = caption;
        btn.appendChild(sub);
      }
      btn.setAttribute(
        "aria-label",
        ariaLabel || (caption ? `${label}, ${caption}` : label)
      );
    } else {
      btn.textContent = label;
    }
    btn.addEventListener("click", () => {
      if (opts.isDisabled?.()) return;
      if (opts.multiple) {
        const pressed = btn.getAttribute("aria-pressed") === "true";
        const next = !pressed;
        btn.setAttribute("aria-pressed", next ? "true" : "false");
        btn.classList.toggle("is-filled", next);
      }
      opts.onPick(value, btn);
    });
    host.appendChild(btn);
    buttons.push(btn);
  }
  return { host, buttons };
}

/** Caption for an empty phrase slot: Part 1, Part 2, … */
export function partSlotLabel(index) {
  return `Part ${Number(index) + 1}`;
}

/**
 * Show a picked word in a phrase slot, or restore the Part N caption.
 * `display` is the visible text when it differs from the word (soft hyphens).
 * @param {HTMLElement} slot
 * @param {string} [text]
 * @param {string} [display]
 */
export function paintPartSlot(slot, text, display) {
  if (!slot) return;
  const index = Number(slot.dataset?.index || 0);
  const word = String(text || "").trim();
  slot.classList.remove("is-ok", "is-bad", "is-correct-flash", "is-wrong-flash");
  const valueEl = slot.querySelector?.(".slot-value");
  if (valueEl) {
    valueEl.textContent = word ? (display != null ? String(display) : word) : "";
    slot.classList.toggle("is-filled", !!word);
    if (word) slot.setAttribute("aria-label", `${word}, tap to remove`);
    else if (slot.dataset?.slotLabel) slot.setAttribute("aria-label", slot.dataset.slotLabel);
    else slot.removeAttribute("aria-label");
    return;
  }
  if (word) {
    slot.classList.add("is-filled");
    slot.textContent = display != null ? String(display) : word;
    slot.setAttribute("aria-label", `${word}, tap to remove`);
    return;
  }
  slot.classList.remove("is-filled");
  slot.textContent = partSlotLabel(index);
  slot.removeAttribute("aria-label");
}

/**
 * Phrase slots shared by build and multi-select quizzes.
 * Empty slots read Part 1, Part 2, … A pick replaces that caption.
 * @param {HTMLElement} host
 * @param {{
 *   count?: number,
 *   values?: (string|null|undefined)[],
 *   className?: string,
 *   captions?: string[],
 *   captionLabels?: string[],
 *   onClear?: (index: number, slot: HTMLElement) => void,
 * }} [opts]
 */
export function mountPartSlots(host, opts = {}) {
  if (!host) return { host, slots: [] };
  const values = opts.values || [];
  const count = Math.max(opts.count || values.length || 1, 1);
  host.hidden = false;
  host.className = opts.className || "slot-row";
  host.innerHTML = "";
  if (!host.getAttribute("aria-label")) {
    host.setAttribute("aria-label", "Phrase slots");
  }
  const captions = opts.captions || [];
  const captionLabels = opts.captionLabels || [];
  const slots = [];
  for (let i = 0; i < count; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.tabIndex = 0;
    if (captionLabels[i]) slot.dataset.slotLabel = String(captionLabels[i]);
    if (captions[i]) {
      slot.classList.add("slot-labeled");
      const caption = document.createElement("span");
      caption.className = "slot-caption";
      caption.innerHTML = captions[i];
      const value = document.createElement("span");
      value.className = "slot-value";
      slot.append(caption, value);
    }
    paintPartSlot(slot, values[i] || "");
    const clear = () => opts.onClear?.(i, slot);
    slot.addEventListener("click", clear);
    slot.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault?.();
      clear();
    });
    host.appendChild(slot);
    slots.push(slot);
  }
  return { host, slots };
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

const ICON_THUMBS_UP = `<svg xmlns="http://www.w3.org/2000/svg" class="piece-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M13.11 5.72l-.57 2.89c-.12.59.04 1.2.42 1.66.38.46.94.73 1.54.73H20v1.08L17.43 18H9.34c-.18 0-.34-.16-.34-.34V9.82l4.11-4.1M14 2L7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.83C7 18.95 8.05 20 9.34 20h8.1c.71 0 1.36-.37 1.72-.97l2.67-6.15c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2zM4 9H2v11h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1z"/></svg>`;

const ICON_THUMBS_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" class="piece-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.58-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L11.77 14H3v-2l3-7h9v10zm4-12h4v12h-4z"/></svg>`;

function escapeButtonText(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Richtig/Falsch and the English synonyms used by older judgment chips. */
export function isJudgmentChoiceLabel(value, label) {
  const s = `${value || ""} ${label || ""}`.toLowerCase();
  return /\b(richtig|falsch|correct|incorrect|true|false)\b/.test(s);
}

function isPositiveJudgmentLabel(value, label) {
  const s = `${value || ""} ${label || ""}`.toLowerCase();
  return /\b(richtig|correct|true)\b/.test(s);
}

/**
 * A choice or true/false second chance stays available only while two or
 * more options are still open. A choice is closed when it is the one just
 * missed, or already marked incorrect (`is-bad`).
 * @param {Iterable<Element>} choices
 * @param {Element | null} [justWrong]
 */
export function choiceSecondChanceOpen(choices, justWrong = null) {
  let open = 0;
  for (const el of choices || []) {
    if (!el || el === justWrong) continue;
    if (el.classList?.contains("is-bad")) continue;
    open += 1;
    if (open >= 2) return true;
  }
  return false;
}

/**
 * Thumbs-up / thumbs-down plus the German label.
 * Material Design Icons thumb_up / thumb_down — Apache License 2.0.
 * @param {HTMLElement} btn
 * @param {string} value
 * @param {string} [label]
 */
export function paintJudgmentButton(btn, value, label) {
  const text = label || value;
  btn.classList.add("piece-judgment");
  btn.innerHTML = `${
    isPositiveJudgmentLabel(value, text) ? ICON_THUMBS_UP : ICON_THUMBS_DOWN
  }<span class="piece-label" lang="de">${escapeButtonText(text)}</span>`;
  btn.setAttribute("aria-label", text);
}

/**
 * Binary / two-option choices (e.g. Richtig / Falsch).
 * Judgment labels use the shared thumbs control.
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
    btn.dataset.id = opt.value;
    if (isJudgmentChoiceLabel(opt.value, opt.label)) {
      paintJudgmentButton(btn, opt.value, opt.label);
    } else {
      btn.textContent = opt.label;
    }
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
