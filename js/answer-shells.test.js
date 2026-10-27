import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RESPONSE,
  prepareAnswerHost,
  mountMultiSelectShell,
  normalizeMultiSelectChoice,
  mountFreeformShell,
  mountBuildChipsShell,
  mountBinaryShell,
  mountPartSlots,
  paintPartSlot,
  paintJudgmentButton,
  isJudgmentChoiceLabel,
  choiceSecondChanceOpen,
  markQuizStage,
} from "./answer-shells.js";
import { INTERACTION_PRESETS, STIMULUS } from "./interaction-presets.js";
import {
  modesForStep,
  isNumbersCellPlayable,
  NUMBERS_TOPICS,
} from "./numbers-curriculum.js";

/** Tiny DOM stub sufficient for answer-shell mounts. */
function stubHost() {
  const classSet = new Set();
  const el = {
    dataset: {},
    children: [],
    classList: {
      add(...xs) {
        xs.forEach((x) => classSet.add(x));
      },
      contains(x) {
        return classSet.has(x);
      },
    },
    setAttribute(k, v) {
      this._attrs = this._attrs || {};
      this._attrs[k] = v;
    },
    getAttribute(k) {
      return this._attrs?.[k];
    },
    removeAttribute(k) {
      if (this._attrs) delete this._attrs[k];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    append(...nodes) {
      nodes.forEach((n) => this.appendChild(n));
    },
  };
  Object.defineProperty(el, "className", {
    get() {
      return [...classSet].join(" ");
    },
    set(v) {
      classSet.clear();
      String(v || "")
        .split(/\s+/)
        .filter(Boolean)
        .forEach((c) => classSet.add(c));
    },
  });
  Object.defineProperty(el, "innerHTML", {
    get() {
      return this._html || "";
    },
    set(v) {
      this._html = v;
      if (v === "") this.children = [];
    },
  });

  globalThis.document = {
    createElement(tag) {
      const classSet = new Set();
      const node = {
        tagName: tag.toUpperCase(),
        type: "",
        id: "",
        className: "",
        textContent: "",
        value: "",
        dataset: {},
        disabled: false,
        children: [],
        _attrs: {},
        _listeners: {},
        classList: {
          add(...xs) {
            xs.forEach((x) => classSet.add(x));
            node.className = [...classSet].join(" ");
          },
          remove(...xs) {
            xs.forEach((x) => classSet.delete(x));
            node.className = [...classSet].join(" ");
          },
          contains(x) {
            return classSet.has(x);
          },
        },
        removeAttribute(k) {
          delete this._attrs[k];
        },
        setAttribute(k, v) {
          this._attrs[k] = v;
          this[k] = v;
        },
        getAttribute(k) {
          return this._attrs[k];
        },
        appendChild(child) {
          this.children.push(child);
          return child;
        },
        addEventListener(type, fn) {
          this._listeners[type] = this._listeners[type] || [];
          this._listeners[type].push(fn);
        },
        click() {
          (this._listeners.click || []).forEach((fn) => fn({}));
        },
      };
      Object.defineProperty(node, "className", {
        get() {
          return [...classSet].join(" ");
        },
        set(v) {
          classSet.clear();
          String(v || "")
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => classSet.add(c));
        },
      });
      return node;
    },
  };
  return el;
}

