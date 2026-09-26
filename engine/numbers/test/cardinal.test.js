import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cardinalForm,
  cardinalAnalysis,
  parseCardinalForm,
  constructionParts,
  evaluateCardinalConstruction,
  recordNumberAttempt,
  constructionExercise,
  ENGINE_VERSION,
  DATA_VERSION,
} from "../index.js";
import { TENS, TENS_MORPH, TEEN_PREFIX, COMPOUND_ONES } from "../data.js";
import { CARDINAL_FORMS_0_99 } from "./fixtures-0-99.js";

describe("cardinalForm 0–99", () => {
  it("matches frozen fixtures for every n", () => {
    assert.equal(CARDINAL_FORMS_0_99.length, 100);
    for (let n = 0; n <= 99; n++) {
      assert.equal(cardinalForm(n), CARDINAL_FORMS_0_99[n], `n=${n}`);
    }
  });

  it("rejects out of range", () => {
    assert.throws(() => cardinalForm(-1), RangeError);
    assert.throws(() => cardinalForm(100), RangeError);
    assert.throws(() => cardinalForm(3.5), RangeError);
  });
});

describe("cardinalAnalysis segments", () => {
  it("atomic / teen / tens / compound kinds", () => {
    assert.equal(cardinalAnalysis(7).kind, "atomic");
    assert.equal(cardinalAnalysis(16).kind, "teen");
    assert.equal(cardinalAnalysis(40).kind, "tens");
    assert.equal(cardinalAnalysis(24).kind, "compound");
  });

  it("eins → ein in compounds; sechs/sieben keep full form", () => {
    assert.deepEqual(constructionParts(21), ["ein", "und", "zwanzig"]);
    assert.deepEqual(constructionParts(26), ["sechs", "und", "zwanzig"]);
    assert.deepEqual(constructionParts(37), ["sieben", "und", "dreißig"]);
  });

  it("teen shortenings sech-/sieb-", () => {
    assert.deepEqual(constructionParts(16), ["sech", "zehn"]);
    assert.deepEqual(constructionParts(17), ["sieb", "zehn"]);
    assert.equal(cardinalForm(16), "sechzehn");
    assert.equal(cardinalForm(17), "siebzehn");
  });

  it("every teen 13–19 is prefix + zehn", () => {
    for (let n = 13; n <= 19; n++) {
      const a = cardinalAnalysis(n);
      assert.equal(a.kind, "teen");
      assert.deepEqual(a.segments.construction, [TEEN_PREFIX[n], "zehn"]);
      assert.deepEqual(a.segments.morph, a.segments.construction);
      assert.equal(a.form, `${TEEN_PREFIX[n]}zehn`);
    }
  });

  it("every tens word 20–90 has morph stem + zig/ßig", () => {
    for (let d = 2; d <= 9; d++) {
      const n = d * 10;
      const a = cardinalAnalysis(n);
      assert.equal(a.kind, "tens", `n=${n}`);
      assert.deepEqual(a.segments.construction, [TENS[d]]);
      assert.deepEqual(a.segments.morph, [...TENS_MORPH[d]]);
      assert.equal(a.segments.morph.join(""), TENS[d]);
    }
  });

  it("morph grain splits tens stem + zig/ßig", () => {
    assert.deepEqual(constructionParts(99, { grain: "morph" }), [
      "neun",
      "und",
      "neun",
      "zig",
    ]);
    assert.deepEqual(constructionParts(30, { grain: "morph" }), ["drei", "ßig"]);
    assert.deepEqual(constructionParts(20, { grain: "morph" }), ["zwan", "zig"]);
    assert.deepEqual(constructionParts(60, { grain: "morph" }), ["sech", "zig"]);
    assert.deepEqual(constructionParts(70, { grain: "morph" }), ["sieb", "zig"]);
  });

  it("compound morph splits ones + und + tens morph", () => {
    assert.deepEqual(constructionParts(24, { grain: "morph" }), [
      "vier",
      "und",
      "zwan",
      "zig",
    ]);
    assert.deepEqual(constructionParts(35, { grain: "morph" }), [
      "fünf",
      "und",
      "drei",
      "ßig",
    ]);
  });

  it("construction parts join to form for every 0–99", () => {
    for (let n = 0; n <= 99; n++) {
      assert.equal(
        constructionParts(n).join(""),
        cardinalForm(n),
        `construction n=${n}`
      );
      assert.equal(
        constructionParts(n, { grain: "morph" }).join(""),
        cardinalForm(n),
        `morph n=${n}`
      );
    }
  });

  it("compound ones table covers 21–29", () => {
    for (let ones = 1; ones <= 9; ones++) {
      const n = 20 + ones;
      assert.deepEqual(constructionParts(n), [
        COMPOUND_ONES[ones],
        "und",
        "zwanzig",
      ]);
    }
  });
});

