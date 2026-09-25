/**
 * Auditable attempt records for Nouns exercises.
 */

import { ENGINE_VERSION, DATA_VERSION } from "./noun.js";

let seq = 0;

/**
 * @param {object} input
 */
export function recordNounAttempt({
  exerciseId,
  prompt,
  rawInput,
  normalizedInput,
  evaluation,
  evidenceIds,
  scaffolding = {},
  appVersion = "mock",
}) {
  seq += 1;
  return {
    id: `noun-attempt-${Date.now()}-${seq}`,
    timestamp: new Date().toISOString(),
    exerciseId,
    versions: {
      engine: ENGINE_VERSION,
      data: DATA_VERSION,
      app: appVersion,
    },
    prompt,
    rawInput,
    normalizedInput,
    evaluation,
    evidenceIds: evidenceIds || evaluation?.evidenceIds || [],
    scaffolding,
  };
}