describe("answer shells (Slice 2)", () => {
  it("defines visual-freeform as visual × freeform", () => {
    const p = INTERACTION_PRESETS["visual-freeform"];
    assert.equal(p.stimulus, STIMULUS.VISUAL);
    assert.equal(p.response, RESPONSE.FREEFORM);
    assert.equal(p.playable, true);
  });

  it("adds visual-freeform on Time / Fractions; cloze removed (141 cells)", () => {
    assert.ok(
      modesForStep("time", "minutes").some((m) => m.id === "visual-freeform")
    );
    assert.ok(isNumbersCellPlayable("time", "whole-hours", "visual-freeform"));
    assert.ok(!modesForStep("cardinals", "base").some((m) => m.id === "cloze"));
    let n = 0;
    for (const t of NUMBERS_TOPICS) {
      for (const s of t.steps) {
        for (const m of modesForStep(t.id, s.id)) {
          if (isNumbersCellPlayable(t.id, s.id, m.id)) n++;
        }
      }
    }
    // 148 − 12 am-dative date/ordinal cells
    assert.equal(n, 136);
  });

  it("mountPartSlots shows Part captions and a pick replaces the caption", () => {
    const host = stubHost();
    const { slots } = mountPartSlots(host, { count: 2 });
    assert.equal(slots.length, 2);
    assert.equal(slots[0].textContent, "Part 1");
    assert.equal(slots[1].textContent, "Part 2");
    assert.equal(host.className, "slot-row");
    paintPartSlot(slots[0], "den");
    assert.equal(slots[0].textContent, "den");
    assert.equal(slots[0].classList.contains("is-filled"), true);
    paintPartSlot(slots[0], "dreiundzwanzig", "drei\u00adundzwanzig");
    assert.equal(slots[0].textContent, "drei\u00adundzwanzig");
    assert.equal(slots[0].getAttribute("aria-label"), "dreiundzwanzig, tap to remove");
    paintPartSlot(slots[0], "");
    assert.equal(slots[0].textContent, "Part 1");
    assert.equal(slots[0].classList.contains("is-filled"), false);
  });

  it("mountMultiSelectShell creates choice buttons", () => {
    const host = stubHost();
    let picked = null;
    const { buttons } = mountMultiSelectShell(host, {
      choices: ["a", "b"],
      onPick: (c) => {
        picked = c;
      },
    });
    assert.equal(buttons.length, 2);
    assert.ok(host.classList.contains("answer-shell--multi-select"));
    assert.ok(host.classList.contains("tray"));
    buttons[1].click();
    assert.equal(picked, "b");
  });

  it("mountMultiSelectShell supports optional captions (sub)", () => {
    const host = stubHost();
    const { buttons } = mountMultiSelectShell(host, {
      choices: [
        { id: "back", label: "ü", caption: "back, rounded" },
        { value: "front", label: "u", sub: "front, unrounded" },
      ],
      onPick: () => {},
    });
    assert.equal(buttons.length, 2);
    assert.ok(buttons[0].classList.contains("has-caption"));
    assert.equal(buttons[0].dataset.value, "back");
    assert.equal(buttons[0].getAttribute("aria-label"), "ü, back, rounded");
    assert.equal(buttons[0].children[0].className, "choice-label");
    assert.equal(buttons[0].children[0].textContent, "ü");
    assert.equal(buttons[0].children[1].className, "choice-sub");
    assert.equal(buttons[0].children[1].textContent, "back, rounded");
    assert.ok(buttons[1].classList.contains("has-caption"));
    assert.equal(buttons[1].dataset.value, "front");
    assert.equal(buttons[1].children[1].textContent, "front, unrounded");
  });

  it("normalizeMultiSelectChoice maps id/sub aliases", () => {
    assert.deepEqual(normalizeMultiSelectChoice("x"), {
      value: "x",
      label: "x",
      caption: "",
    });
    assert.deepEqual(
      normalizeMultiSelectChoice({ id: "a", label: "A", sub: "hint" }),
      { value: "a", label: "A", caption: "hint" }
    );
  });

  it("mountBuildChipsShell creates piece buttons", () => {
    const host = stubHost();
    let picked = null;
    const { buttons } = mountBuildChipsShell(host, {
      chips: ["drei", "und", "zwanzig"],
      formatLabel: (t) => `«${t}»`,
      onPick: (t) => {
        picked = t;
      },
    });
    assert.equal(buttons.length, 3);
    assert.ok(host.classList.contains("answer-shell--build-chips"));
    assert.equal(host.dataset.response, RESPONSE.BUILD_CHIPS);
    assert.equal(buttons[0].textContent, "«drei»");
    buttons[2].click();
    assert.equal(picked, "zwanzig");
  });

  it("mountFreeformShell submits on Check", () => {
    const host = stubHost();
    let submitted = null;
    const { input, checkBtn } = mountFreeformShell(host, {
      onSubmit: (v) => {
        submitted = v;
      },
    });
    input.value = "drei Uhr";
    checkBtn.click();
    assert.equal(submitted, "drei Uhr");
    assert.ok(host.classList.contains("answer-shell--freeform"));
  });

  it("mountBinaryShell and markQuizStage set datasets", () => {
    const host = stubHost();
    const { buttons } = mountBinaryShell(host, {
      options: [
        { value: "ok", label: "Richtig" },
        { value: "bad", label: "Falsch" },
      ],
      onPick: () => {},
    });
    assert.ok(host.classList.contains("answer-shell--binary"));
    assert.equal(isJudgmentChoiceLabel("Richtig", "Richtig"), true);
    assert.match(buttons[0].innerHTML, /piece-icon/);
    assert.match(buttons[1].innerHTML, /piece-icon/);
    assert.equal(buttons[0].getAttribute("aria-label"), "Richtig");
    assert.equal(buttons[1].getAttribute("aria-label"), "Falsch");
    assert.equal(buttons[0].classList.contains("piece-judgment"), true);
    paintJudgmentButton(buttons[0], "Falsch", "Falsch");
    assert.equal(buttons[0].getAttribute("aria-label"), "Falsch");
    const stage = stubHost();
    markQuizStage(stage, {
      presetId: "visual-freeform",
      stimulus: "visual",
      response: "freeform",
    });
    assert.equal(stage.dataset.preset, "visual-freeform");
    assert.equal(stage.dataset.response, "freeform");
    prepareAnswerHost(host, { response: RESPONSE.FREEFORM });
    assert.equal(host.dataset.response, RESPONSE.FREEFORM);
  });

  it("withholds a second chance when fewer than two choices stay open", () => {
    const binary = stubHost();
    const { buttons } = mountBinaryShell(binary, {
      options: [
        { value: "Richtig", label: "Richtig" },
        { value: "Falsch", label: "Falsch" },
      ],
      onPick: () => {},
    });
    buttons[1].classList.add("is-bad");
    assert.equal(choiceSecondChanceOpen(buttons, buttons[1]), false);

    const multi = stubHost();
    const { buttons: choices } = mountMultiSelectShell(multi, {
      choices: ["den", "dem", "die", "das"],
      onPick: () => {},
    });
    assert.equal(choiceSecondChanceOpen(choices, choices[0]), true);
    choices[1].classList.add("is-bad");
    choices[2].classList.add("is-bad");
    assert.equal(choiceSecondChanceOpen(choices, choices[0]), false);
  });
});
