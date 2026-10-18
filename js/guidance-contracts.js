/**
 * Guidance contracts — field lists for packages, attempts, mastery exports.
 * Spec §§7, 14, 17, 19. Slice 0 identity; schemas evolve with later slices.
 */

/** Curriculum package (authoritative, versioned files — not profile state). */
export const CURRICULUM_PACKAGE_SCHEMA = Object.freeze({
  schema: "schnapp.curriculum-package.v0",
  /** Top-level keys expected in a package JSON document. */
  keys: [
    "schema",
    "version",
    "territory",
    "softArc",
    "topics",
    "interactionPresets",
    "hintLadders",
  ],
  topicKeys: ["id", "label", "playable", "blurb", "units"],
  unitKeys: [
    "id",
    "label",
    "playable",
    "blurb",
    "pool",
    "interactionPresets",
    "softAfter",
    "chartTab",
    "plannedPresets",
  ],
  presetRefKeys: ["id", "seedDifficulty"],
  hintLadderKeys: ["formatKind", "formatId", "steps"],
});

/**
 * Scored attempt record (minimum fields — §19).
 * Implementations MAY add fields; MUST NOT drop these when exporting audits.
 */
export const ATTEMPT_RECORD_FIELDS = Object.freeze([
  "exerciseId",
  "versions",
  "prompt",
  "rawInput",
  "normalizedInput",
  "evaluation",
  "evidenceIds",
  "supportVector",
  "hintDepth",
  "timing",
  "masteryDeltas",
  "dealerReason",
  "interactionPreset",
  "stimulus",
  "response",
  "topicId",
  "unitId",
  "territory",
]);

/** Mastery export — report card grain (§14). */
export const MASTERY_REPORT_CARD_SCHEMA = Object.freeze({
  schema: "schnapp.mastery.report-card.v0",
  keys: [
    "schema",
    "exportedAt",
    "profileId",
    "territories",
    "topics",
    "units",
    "suggestedNext",
  ],
  unitEntryKeys: ["topicId", "unitId", "label", "readiness", "note"],
});

/** Mastery export — full audit grain (§14). */
export const MASTERY_FULL_AUDIT_SCHEMA = Object.freeze({
  schema: "schnapp.mastery.full-audit.v0",
  keys: [
    "schema",
    "exportedAt",
    "profileId",
    "units",
    "interaction",
    "concepts",
    "hintHistory",
    "dealerStats",
  ],
  interactionEntryKeys: [
    "topicId",
    "unitId",
    "presetId",
    "stimulus",
    "response",
    "correct",
    "total",
    "hintDepthAvg",
  ],
  conceptEntryKeys: ["conceptId", "evidenceIds", "correct", "total", "note"],
});

/** Feedback notes export (already shipped — keep schema id stable). */
export const FEEDBACK_NOTES_SCHEMA = Object.freeze({
  schema: "feedback-notes.v1",
  storageKey: "schnapp-feedback-notes",
});
