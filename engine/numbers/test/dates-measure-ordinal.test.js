import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ordinalForm,
  ordinalParts,
  ordinalAmForm,
  parseOrdinalForm,
  evaluateOrdinalConstruction,
  weekdayForm,
  monthForm,
  calendarDateForm,
  calendarDateParts,
  evaluateCalendarDateConstruction,
  measureForm,
  measureParts,
  measureAcceptedForms,
  evaluateMeasureConstruction,
} from "../index.js";

describe("ordinals", () => {
  it("specials and base", () => {
    assert.equal(ordinalForm(1), "erste");
    assert.equal(ordinalForm(3), "dritte");
    assert.equal(ordinalForm(7), "siebte");
    assert.equal(ordinalForm(2), "zweite");
    assert.deepEqual(ordinalParts(2), ["zwei", "te"]);
  });

  it("teens and tens", () => {
    assert.equal(ordinalForm(13), "dreizehnte");
    assert.equal(ordinalForm(20), "zwanzigste");
    assert.equal(ordinalForm(21), "einundzwanzigste");
  });

  it("am + dative", () => {
    assert.equal(ordinalAmForm(3), "am dritten");
    assert.equal(ordinalAmForm(1), "am ersten");
    assert.equal(ordinalAmForm(20), "am zwanzigsten");
  });

  it("parse + evaluate", () => {
    assert.equal(parseOrdinalForm("3."), 3);
    assert.equal(parseOrdinalForm("dreizehnte"), 13);
    assert.equal(
      evaluateOrdinalConstruction({ n: 21, parts: ordinalParts(21) }).status,
      "correct"
    );
  });
});

describe("dates", () => {
  it("weekdays and months", () => {
    assert.equal(weekdayForm(0), "Montag");
    assert.equal(weekdayForm(6), "Sonntag");
    assert.equal(monthForm(3), "März");
    assert.equal(monthForm(12), "Dezember");
  });

  it("full dates", () => {
    assert.equal(calendarDateForm({ day: 3, month: 3 }), "am dritten März");
    assert.ok(
      calendarDateForm({ day: 1, month: 1, year: 2024 }).includes("zweitausend")
    );
    assert.deepEqual(calendarDateParts({ day: 3, month: 3 }).slice(0, 2), [
      "am",
      "dritten",
    ]);
  });

  it("evaluate calendar date", () => {
    const parts = calendarDateParts({ day: 3, month: 3 });
    assert.equal(
      evaluateCalendarDateConstruction({
        day: 3,
        month: 3,
        parts,
      }).status,
      "correct"
    );
  });
});

describe("measurement", () => {
  it("number + unit", () => {
    assert.equal(measureForm(1, "Meter"), "ein Meter");
    assert.equal(measureForm(3, "Kilometer"), "drei Kilometer");
    assert.equal(measureForm(250, "Gramm"), "zweihundertfünfzig Gramm");
    assert.deepEqual(measureParts(1, "Liter"), ["ein", "Liter"]);
  });

  it("evaluate", () => {
    assert.equal(
      evaluateMeasureConstruction({
        value: 5,
        unit: "Grad",
        parts: measureParts(5, "Grad"),
      }).status,
      "correct"
    );
  });

  it("accepts Stundenkilometer and Kilometer pro Stunde", () => {
    assert.equal(measureForm(30, "Stundenkilometer"), "dreißig Stundenkilometer");
    assert.deepEqual(measureAcceptedForms(30, "Stundenkilometer"), [
      "dreißig Stundenkilometer",
      "dreißig Kilometer pro Stunde",
    ]);
    assert.equal(
      evaluateMeasureConstruction({
        value: 30,
        unit: "Stundenkilometer",
        parts: ["dreißig", "Stundenkilometer"],
      }).status,
      "correct"
    );
    const alt = evaluateMeasureConstruction({
      value: 30,
      unit: "Stundenkilometer",
      parts: ["dreißig", "Kilometer", "pro", "Stunde"],
    });
    assert.equal(alt.status, "accepted-alternative");
    assert.ok(alt.canonicalAnswers.includes("dreißig Stundenkilometer"));
    assert.ok(alt.canonicalAnswers.includes("dreißig Kilometer pro Stunde"));
  });
});
