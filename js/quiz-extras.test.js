import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  visualForMeta,
  compassDirectionPool,
  COMPASS_BEARINGS,
  bearingIdFromAngleDeg,
  minutesFromAngleDeg,
  snapClockTime,
  clockFaceSvg,
  pieSvg,
  numeratorFromAngleDeg,
  PIE_DIAL_DENOM,
  PIE_DIAL_GUIDE_TICKS,
  pieFractionsEqual,
  pieDialMatchesFraction,
  dialNumeratorForFraction,
  simplifyFraction,
  pickClockHandFromPointer,
  CLOCK_HOUR_HAND_LEN,
  CLOCK_MINUTE_HAND_LEN,
  clockHandTip,
} from "./quiz-extras.js";
import { isNumbersCellPlayable } from "./numbers-curriculum.js";
import {
  buildFractionPool,
  buildProperFractionsPool,
  buildUnitFractionsPool,
} from "./fractions-pools.js";
import {
  getNounsStep,
  isNounsCellPlayable,
  modesForNounsStep,
} from "./nouns-curriculum.js";
import { INTERACTION_PRESETS, RESPONSE } from "./interaction-presets.js";
import { LEXICON } from "../../engine/nouns/data.js";


describe("compass directions quiz", () => {
  it("exposes eight bearings with German abbreviations", () => {
    assert.equal(COMPASS_BEARINGS.length, 8);
    assert.equal(COMPASS_BEARINGS.find((b) => b.id === "Osten")?.abbr, "O");
    assert.equal(COMPASS_BEARINGS.find((b) => b.id === "Nordosten")?.abbr, "NO");
  });

  it("visualForMeta returns compass SVG for a bearing", () => {
    const visual = visualForMeta({ kind: "compass", bearing: "Nordosten" });
    assert.ok(visual);
    assert.match(visual.html, /quiz-compass-svg/);
    assert.match(visual.html, /compass-face/);
    assert.match(visual.html, /compass-needle/);
    assert.doesNotMatch(visual.html, /compass-label/);
    assert.equal(visual.ask, "Name what you see");
  });

  it("compassDirectionPool has one meta per bearing", () => {
    const pool = compassDirectionPool();
    assert.equal(pool.length, 8);
    assert.ok(pool.every((m) => m.kind === "compass" && m.lemma && m.bearing));
    assert.ok(pool.some((m) => m.lemma === "Südwesten"));
  });

  it("compounds are masculine in the lexicon", () => {
    for (const id of [
      "Nordosten",
      "Südosten",
      "Südwesten",
      "Nordwesten",
    ]) {
      assert.equal(LEXICON[id]?.gender, "masculine", id);
    }
  });

  it("Categories → cardinal-directions offers listen, convert, visual, type, set-dial", () => {
    const step = getNounsStep("categories", "cardinal-directions");
    assert.ok(step?.playable);
    const modes = modesForNounsStep("categories", "cardinal-directions").map(
      (m) => m.id
    );
    assert.deepEqual(modes, [
      "choose",
      "listen",
      "convert",
      "visual",
      "visual-freeform",
      "set-dial",
    ]);
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "choose"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "listen"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "convert"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "visual"));
    assert.ok(
      isNounsCellPlayable("categories", "cardinal-directions", "visual-freeform")
    );
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "set-dial"));
  });

  it("Suffixes reverse-mc unit is retired (choose + reverse direction)", () => {
    assert.equal(getNounsStep("suffixes", "reverse-mc")?.playable, undefined);
    assert.ok(isNounsCellPlayable("suffixes", "real-words", "choose"));
    assert.ok(isNounsCellPlayable("suffixes", "wugs", "choose"));
  });

  it("set-dial preset uses dial response", () => {
    assert.equal(INTERACTION_PRESETS["set-dial"].response, RESPONSE.DIAL);
  });

  it("snaps compass angles and clock times", () => {
    assert.equal(bearingIdFromAngleDeg(0), "Norden");
    assert.equal(bearingIdFromAngleDeg(44), "Nordosten");
    assert.equal(bearingIdFromAngleDeg(90), "Osten");
    assert.equal(minutesFromAngleDeg(180, 5), 30);
    assert.deepEqual(snapClockTime(3, 17, 5), { hours: 3, minutes: 15 });
  });

  it("interactive clock matches visual size (128)", () => {
    const html = clockFaceSvg(3, 0, { interactive: true });
    assert.match(html, /width="128"/);
    assert.match(html, /height="128"/);
    assert.match(html, /clock-hand--hour/);
    assert.match(html, /clock-hand--minute/);
  });

  it("pie chart and angle→numerator for set-dial", () => {
    const html = pieSvg(3, 4, { interactive: true });
    assert.match(html, /quiz-pie-svg/);
    assert.match(html, /quiz-visual-svg/); // answer-key scales via .answer-reveal-visual .quiz-visual-svg
    assert.match(html, /is-interactive/);
    assert.match(html, /width="128"/);
    assert.equal(numeratorFromAngleDeg(0, 4), 0);
    assert.equal(numeratorFromAngleDeg(90, 4), 1);
    assert.equal(numeratorFromAngleDeg(270, 4), 3);
    const staticHtml = pieSvg(1, 2);
    assert.match(staticHtml, /quiz-visual-svg/);
    assert.ok(isNumbersCellPlayable("fractions", "half-quarter", "set-dial"));
    assert.ok(isNumbersCellPlayable("fractions", "proper-fractions", "set-dial"));
    assert.equal(isNumbersCellPlayable("fractions", "mixed-numbers", "set-dial"), false);
  });

  it("set-dial pie uses fine snap + guide ticks; matches any pool fraction", () => {
    assert.equal(PIE_DIAL_DENOM, 360);
    assert.equal(PIE_DIAL_GUIDE_TICKS, 12);
    assert.equal(dialNumeratorForFraction(1, 2), 180);
    assert.equal(dialNumeratorForFraction(3, 4), 270);
    assert.equal(dialNumeratorForFraction(1, 3), 120);
    assert.ok(pieDialMatchesFraction({ numerator: 180, denominator: 360 }, 1, 2));
    assert.ok(pieDialMatchesFraction({ numerator: 72, denominator: 360 }, 1, 5));
    assert.ok(pieFractionsEqual(1, 2, 180, 360));
    assert.deepEqual(simplifyFraction(180, 360), [1, 2]);
    const dialHtml = pieSvg(90, 360, { interactive: true, guideTicks: 12 });
    assert.match(dialHtml, /pie-guide-tick/);
    assert.match(dialHtml, /pie-fill-arc|pie-dynamic-fill/);
  });

  it("fraction pools are generated combinatorially", () => {
    assert.equal(buildUnitFractionsPool().length, 10);
    assert.equal(buildProperFractionsPool().length, 55);
    assert.equal(buildFractionPool("half-quarter").length, 4);
    assert.equal(buildFractionPool("unit-fractions").length, 10);
    assert.notEqual(buildFractionPool("proper-fractions"), buildFractionPool("proper-fractions"));
  });

  it("picks hour vs minute hand by tip proximity", () => {
    // 3:00 — hour at 90°, minute at 0° (north).
    const rect = { left: 0, top: 0, width: 128, height: 128 };
    const hourTip = clockHandTip(90, CLOCK_HOUR_HAND_LEN);
    const minTip = clockHandTip(0, CLOCK_MINUTE_HAND_LEN);
    assert.equal(
      pickClockHandFromPointer(rect, hourTip.x, hourTip.y, 3, 0),
      "hour"
    );
    assert.equal(
      pickClockHandFromPointer(rect, minTip.x, minTip.y, 3, 0),
      "minute"
    );
  });
});

