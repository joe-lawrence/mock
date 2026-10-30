import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  INTERACTION_PRESETS,
  STIMULUS,
  RESPONSE,
  getInteractionPreset,
  enrichModeWithPreset,
  presetIdForPair,
  normalizeLaunchInteraction,
  presetMatchesCaps,
  stepDealsForMix,
  MATRIX_PRESET_IDS,
} from "./interaction-presets.js";
import {
  NUMBERS_MODES,
  NUMBERS_TOPICS,
  modesForStep,
  getNumbersMode,
  isNumbersCellPlayable,
} from "./numbers-curriculum.js";
import {
  NOUNS_TOPICS,
  modesForNounsStep,
  isNounsCellPlayable,
  introModeForNounsStep,
  GENDER_SHORTCUTS_UNITS,
  nounsCellsMatchingCaps,
  nounPresetMatchesCaps,
} from "./nouns-curriculum.js";
import {
  CURRICULUM_PACKAGE_SCHEMA,
  ATTEMPT_RECORD_FIELDS,
  MASTERY_REPORT_CARD_SCHEMA,
  MASTERY_FULL_AUDIT_SCHEMA,
} from "./guidance-contracts.js";

describe("interaction presets (Slice 0–1)", () => {
  it("maps legacy mode ids to stimulus×response", () => {
    assert.equal(INTERACTION_PRESETS.listen.stimulus, STIMULUS.TTS);
    assert.equal(INTERACTION_PRESETS.listen.response, RESPONSE.MULTI_SELECT);
    assert.equal(INTERACTION_PRESETS.convert.stimulus, STIMULUS.DIGIT);
    assert.equal(INTERACTION_PRESETS.convert.response, RESPONSE.FREEFORM);
    assert.equal(INTERACTION_PRESETS.visual.stimulus, STIMULUS.VISUAL);
    assert.equal(INTERACTION_PRESETS.build.response, RESPONSE.BUILD_CHIPS);
    assert.equal(INTERACTION_PRESETS.discriminate, undefined);
    assert.ok(!MATRIX_PRESET_IDS.includes("discriminate"));
    assert.ok(MATRIX_PRESET_IDS.includes("listen"));
    assert.ok(MATRIX_PRESET_IDS.includes("karaoke"));
    assert.equal(INTERACTION_PRESETS.karaoke.stimulus, STIMULUS.KARAOKE);
  });

  it("enriches NUMBERS_MODES from the preset map", () => {
    const listen = getNumbersMode("listen");
    assert.ok(listen);
    assert.equal(listen.stimulus, STIMULUS.TTS);
    assert.equal(listen.response, RESPONSE.MULTI_SELECT);
    assert.equal(listen.presetId, "listen");
    assert.ok(NUMBERS_MODES.every((m) => m.stimulus && m.response));
  });

  it("modesForStep returns enriched presets", () => {
    const modes = modesForStep("cardinals", "base");
    assert.ok(modes.length >= 3);
    const convert = modes.find((m) => m.id === "convert");
    assert.equal(convert?.stimulus, STIMULUS.DIGIT);
    assert.equal(convert?.response, RESPONSE.FREEFORM);
  });

  it("playable cell count after visual-freeform add / cloze remove", () => {
    let n = 0;
    for (const t of NUMBERS_TOPICS) {
      for (const s of t.steps) {
        for (const m of modesForStep(t.id, s.id)) {
          if (isNumbersCellPlayable(t.id, s.id, m.id)) n++;
        }
      }
    }
    // 136 prior cells + 6 support-word sentence units
    assert.equal(n, 142);
  });

  it("normalizeLaunchInteraction uses preset= / stimulus×response (not mode=)", () => {
    const byModeAlias = normalizeLaunchInteraction(
      new URLSearchParams("mode=visual")
    );
    assert.equal(byModeAlias.presetId, null);

    const byPreset = normalizeLaunchInteraction(
      new URLSearchParams("preset=convert")
    );
    assert.equal(byPreset.presetId, "convert");

    const byPair = normalizeLaunchInteraction(
      new URLSearchParams("stimulus=tts&response=multi-select")
    );
    assert.equal(byPair.presetId, "listen");

    // Pair wins when both pair and preset are present.
    const both = normalizeLaunchInteraction(
      new URLSearchParams("preset=build&stimulus=tts&response=multi-select")
    );
    assert.equal(both.presetId, "listen");

    assert.equal(presetIdForPair(STIMULUS.DIGIT, RESPONSE.FREEFORM), "convert");
    assert.equal(presetIdForPair(STIMULUS.TTS, RESPONSE.MULTI_SELECT), "listen");
    assert.equal(presetIdForPair(STIMULUS.TTS, RESPONSE.FREEFORM), "listen-type");
    assert.equal(presetIdForPair(STIMULUS.SENTENCE, RESPONSE.MULTI_SELECT), "sentence");
    assert.equal(presetIdForPair(STIMULUS.SENTENCE, RESPONSE.FREEFORM), "sentence-type");
    const open = { keyboard: true, audio: true };
    assert.equal(presetMatchesCaps("listen-type", open), true);
    assert.equal(presetMatchesCaps("listen-type", { keyboard: "only", audio: true }), false);
    assert.equal(presetMatchesCaps("listen-type", { keyboard: true, audio: "only" }), false);
    assert.equal(presetMatchesCaps("sentence-type", { keyboard: "only", audio: true }), true);
    assert.equal(presetMatchesCaps("sentence-type", { keyboard: true, audio: "only" }), false);
  });

  it("enrichModeWithPreset is idempotent on unknown ids", () => {
    const enriched = enrichModeWithPreset({ id: "nope", label: "Nope" });
    assert.equal(enriched.presetId, "nope");
    assert.equal(enriched.stimulus, null);
  });

  it("exposes Slice 0 contract schema ids", () => {
    assert.equal(
      CURRICULUM_PACKAGE_SCHEMA.schema,
      "schnapp.curriculum-package.v0"
    );
    assert.ok(ATTEMPT_RECORD_FIELDS.includes("hintDepth"));
    assert.ok(ATTEMPT_RECORD_FIELDS.includes("interactionPreset"));
    assert.equal(
      MASTERY_REPORT_CARD_SCHEMA.schema,
      "schnapp.mastery.report-card.v0"
    );
    assert.equal(
      MASTERY_FULL_AUDIT_SCHEMA.schema,
      "schnapp.mastery.full-audit.v0"
    );
    assert.ok(getInteractionPreset("read")?.planned);
  });

  it("Nouns uses Topic×Unit×shared presets (choose / proofread)", () => {
    assert.ok(INTERACTION_PRESETS.choose);
    assert.equal(INTERACTION_PRESETS.choose.response, RESPONSE.MULTI_SELECT);
    assert.ok(MATRIX_PRESET_IDS.includes("choose"));
    const wugs = modesForNounsStep("suffixes", "wugs");
    assert.ok(wugs.some((m) => m.id === "choose"));
    assert.ok(isNounsCellPlayable("suffixes", "wugs", "choose"));
    assert.ok(isNounsCellPlayable("suffixes", "proofread", "proofread"));
    assert.equal(GENDER_SHORTCUTS_UNITS.length, 2);
    let n = 0;
    for (const t of NOUNS_TOPICS) {
      for (const s of t.steps || []) {
        for (const m of modesForNounsStep(t.id, s.id)) {
          if (isNounsCellPlayable(t.id, s.id, m.id)) n++;
        }
      }
    }
    // reverse-mc folded (13) plus Plurals: Patterns build/proofread, Wugs and Real words × 3
    assert.equal(n, 21);
  });

  it("Nouns launch shape matches Numbers (topic + step + mode)", () => {
    assert.ok(isNounsCellPlayable("categories", "gender-recognition", "choose"));
    assert.ok(isNounsCellPlayable("categories", "sentence-validation", "proofread"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "choose"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "listen"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "convert"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "visual"));
    assert.ok(
      isNounsCellPlayable("categories", "cardinal-directions", "visual-freeform")
    );
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "set-dial"));
    assert.equal(isNounsCellPlayable("suffixes", "reverse-mc", "choose"), false);
    assert.ok(isNumbersCellPlayable("time", "whole-hours", "set-dial"));
    assert.ok(isNumbersCellPlayable("time", "minutes", "set-dial"));
    assert.ok(isNumbersCellPlayable("fractions", "half-quarter", "set-dial"));
    assert.ok(isNumbersCellPlayable("fractions", "unit-fractions", "set-dial"));
    assert.ok(isNumbersCellPlayable("fractions", "proper-fractions", "set-dial"));
    assert.equal(isNounsCellPlayable("suffixes", "wugs", "listen"), false);
    assert.equal(isNounsCellPlayable("plurals", "productive", "build"), false);
    assert.ok(isNounsCellPlayable("plurals", "plural-wugs", "build"));
    assert.ok(isNounsCellPlayable("plurals", "plural-wugs", "choose"));
    assert.ok(isNounsCellPlayable("plurals", "plural-wugs", "proofread"));
    const pluralTopic = NOUNS_TOPICS.find((t) => t.id === "plurals");
    assert.ok(!pluralTopic?.steps?.some((s) => s.id === "plural-lexical"));
    assert.deepEqual(
      pluralTopic.steps.map((s) => s.id),
      ["plural-patterns", "plural-wugs", "plural-real-words"]
    );
    assert.equal(introModeForNounsStep("plurals", "plural-patterns").id, "build");
    assert.equal(isNounsCellPlayable("plurals", "plural-patterns", "choose"), false);
    assert.ok(isNounsCellPlayable("plurals", "plural-patterns", "build"));
    assert.ok(isNounsCellPlayable("plurals", "plural-patterns", "proofread"));
  });

  it("Suffixes stays startable when Write is exclusive", () => {
    const writeOnly = nounsCellsMatchingCaps("suffixes", {
      keyboard: "only",
      audio: true,
    });
    assert.deepEqual(
      writeOnly.map((c) => c.stepId),
      ["proofread"]
    );
    assert.equal(writeOnly[0].modeId, "proofread");

    const both = nounsCellsMatchingCaps("suffixes", {
      keyboard: true,
      audio: true,
    });
    assert.deepEqual(
      both.map((c) => [c.stepId, c.modeId]),
      [
        ["wugs", "choose"],
        ["real-words", "choose"],
        ["proofread", "proofread"],
      ]
    );

    const listenOnly = nounsCellsMatchingCaps("suffixes", {
      keyboard: true,
      audio: "only",
    });
    assert.equal(listenOnly.length, 0);
  });

  it("Numbers units without Build or Convert still deal under the matching cap", () => {
    const both = { keyboard: true, audio: true };
    const writeOnly = { keyboard: "only", audio: true };
    const komma = modesForStep("decimals", "komma-read").map((m) => m.id);
    const place = modesForStep("decimals", "place-value").map((m) => m.id);
    assert.equal(komma.includes("build"), false);
    assert.equal(stepDealsForMix(komma, "either", both), true);
    assert.equal(place.includes("convert"), false);
    assert.equal(stepDealsForMix(place, "convert", writeOnly), true);
    assert.equal(presetMatchesCaps("visual-freeform", writeOnly), true);
    assert.equal(presetMatchesCaps("set-dial", both), true);

    for (const id of [
      "build",
      "choose",
      "listen",
      "convert",
      "proofread",
      "visual",
      "visual-freeform",
      "set-dial",
      "sentence",
      "listen-type",
      "sentence-type",
    ]) {
      for (const caps of [both, writeOnly, { keyboard: true, audio: "only" }]) {
        assert.equal(
          nounPresetMatchesCaps(id, caps),
          presetMatchesCaps(id, caps),
          id
        );
      }
    }

    for (const t of NUMBERS_TOPICS) {
      if (!t.playable) continue;
      for (const s of t.steps || []) {
        if (!s.playable) continue;
        const ids = modesForStep(t.id, s.id).map((m) => m.id);
        if (!ids.some((id) => presetMatchesCaps(id, both))) continue;
        assert.equal(
          stepDealsForMix(ids, "either", both),
          true,
          `${t.id}/${s.id}`
        );
        if (ids.some((id) => presetMatchesCaps(id, writeOnly))) {
          assert.equal(
            stepDealsForMix(ids, "convert", writeOnly),
            true,
            `${t.id}/${s.id} write`
          );
        }
      }
    }
  });
});



