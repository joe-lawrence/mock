import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decimalForm,
  decimalWritten,
  decimalParts,
  decimalAnalysis,
  parseDecimalForm,
  parseDecimalWritten,
  moneyForm,
  moneyParts,
  moneyAnalysis,
  parseMoneyForm,
  evaluateDecimalConstruction,
  evaluateMoneyConstruction,
  decimalExercise,
  moneyExercise,
} from "../index.js";

describe("decimal Komma", () => {
  it("3,14 → drei Komma eins vier", () => {
    assert.equal(decimalWritten(3, [1, 4]), "3,14");
    assert.equal(decimalForm(3, [1, 4]), "drei Komma eins vier");
    assert.deepEqual(decimalParts(3, [1, 4], "spoken"), [
      "drei",
      "Komma",
      "eins",
      "vier",
    ]);
  });

  it("reads frac digits individually (not as a teen/tens cardinal)", () => {
    assert.equal(decimalForm(0, [1, 4]), "null Komma eins vier");
    assert.notEqual(decimalForm(2, [1, 4]).includes("vierzehn"), true);
  });

  it("construction splits the whole", () => {
    assert.deepEqual(decimalParts(24, [5], "construction"), [
      "vier",
      "und",
      "zwanzig",
      "Komma",
      "fünf",
    ]);
  });

  it("parseDecimalForm round-trips", () => {
    const a = decimalAnalysis(7, [0, 5]);
    assert.deepEqual(parseDecimalForm(a.form), { whole: 7, fracDigits: [0, 5] });
    assert.deepEqual(parseDecimalForm("DREI  Komma  EINS VIER"), {
      whole: 3,
      fracDigits: [1, 4],
    });
  });

  it("parseDecimalWritten accepts Komma and Punkt", () => {
    assert.deepEqual(parseDecimalWritten("3,14"), {
      whole: 3,
      fracDigits: [1, 4],
    });
    assert.deepEqual(parseDecimalWritten("3.14"), {
      whole: 3,
      fracDigits: [1, 4],
    });
  });

  it("evaluateDecimalConstruction accepts exact parts", () => {
    const parts = decimalParts(3, [1, 4]);
    const r = evaluateDecimalConstruction({
      whole: 3,
      fracDigits: [1, 4],
      parts,
    });
    assert.equal(r.status, "correct");
  });

  it("decimalExercise shell", () => {
    const ex = decimalExercise(3, [1, 4]);
    assert.equal(ex.written, "3,14");
    assert.ok(ex.parts.includes("Komma"));
    assert.ok(!ex.distractors.includes("Komma") || ex.distractors.includes("Punkt"));
  });
});

describe("money", () => {
  it("whole euros use ein not eins", () => {
    assert.equal(moneyForm(1, 0), "ein Euro");
    assert.equal(moneyForm(12, 0), "zwölf Euro");
  });

  it("cents as cardinal after Euro", () => {
    assert.equal(moneyForm(12, 50), "zwölf Euro fünfzig");
    assert.equal(moneyForm(0, 50), "fünfzig Cent");
  });

  it("money parts construction", () => {
    assert.deepEqual(moneyParts(12, 50), ["zwölf", "Euro", "fünfzig"]);
    assert.ok(moneyAnalysis(7, 25).written.includes("7,25"));
  });

  it("parseMoneyForm", () => {
    assert.deepEqual(parseMoneyForm("zwölf Euro fünfzig"), {
      euros: 12,
      cents: 50,
    });
    assert.deepEqual(parseMoneyForm("ein Euro"), { euros: 1, cents: 0 });
    assert.deepEqual(parseMoneyForm("fünfzig Cent"), { euros: 0, cents: 50 });
  });

  it("evaluateMoneyConstruction", () => {
    const r = evaluateMoneyConstruction({
      euros: 12,
      cents: 50,
      parts: moneyParts(12, 50),
    });
    assert.equal(r.status, "correct");
  });

  it("moneyExercise shell", () => {
    const ex = moneyExercise(3, 20);
    assert.equal(ex.form, "drei Euro zwanzig");
    assert.ok(ex.parts.includes("Euro"));
  });
});
