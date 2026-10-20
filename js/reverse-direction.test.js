import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DIRECTION,
  DEFAULT_DIRECTIONS,
  normalizeDirections,
  directionsForStepMode,
  isDirectionPlayable,
  reverseNounArticleChoose,
  reverseNumbersConvert,
  reverseCompassConvert,
} from "./reverse-direction.js";
import {
  directionsForNounsCell,
  isNounsDirectionPlayable,
  isNounsCellPlayable,
  getNounsStep,
  modesForNounsStep,
  NOUNS_TOPICS,
} from "./nouns-curriculum.js";
import {
  directionsForNumbersCell,
  isNumbersDirectionPlayable,
  isNumbersCellPlayable,
} from "./numbers-curriculum.js";

describe("reverse direction", () => {
  it("defaults to forward-only", () => {
    assert.deepEqual(normalizeDirections(null), DEFAULT_DIRECTIONS);
    assert.deepEqual(directionsForStepMode({}, "choose"), [DIRECTION.FORWARD]);
    assert.equal(isDirectionPlayable({}, "choose", "reverse"), false);
  });

  it("reads per-preset directions from a step", () => {
    const step = { directions: { choose: ["forward", "reverse"] } };
    assert.deepEqual(directionsForStepMode(step, "choose"), [
      DIRECTION.FORWARD,
      DIRECTION.REVERSE,
    ]);
    assert.ok(isDirectionPlayable(step, "choose", "reverse"));
    assert.deepEqual(directionsForStepMode(step, "convert"), [
      DIRECTION.FORWARD,
    ]);
  });

  it("builds article→lemma reverse packs", () => {
    const pack = reverseNounArticleChoose("Zeitung", "die", [
      { lemma: "Zeitung", article: "die" },
      { lemma: "Tisch", article: "der" },
      { lemma: "Buch", article: "das" },
      { lemma: "Lampe", article: "die" },
    ]);
    assert.equal(pack.cue, "die");
    assert.equal(pack.answer, "Zeitung");
    assert.ok(pack.choices.includes("Zeitung"));
    assert.equal(pack.choices.length, 3);
  });

  it("builds cardinal convert reverse (German → digit)", () => {
    const pack = reverseNumbersConvert({
      kind: "cardinal",
      value: 21,
      form: "einundzwanzig",
    });
    assert.equal(pack.cue, "einundzwanzig");
    assert.equal(pack.answer, "21");
    assert.ok(pack.acceptedForms.includes("21"));
  });

  it("builds dates/ordinals convert reverse packs", () => {
    const wd = reverseNumbersConvert({
      kind: "weekday",
      form: "Montag",
      english: "Monday",
    });
    assert.equal(wd.cue, "Montag");
    assert.equal(wd.answer, "Monday");

    const ord = reverseNumbersConvert({
      kind: "ordinal",
      n: 12,
      form: "zwölfte",
      written: "12.",
    });
    assert.equal(ord.cue, "zwölfte");
    assert.equal(ord.answer, "12.");
    assert.ok(ord.acceptedForms.includes("12"));

    const date = reverseNumbersConvert({
      kind: "calendar-date",
      form: "am neunten November",
      written: "9.11.",
    });
    assert.equal(date.cue, "am neunten November");
    assert.equal(date.answer, "9.11.");
  });

  it("Dates and Ordinals convert allow reverse", () => {
    assert.ok(
      isNumbersDirectionPlayable("dates", "weekdays", "convert", "reverse")
    );
    assert.ok(
      isNumbersDirectionPlayable("dates", "full-dates", "convert", "reverse")
    );
    assert.ok(
      isNumbersDirectionPlayable("ordinals", "ordinal-1-12", "convert", "reverse")
    );
    assert.ok(
      isNumbersDirectionPlayable(
        "ordinals",
        "ordinal-compounds",
        "convert",
        "reverse"
      )
    );
  });

  it("builds compass convert reverse (German → English)", () => {
    const pack = reverseCompassConvert({
      lemma: "Nordosten",
      english: "northeast",
    });
    assert.equal(pack.cue, "Nordosten");
    assert.equal(pack.answer, "northeast");
  });

  it("Suffixes wugs/real-words choose allow reverse; reverse-mc unit is gone", () => {
    assert.ok(!getNounsStep("suffixes", "reverse-mc")?.playable);
    assert.deepEqual(directionsForNounsCell("suffixes", "wugs", "choose"), [
      "forward",
      "reverse",
    ]);
    assert.ok(isNounsDirectionPlayable("suffixes", "real-words", "choose", "reverse"));
    assert.equal(
      isNounsCellPlayable("suffixes", "reverse-mc", "choose"),
      false
    );
  });

  it("Cardinals convert and compass convert allow reverse", () => {
    assert.ok(isNumbersDirectionPlayable("cardinals", "base", "convert", "reverse"));
    assert.ok(
      isNumbersDirectionPlayable("cardinals", "compounds", "convert", "reverse")
    );
    assert.equal(
      isNumbersDirectionPlayable("cardinals", "base", "listen", "reverse"),
      false
    );
    assert.deepEqual(
      directionsForNounsCell("categories", "cardinal-directions", "convert"),
      ["forward", "reverse"]
    );
    assert.ok(
      isNounsDirectionPlayable(
        "categories",
        "cardinal-directions",
        "convert",
        "reverse"
      )
    );
  });

  it("Nouns playable cell count after reverse-mc fold (13)", () => {
    let n = 0;
    for (const t of NOUNS_TOPICS) {
      for (const s of t.steps || []) {
        for (const m of modesForNounsStep(t.id, s.id)) {
          if (isNounsCellPlayable(t.id, s.id, m.id)) n++;
        }
      }
    }
    // Was 14 with reverse-mc unit; fold removes that step → 13
    assert.equal(n, 13);
  });
});
