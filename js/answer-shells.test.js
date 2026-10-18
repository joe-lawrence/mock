import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RESPONSE,
  prepareAnswerHost,
  mountMultiSelectShell,
  mountFreeformShell,
  mountBuildChipsShell,
  mountBinaryShell,
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
      const node = {
        tagName: tag.toUpperCase(),
        type: "",
        id: "",
        className: "",
        textContent: "",
        value: "",
        dataset: {},
        disabled: false,
        _listeners: {},
        setAttribute(k, v) {
          this[k] = v;
        },
        addEventListener(type, fn) {
          this._listeners[type] = this._listeners[type] || [];
          this._listeners[type].push(fn);
        },
        click() {
          (this._listeners.click || []).forEach((fn) => fn({}));
        },
      };
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
    assert.equal(n, 141);
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
    mountBinaryShell(host, {
      options: [
        { value: "ok", label: "Richtig" },
        { value: "bad", label: "Falsch" },
      ],
      onPick: () => {},
    });
    assert.ok(host.classList.contains("answer-shell--binary"));
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
});
