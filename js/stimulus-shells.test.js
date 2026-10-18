import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  STIMULUS,
  prepareStimulusHost,
  composeStimulusBody,
  mountStimulusShell,
  mountVisualStimulus,
  mountDigitStimulus,
} from "./stimulus-shells.js";
import { INTERACTION_PRESETS } from "./interaction-presets.js";

function stubHost() {
  const classSet = new Set();
  const el = {
    dataset: {},
    classList: {
      add(...xs) {
        xs.forEach((x) => classSet.add(x));
      },
      contains(x) {
        return classSet.has(x);
      },
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
    },
  });
  return el;
}

describe("stimulus shells (Slice 3)", () => {
  it("presets point at known stimulus ids", () => {
    assert.equal(INTERACTION_PRESETS.convert.stimulus, STIMULUS.DIGIT);
    assert.equal(INTERACTION_PRESETS.listen.stimulus, STIMULUS.TTS);
    assert.equal(INTERACTION_PRESETS.visual.stimulus, STIMULUS.VISUAL);
    assert.equal(
      INTERACTION_PRESETS.proofread.stimulus,
      STIMULUS.PROOFREAD_FRAME
    );
    assert.equal(INTERACTION_PRESETS.sentence.stimulus, STIMULUS.SENTENCE);
    assert.equal(INTERACTION_PRESETS.build.stimulus, STIMULUS.VALUE);
  });

  it("prepareStimulusHost marks dataset + classes", () => {
    const el = stubHost();
    prepareStimulusHost(el, { stimulus: STIMULUS.DIGIT });
    assert.equal(el.dataset.stimulus, STIMULUS.DIGIT);
    assert.ok(el.classList.contains("stimulus-shell"));
    assert.ok(el.classList.contains("stimulus-shell--digit"));
    assert.ok(el.classList.contains("prompt"));
  });

  it("composeStimulusBody joins visual, cue, ask", () => {
    const html = composeStimulusBody({
      visualHtml: "<svg></svg>",
      cueHtml: "<strong>8:10</strong>",
      ask: "Name what you see",
    });
    assert.match(html, /quiz-visual/);
    assert.match(html, /stimulus-shell-cue/);
    assert.match(html, /Name what you see/);
  });

  it("mountStimulusShell / mountVisualStimulus fill host", () => {
    const el = stubHost();
    mountVisualStimulus(el, {
      visualHtml: "<svg id=c></svg>",
      ask: "Name what you see",
    });
    assert.equal(el.dataset.stimulus, STIMULUS.VISUAL);
    assert.match(el.innerHTML, /id=c/);
    assert.match(el.innerHTML, /Name what you see/);
  });

  it("mountDigitStimulus accepts precomposed bodyHtml", () => {
    const el = stubHost();
    mountDigitStimulus(el, { bodyHtml: "<strong>42</strong>" });
    assert.equal(el.dataset.stimulus, STIMULUS.DIGIT);
    assert.equal(el.innerHTML, "<strong>42</strong>");
  });

  it("escapes plain ask text", () => {
    const html = composeStimulusBody({ ask: 'a <b> & "x"' });
    assert.match(html, /a &lt;b&gt; &amp; &quot;x&quot;/);
  });
});
