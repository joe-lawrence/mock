import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fractionForm,
  fractionParts,
  fractionAnalysis,
  mixedFractionForm,
  mixedFractionParts,
  parseFractionForm,
  evaluateFractionConstruction,
  evaluateMixedFractionConstruction,
  fractionExercise,
  mixedFractionExercise,
  clockForm,
  clockParts,
  digitalTimeForm,
  digitalTimeParts,
  durationForm,
  durationParts,
  evaluateClockConstruction,
  evaluateDigitalTimeConstruction,
  evaluateDurationConstruction,
  clockExercise,
  digitalTimeExercise,
  durationExercise,
} from "../index.js";

describe("fractions", () => {
  it("1/2 → halb", () => {
    assert.equal(fractionForm(1, 2), "halb");
    assert.deepEqual(fractionParts(1, 2), ["halb"]);
  });

  it("unit fractions use ein + -tel", () => {
    assert.equal(fractionForm(1, 4), "ein Viertel");
    assert.equal(fractionForm(1, 3), "ein Drittel");
    assert.equal(fractionForm(1, 5), "ein Fünftel");
  });

  it("proper fractions: cardinal + noun", () => {
    assert.equal(fractionForm(2, 3), "zwei Drittel");
    assert.equal(fractionForm(3, 4), "drei Viertel");
    assert.deepEqual(fractionParts(3, 4), ["drei", "Viertel"]);
  });

  it("mixed …einhalb fused", () => {
    assert.equal(mixedFractionForm(1, 1, 2), "eineinhalb");
    assert.equal(mixedFractionForm(2, 1, 2), "zweieinhalb");
    assert.equal(mixedFractionForm(5, 1, 2), "füneinhalb");
  });

  it("mixed with und", () => {
    assert.equal(mixedFractionForm(2, 1, 4), "zwei und ein Viertel");
    assert.deepEqual(mixedFractionParts(1, 3, 4), [
      "eins",
      "und",
      "drei",
      "Viertel",
    ]);
  });

  it("parseFractionForm", () => {
    assert.deepEqual(parseFractionForm("halb"), {
      kind: "fraction",
      numerator: 1,
      denominator: 2,
    });
    assert.deepEqual(parseFractionForm("zwei Drittel"), {
      kind: "fraction",
      numerator: 2,
      denominator: 3,
    });
    assert.deepEqual(parseFractionForm("zweieinhalb"), {
      kind: "mixed",
      whole: 2,
      numerator: 1,
      denominator: 2,
    });
    assert.deepEqual(parseFractionForm("drei und ein Viertel"), {
      kind: "mixed",
      whole: 3,
      numerator: 1,
      denominator: 4,
    });
  });

  it("evaluate + exercise shells", () => {
    const r = evaluateFractionConstruction({
      numerator: 3,
      denominator: 4,
      parts: fractionParts(3, 4),
    });
    assert.equal(r.status, "correct");
    const m = evaluateMixedFractionConstruction({
      whole: 2,
      numerator: 1,
      denominator: 2,
      parts: ["zweieinhalb"],
    });
    assert.equal(m.status, "correct");
    assert.equal(fractionExercise(1, 4).form, "ein Viertel");
    assert.equal(mixedFractionExercise(1, 1, 2).form, "eineinhalb");
    assert.ok(fractionAnalysis(2, 5).written === "2/5");
  });
});

describe("time", () => {
  it("whole hours", () => {
    assert.equal(clockForm(3, 0), "drei Uhr");
    assert.equal(clockForm(12, 0), "zwölf Uhr");
    assert.equal(clockForm(0, 0), "zwölf Uhr");
  });

  it("halb flips to the next hour", () => {
    assert.equal(clockForm(3, 30), "halb vier");
    assert.equal(clockForm(11, 30), "halb zwölf");
    assert.equal(clockForm(23, 30), "halb zwölf");
  });

  it("Viertel nach / vor", () => {
    assert.equal(clockForm(3, 15), "Viertel nach drei");
    assert.equal(clockForm(3, 45), "Viertel vor vier");
  });

  it("minutes nach / vor", () => {
    assert.equal(clockForm(3, 10), "zehn nach drei");
    assert.equal(clockForm(3, 50), "zehn vor vier");
    assert.deepEqual(clockParts(4, 20), ["zwanzig", "nach", "vier"]);
  });

  it("digital 24h", () => {
    assert.equal(digitalTimeForm(14, 5), "vierzehn Uhr fünf");
    assert.equal(digitalTimeForm(1, 0), "ein Uhr");
    assert.equal(digitalTimeForm(0, 0), "null Uhr");
  });

  it("durations", () => {
    assert.equal(durationForm({ minutes: 15 }), "fünfzehn Minuten");
    assert.equal(durationForm({ hours: 1 }), "eine Stunde");
    assert.equal(durationForm({ hours: 2, minutes: 30 }), "zwei Stunden dreißig Minuten");
    assert.deepEqual(durationParts({ hours: 1, minutes: 5 }), [
      "eine",
      "Stunde",
      "fünf",
      "Minuten",
    ]);
  });

  it("evaluate + exercise shells", () => {
    assert.equal(
      evaluateClockConstruction({
        hours: 3,
        minutes: 30,
        parts: clockParts(3, 30),
      }).status,
      "correct"
    );
    assert.equal(
      evaluateDigitalTimeConstruction({
        hours: 14,
        minutes: 5,
        parts: digitalTimeParts(14, 5),
      }).status,
      "correct"
    );
    assert.equal(
      evaluateDurationConstruction({
        hours: 1,
        minutes: 0,
        parts: ["eine", "Stunde"],
      }).status,
      "correct"
    );
    assert.equal(clockExercise(2, 15).form, "Viertel nach zwei");
    assert.ok(digitalTimeExercise(9, 15).written === "09:15");
    assert.equal(durationExercise({ minutes: 1 }).form, "eine Minute");
  });
});
