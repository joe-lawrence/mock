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

  it("morph grain splits tens stem + zig/ßig", () => {
    assert.deepEqual(constructionParts(99, { grain: "morph" }), [
      "neun",
      "und",
      "neun",
      "zig",
    ]);
    assert.deepEqual(constructionParts(30, { grain: "morph" }), ["drei", "ßig"]);
  });

  it("construction parts join to form", () => {
    for (const n of [0, 11, 16, 20, 24, 30, 42, 99]) {
      assert.equal(constructionParts(n).join(""), cardinalForm(n));
      assert.equal(constructionParts(n, { grain: "morph" }).join(""), cardinalForm(n));
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
  });

  it("returns null for garbage", () => {
    assert.equal(parseCardinalForm("twenty"), null);
    assert.equal(parseCardinalForm(""), null);
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
});