describe("parseCardinalForm", () => {
  it("round-trips 0–99", () => {
    for (let n = 0; n <= 99; n++) {
      assert.equal(parseCardinalForm(cardinalForm(n)), n);
    }
  });

  it("tolerates case and spaces", () => {
    assert.equal(parseCardinalForm("Vier und zwanzig"), 24);
    assert.equal(parseCardinalForm("DREIßIG"), 30);
    assert.equal(parseCardinalForm("sech zehn"), 16);
  });

  it("parses teens and morph-joined tens", () => {
    assert.equal(parseCardinalForm("dreizehn"), 13);
    assert.equal(parseCardinalForm("sechzehn"), 16);
    assert.equal(parseCardinalForm("siebzehn"), 17);
    assert.equal(parseCardinalForm("zwanzig"), 20);
    assert.equal(parseCardinalForm("dreißig"), 30);
    assert.equal(parseCardinalForm("einundzwanzig"), 21);
  });

  it("returns null for garbage", () => {
    assert.equal(parseCardinalForm("twenty"), null);
    assert.equal(parseCardinalForm(""), null);
    assert.equal(parseCardinalForm("undzwanzig"), null);
  });
});

describe("evaluateCardinalConstruction", () => {
  it("marks exact construction correct", () => {
    const r = evaluateCardinalConstruction({
      value: 24,
      parts: ["vier", "und", "zwanzig"],
    });
    assert.equal(r.status, "correct");
    assert.deepEqual(r.canonicalAnswers, ["vierundzwanzig"]);
    assert.deepEqual(r.slotMatch, [true, true, true]);
  });

  it("accepts same orthography with different chips", () => {
    const r = evaluateCardinalConstruction({
      value: 24,
      parts: ["vierundzwanzig"],
    });
    assert.equal(r.status, "accepted-alternative");
  });

  it("flags a valid cardinal for the wrong value", () => {
    const r = evaluateCardinalConstruction({
      value: 24,
      parts: ["zwei", "und", "zwanzig"],
    });
    assert.equal(r.status, "valid-but-unintended");
    assert.equal(r.parsedValue, 22);
  });

  it("marks nonsense incorrect", () => {
    const r = evaluateCardinalConstruction({
      value: 24,
      parts: ["vier", "und", "foo"],
    });
    assert.equal(r.status, "incorrect");
  });

  it("evaluates morph grain for 99", () => {
    const r = evaluateCardinalConstruction({
      value: 99,
      parts: ["neun", "und", "neun", "zig"],
      grain: "morph",
    });
    assert.equal(r.status, "correct");
  });

  it("teens: exact prefix + zehn", () => {
    for (const n of [13, 16, 17, 19]) {
      const parts = constructionParts(n);
      const r = evaluateCardinalConstruction({ value: n, parts });
      assert.equal(r.status, "correct", `teen ${n}`);
    }
  });

  it("teens: wrong prefix is valid-but-unintended or incorrect", () => {
    const r = evaluateCardinalConstruction({
      value: 16,
      parts: ["sieben", "zehn"],
    });
    assert.ok(
      r.status === "incorrect" || r.status === "valid-but-unintended",
      r.status
    );
  });

  it("tens morph: every 20–90 exact split is correct", () => {
    for (let d = 2; d <= 9; d++) {
      const n = d * 10;
      const parts = constructionParts(n, { grain: "morph" });
      const r = evaluateCardinalConstruction({
        value: n,
        parts,
        grain: "morph",
      });
      assert.equal(r.status, "correct", `tens morph ${n}`);
    }
  });

  it("tens morph: fused word is accepted-alternative", () => {
    const r = evaluateCardinalConstruction({
      value: 40,
      parts: ["vierzig"],
      grain: "morph",
    });
    assert.equal(r.status, "accepted-alternative");
  });

  it("tens construction grain expects fused word", () => {
    const fused = evaluateCardinalConstruction({
      value: 50,
      parts: ["fünfzig"],
      grain: "construction",
    });
    assert.equal(fused.status, "correct");
    const split = evaluateCardinalConstruction({
      value: 50,
      parts: ["fünf", "zig"],
      grain: "construction",
    });
    assert.equal(split.status, "accepted-alternative");
  });

  it("compounds: einundzwanzig and siebenunddreißig", () => {
    assert.equal(
      evaluateCardinalConstruction({
        value: 21,
        parts: ["ein", "und", "zwanzig"],
      }).status,
      "correct"
    );
    assert.equal(
      evaluateCardinalConstruction({
        value: 37,
        parts: ["sieben", "und", "dreißig"],
      }).status,
      "correct"
    );
  });

  it("compounds morph grain for 24", () => {
    const r = evaluateCardinalConstruction({
      value: 24,
      parts: ["vier", "und", "zwan", "zig"],
      grain: "morph",
    });
    assert.equal(r.status, "correct");
  });

  it("normalizes case on chips", () => {
    const r = evaluateCardinalConstruction({
      value: 13,
      parts: ["Drei", "Zehn"],
    });
    assert.equal(r.status, "correct");
  });

  it("slotMatch flags the wrong chip", () => {
    const r = evaluateCardinalConstruction({
      value: 24,
      parts: ["vier", "und", "dreißig"],
    });
    assert.equal(r.status, "valid-but-unintended");
    assert.deepEqual(r.slotMatch, [true, true, false]);
  });
});

