import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DIRECTION,
  DEFAULT_DIRECTIONS,
  normalizeDirections,
  directionsForStepMode,
  isDirectionPlayable,
  reverseNounArticleChoose,
  wugReverseChoose,
  reverseNumbersConvert,
  reverseCompassConvert,
} from "./reverse-direction.js";
import { LEXICON, WUGS } from "../engine/nouns/index.js";
import { vocabulary } from "./generated/vocabulary.js";
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
    assert.equal(
      isNumbersCellPlayable("dates", "ordinal-days", "convert"),
      false
    );
    assert.equal(
      isNumbersCellPlayable("dates", "full-dates", "convert"),
      false
    );
    assert.equal(
      isNumbersCellPlayable("ordinals", "ordinal-dates-use", "convert"),
      false
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

  it("wug reverse stays on nonce forms and vocab does not list them", () => {
    const forms = new Set(WUGS.map((w) => w.form));
    for (const form of forms) assert.equal(LEXICON[form], undefined);
    const pack = wugReverseChoose("Klappung");
    assert.equal(pack.cue, "die");
    assert.equal(pack.answer, "Klappung");
    assert.equal(pack.ask, "Pick the matching wug");
    assert.equal(pack.suffixCue, "-ung");
    assert.match(pack.patternNote, /-ung/);
    assert.equal(pack.wug, true);
    assert.doesNotMatch(`${pack.ask} ${pack.hint}`, /nonce/i);
    assert.ok(pack.choices.includes("Klappung"));
    for (const choice of pack.choices) {
      assert.ok(forms.has(choice));
      assert.equal(LEXICON[choice], undefined);
    }
    const bare = wugReverseChoose("Plork");
    assert.equal(bare.cue, "?");
    assert.equal(bare.answer, "Plork");
    assert.equal(bare.suffixCue, null);
    assert.equal(bare.ask, "Pick the matching wug");
    for (const choice of bare.choices) assert.ok(forms.has(choice));
    const surfaces = new Set();
    for (const item of Object.values(vocabulary)) {
      if (item?.surface) surfaces.add(item.surface);
      if (item?.engine?.lemma) surfaces.add(item.engine.lemma);
    }
    for (const form of forms) assert.equal(surfaces.has(form), false);
    assert.deepEqual(
      directionsForNounsCell("plurals", "plural-wugs", "choose"),
      ["forward"]
    );
    assert.deepEqual(
      directionsForNounsCell("plurals", "plural-wugs", "build"),
      ["forward"]
    );
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

  it("builds written-value convert reverse packs", () => {
    const dec = reverseNumbersConvert({
      kind: "decimal",
      form: "drei Komma eins vier",
      written: "3,14",
    });
    assert.equal(dec.cue, "drei Komma eins vier");
    assert.equal(dec.answer, "3,14");

    const money = reverseNumbersConvert({
      kind: "money",
      form: "drei Euro fünfzig",
      written: "3,50 €",
    });
    assert.equal(money.answer, "3,50 €");
    assert.ok(money.acceptedForms.includes("3,50€"));

    const frac = reverseNumbersConvert({
      kind: "fraction",
      form: "zwei Drittel",
      written: "2/3",
    });
    assert.equal(frac.answer, "2/3");

    const clock = reverseNumbersConvert({
      kind: "clock",
      form: "halb vier",
      written: "03:30",
    });
    assert.equal(clock.answer, "03:30");
    assert.ok(clock.acceptedForms.includes("3:30"));
    assert.equal(clock.ask, "Type the time");

    const morning = reverseNumbersConvert({
      kind: "clock",
      form: "Viertel nach neun",
      written: "09:15",
    });
    assert.ok(morning.acceptedForms.includes("09:15"));
    assert.ok(morning.acceptedForms.includes("9:15"));
    assert.equal(morning.ask, "Type the time");

    const evening = reverseNumbersConvert({
      kind: "clock",
      form: "Viertel nach neun",
      written: "21:15",
    });
    assert.ok(evening.acceptedForms.includes("21:15"));
    assert.equal(evening.acceptedForms.includes("9:15"), false);
    assert.equal(evening.ask, "Type the time (24-hour)");
    assert.match(evening.placeholder, /24h/);

    const dur = reverseNumbersConvert({
      kind: "duration",
      form: "zwei Stunden dreißig Minuten",
      written: "2h 30min",
    });
    assert.equal(dur.answer, "2h 30min");
    assert.ok(dur.acceptedForms.includes("2h30min"));

    const meas = reverseNumbersConvert({
      kind: "measure",
      value: 3,
      form: "drei Meter",
      written: "3 m",
    });
    assert.equal(meas.answer, "3 m");
    assert.ok(!meas.acceptedForms.includes("3"));
  });

  it("Convert reverse covers decimals, fractions, time, and measure", () => {
    const cells = [
      ["decimals", "komma-read"],
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
      ["measurement", "length"],
      ["measurement", "weight"],
      ["measurement", "volume"],
      ["measurement", "temp-speed"],
    ];
    for (const [topicId, stepId] of cells) {
      assert.ok(
        isNumbersDirectionPlayable(topicId, stepId, "convert", "reverse"),
        `${topicId}/${stepId}`
      );
      assert.equal(
        isNumbersDirectionPlayable(topicId, stepId, "listen", "reverse"),
        false,
        `${topicId}/${stepId} listen`
      );
    }
    assert.equal(
      isNumbersDirectionPlayable("decimals", "place-value", "build", "reverse"),
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

  it("Nouns playable cell count includes Plurals (21)", () => {
    let n = 0;
    for (const t of NOUNS_TOPICS) {
      for (const s of t.steps || []) {
        for (const m of modesForNounsStep(t.id, s.id)) {
          if (isNounsCellPlayable(t.id, s.id, m.id)) n++;
        }
      }
    }
    // 13 after reverse-mc fold, plus Patterns build/proofread and two steps × 3 presets
    assert.equal(n, 21);
  });
});
