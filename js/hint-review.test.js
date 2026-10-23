import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hintSamplesForUnit } from "./hint-review.js";

describe("hint review samples", () => {
  it("fills the compound cardinal template with that number’s pieces", () => {
    const samples = hintSamplesForUnit("numbers", "cardinals", "compounds");
    assert.equal(samples[0].sample, "42");
    assert.match(samples[0].hint, /^Ones \+ und \+ tens: .+\.$/);
    assert.match(samples[1].hint, /Reuse stems when the tens word splits/);
  });

  it("uses the plural Help sentences the quiz shows", () => {
    const patterns = hintSamplesForUnit("nouns", "plurals", "plural-patterns");
    assert.match(patterns[0].hint, /usually forms/);
    const real = hintSamplesForUnit("nouns", "plurals", "plural-real-words");
    assert.match(real.find((s) => s.sample === "Zeitung").hint, /die/);
    assert.match(real.find((s) => s.sample === "Fahrer").hint, /same form/);
  });

  it("covers every playable numbers unit", () => {
    const units = [
      ["cardinals", "base"],
      ["cardinals", "teens"],
      ["cardinals", "tens"],
      ["cardinals", "compounds"],
      ["cardinals", "hundreds"],
      ["decimals", "komma-read"],
      ["decimals", "place-value"],
      ["decimals", "money-euros"],
      ["decimals", "money-cents"],
      ["fractions", "half-quarter"],
      ["fractions", "unit-fractions"],
      ["fractions", "proper-fractions"],
      ["fractions", "mixed-numbers"],
      ["time", "whole-hours"],
      ["time", "half-past"],
      ["time", "quarters"],
      ["time", "minutes"],
      ["time", "digital-24h"],
      ["time", "duration"],
      ["dates", "weekdays"],
      ["dates", "months"],
      ["measurement", "length"],
      ["measurement", "weight"],
      ["measurement", "volume"],
      ["measurement", "temp-speed"],
      ["ordinals", "ordinal-1-12"],
      ["ordinals", "ordinal-teens"],
      ["ordinals", "ordinal-tens"],
      ["ordinals", "ordinal-compounds"],
    ];
    for (const [topic, unit] of units) {
      const samples = hintSamplesForUnit("numbers", topic, unit);
      assert.ok(samples.length, `${topic}/${unit}`);
      for (const s of samples) assert.ok(s.hint.trim(), s.sample);
    }
  });
});