describe("recordNumberAttempt", () => {
  it("stamps versions and evidence", () => {
    const evaluation = evaluateCardinalConstruction({
      value: 42,
      parts: ["zwei", "und", "vierzig"],
    });
    const attempt = recordNumberAttempt({
      exerciseId: "numbers.cardinal.construction",
      prompt: { value: 42 },
      rawInput: { parts: ["zwei", "und", "vierzig"] },
      evaluation,
      appVersion: "test",
    });
    assert.equal(attempt.versions.engine, ENGINE_VERSION);
    assert.equal(attempt.versions.data, DATA_VERSION);
    assert.equal(attempt.evaluation.status, "correct");
    assert.ok(attempt.evidenceIds.length > 0);
    assert.equal(attempt.normalizedInput, "zweiundvierzig");
  });
});

describe("constructionExercise", () => {
  it("builds quiz shell from engine", () => {
    const ex = constructionExercise(24);
    assert.equal(ex.form, "vierundzwanzig");
    assert.deepEqual(ex.parts, ["vier", "und", "zwanzig"]);
    assert.ok(ex.distractors.every((d) => !ex.parts.includes(d)));
  });

  it("teens pool shells", () => {
    for (const n of [13, 16, 17]) {
      const ex = constructionExercise(n);
      assert.equal(ex.kind, "teen");
      assert.deepEqual(ex.parts, constructionParts(n));
      assert.ok(ex.distractors.every((d) => !ex.parts.includes(d)));
    }
  });

  it("tens morph pool shells", () => {
    for (const n of [20, 30, 70, 90]) {
      const ex = constructionExercise(n, { grain: "morph" });
      assert.equal(ex.kind, "tens");
      assert.equal(ex.grain, "morph");
      assert.deepEqual(ex.parts, constructionParts(n, { grain: "morph" }));
      assert.ok(ex.distractors.every((d) => !ex.parts.includes(d)));
      assert.ok(!ex.distractors.includes(ex.form));
    }
  });

  it("compound shells keep fused tens in construction grain", () => {
    const ex = constructionExercise(99);
    assert.deepEqual(ex.parts, ["neun", "und", "neunzig"]);
    const morph = constructionExercise(99, { grain: "morph" });
    assert.deepEqual(morph.parts, ["neun", "und", "neun", "zig"]);
  });
});
