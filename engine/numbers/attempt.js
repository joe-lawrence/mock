/**
 * Auditable attempt records for Numbers exercises.
 */

import { ENGINE_VERSION, DATA_VERSION } from "./cardinal.js";

let seq = 0;

/**
 * @param {object} input
 * @param {string} input.exerciseId
 * @param {object} input.prompt
 * @param {object} input.rawInput
 * @param {string} [input.normalizedInput]
 * @param {object} input.evaluation
 * @param {string[]} [input.evidenceIds]
 * @param {object} [input.scaffolding]
 * @param {string} [input.appVersion]
 */
export function recordNumberAttempt({
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
  const evidence = evidenceIds || evaluation?.evidenceIds || [];
  return {
    id: `num-attempt-${Date.now()}-${seq}`,
    timestamp: new Date().toISOString(),
    exerciseId,
    versions: {
      engine: ENGINE_VERSION,
      data: DATA_VERSION,
      app: appVersion,
    },
    prompt,
    rawInput,
    normalizedInput:
      normalizedInput ??
      (Array.isArray(rawInput?.parts) ? rawInput.parts.join("") : undefined),
    evaluation,
    evidenceIds: evidence,
    scaffolding,
  };
}
