import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PIPER_SHORT_LENGTH_SCALE,
  isShortPiperUtterance,
  piperLengthScaleFor,
  piperProsodyText,
} from "./piper-tts.js";

describe("piperProsodyText", () => {
  it("adds a period to short lines without sentence punctuation", () => {
    assert.equal(piperProsodyText("Ja"), "Ja.");
    assert.equal(piperProsodyText("drei"), "drei.");
    assert.equal(piperProsodyText("der Hund"), "der Hund.");
    assert.equal(piperProsodyText("Sehr gut"), "Sehr gut.");
  });

  it("leaves punctuated and longer lines alone", () => {
    assert.equal(piperProsodyText("Ja!"), "Ja!");
    assert.equal(piperProsodyText("Sehr gut."), "Sehr gut.");
    assert.equal(piperProsodyText("Weiter so!"), "Weiter so!");
    const long =
      "Ich zähle bis einhundert und dann noch ein bisschen weiter";
    assert.equal(piperProsodyText(long), long);
  });
});

describe("piperLengthScaleFor", () => {
  it("boosts length_scale on short utterances", () => {
    assert.equal(isShortPiperUtterance("Ja"), true);
    assert.equal(isShortPiperUtterance("Ja."), true);
    assert.equal(
      piperLengthScaleFor("Ja", { rate: 1, baseLengthScale: 1 }),
      PIPER_SHORT_LENGTH_SCALE
    );
    assert.equal(
      piperLengthScaleFor("drei.", { rate: 1, baseLengthScale: 1 }),
      PIPER_SHORT_LENGTH_SCALE
    );
  });

  it("keeps the normal scale on longer lines", () => {
    const long =
      "Ich zähle bis einhundert und dann noch ein bisschen weiter";
    assert.equal(isShortPiperUtterance(long), false);
    assert.equal(
      piperLengthScaleFor(long, { rate: 1, baseLengthScale: 1 }),
      1
    );
    assert.equal(
      piperLengthScaleFor("Ja", {
        rate: 1,
        baseLengthScale: 1,
        shortBoost: false,
      }),
      1
    );
  });
});
