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
  GENDER_SHORTCUTS_UNITS,
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
    // 144 + 7 visual-freeform − 10 cloze = 141
    assert.equal(n, 141);
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
    assert.equal(n, 9);
  });

  it("Nouns launch shape matches Numbers (topic + step + mode)", () => {
    assert.ok(isNounsCellPlayable("categories", "gender-recognition", "choose"));
    assert.ok(isNounsCellPlayable("categories", "sentence-validation", "proofread"));
    assert.ok(isNounsCellPlayable("categories", "cardinal-directions", "choose"));
    assert.equal(isNounsCellPlayable("suffixes", "wugs", "listen"), false);
    assert.equal(isNounsCellPlayable("plurals", "productive", "build"), false);
  });
});

