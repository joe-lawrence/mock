/**
 * Mastery exports — report card + full audit (spec §14 / Slice 7).
 * JSON objects + plaintext renderings for copy/paste.
 */

import {
  MASTERY_REPORT_CARD_SCHEMA,
  MASTERY_FULL_AUDIT_SCHEMA,
} from "./guidance-contracts.js";
import {
  EVIDENCE_GRAIN,
  grainAccuracy,
  grainsOfKind,
  weakConcepts,
} from "./multi-grain-evidence.js";
import { WEAK_ACCURACY } from "../../engine/dealer.js";

/**
 * @param {string} key e.g. numbers:cardinals:tens or numbers:cardinals:tens×convert
 */
export function parseUnitKey(key) {
  const s = String(key || "");
  const [unitPart, presetId] = s.split("×");
  const parts = unitPart.split(":");
  if (parts.length >= 3) {
    return {
      territory: parts[0],
      topicId: parts[1],
      unitId: parts.slice(2).join(":"),
      presetId: presetId || null,
    };
  }
  if (parts.length === 2) {
    return {
      territory: parts[0],
      topicId: parts[0],
      unitId: parts[1],
      presetId: presetId || null,
    };
  }
  return {
    territory: "?",
    topicId: "?",
    unitId: s || "?",
    presetId: presetId || null,
  };
}

/** @param {{ correct?: number, total?: number }|null|undefined} stat */
export function readinessFromStat(stat) {
  if (!stat?.total) return "unseen";
  const acc = grainAccuracy(stat);
  if (acc == null) return "unseen";
  if (acc >= 0.85) return "ready";
  if (acc >= WEAK_ACCURACY) return "building";
  return "weak";
}

/**
 * @param {import("./profiles.js").LearnerProfile} profile
 * @param {{ suggestedNext?: string }} [opts]
 */
export function buildReportCard(profile, opts = {}) {
  const grains = profile?.evidence?.grains || {};
  const unitRows = grainsOfKind({ grains }, EVIDENCE_GRAIN.UNIT);
  const territories = new Set();
  const topics = new Set();
  const units = unitRows.map(({ key, stat }) => {
    const parsed = parseUnitKey(key);
    territories.add(parsed.territory);
    topics.add(`${parsed.territory}:${parsed.topicId}`);
    const acc = grainAccuracy(stat);
    const readiness = readinessFromStat(stat);
    return {
      topicId: parsed.topicId,
      unitId: parsed.unitId,
      label: `${parsed.territory} · ${parsed.topicId} · ${parsed.unitId}`,
      territory: parsed.territory,
      readiness,
      correct: stat.correct,
      total: stat.total,
      accuracy: acc,
      note:
        readiness === "weak"
          ? "Needs review"
          : readiness === "ready"
            ? "Looking solid"
            : readiness === "building"
              ? "In progress"
              : "Not practiced yet",
    };
  });

  const weak = units
    .filter((u) => u.readiness === "weak")
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1));
  const suggestedNext =
    opts.suggestedNext ||
    (weak[0]
      ? `Review ${weak[0].label}`
      : units.find((u) => u.readiness === "building")
        ? `Keep going on ${
            units.find((u) => u.readiness === "building").label
          }`
        : units.length
          ? "Probe a harder preset or advance along the soft arc"
          : "Start Guided practice to build evidence");

  return {
    schema: MASTERY_REPORT_CARD_SCHEMA.schema,
    exportedAt: new Date().toISOString(),
    profileId: profile?.id || null,
    profileLabel: profile?.label || null,
    territories: [...territories].sort(),
    topics: [...topics].sort(),
    units,
    suggestedNext,
  };
}

/**
 * @param {import("./profiles.js").LearnerProfile} profile
 */
export function buildFullAudit(profile) {
  const grains = profile?.evidence?.grains || {};
  const store = { grains };

  const units = grainsOfKind(store, EVIDENCE_GRAIN.UNIT).map(({ key, stat }) => {
    const parsed = parseUnitKey(key);
    return {
      key,
      topicId: parsed.topicId,
      unitId: parsed.unitId,
      territory: parsed.territory,
      correct: stat.correct,
      total: stat.total,
      accuracy: grainAccuracy(stat),
      readiness: readinessFromStat(stat),
    };
  });

  const interaction = grainsOfKind(store, EVIDENCE_GRAIN.UNIT_PRESET).map(
    ({ key, stat }) => {
      const parsed = parseUnitKey(key);
      const hintRows = (profile?.hintHistory || []).filter(
        (h) =>
          h.unitKey === `${parsed.territory}:${parsed.topicId}:${parsed.unitId}` &&
          (!parsed.presetId || h.presetId === parsed.presetId)
      );
      const hintDepthAvg = hintRows.length
        ? hintRows.reduce((s, h) => s + Number(h.depth || 0), 0) / hintRows.length
        : null;
      return {
        topicId: parsed.topicId,
        unitId: parsed.unitId,
        presetId: parsed.presetId || stat.presetId || null,
        stimulus: null,
        response: null,
        correct: stat.correct,
        total: stat.total,
        accuracy: grainAccuracy(stat),
        hintDepthAvg,
      };
    }
  );

  const concepts = grainsOfKind(store, EVIDENCE_GRAIN.CONCEPT).map(
    ({ key, stat }) => ({
      conceptId: stat.conceptId || key.replace(/^concept:/, ""),
      evidenceIds: [stat.conceptId || key.replace(/^concept:/, "")],
      correct: stat.correct,
      total: stat.total,
      accuracy: grainAccuracy(stat),
      note:
        grainAccuracy(stat) != null && grainAccuracy(stat) < WEAK_ACCURACY
          ? "weak"
          : "",
    })
  );

  const weak = weakConcepts(store, { threshold: WEAK_ACCURACY, minTotal: 1 }).map(
    (w) => w.stat.conceptId || w.key
  );

  return {
    schema: MASTERY_FULL_AUDIT_SCHEMA.schema,
    exportedAt: new Date().toISOString(),
    profileId: profile?.id || null,
    profileLabel: profile?.label || null,
    attemptCount: profile?.attemptCount || 0,
    units,
    interaction,
    concepts,
    weakConcepts: weak,
    hintHistory: [...(profile?.hintHistory || [])],
    dealerStats: { ...(profile?.dealerStats || {}) },
  };
}

/** @param {ReturnType<typeof buildReportCard>} card */
export function reportCardToPlaintext(card) {
  const lines = [
    "Schnapp — Mastery report card",
    `Profile: ${card.profileLabel || card.profileId || "—"}`,
    `Exported: ${card.exportedAt}`,
    "",
    `Suggested next: ${card.suggestedNext}`,
    "",
    "Units:",
  ];
  if (!card.units?.length) {
    lines.push("  (none yet)");
  } else {
    for (const u of card.units) {
      const pct =
        u.accuracy != null ? `${Math.round(u.accuracy * 100)}%` : "—";
      lines.push(
        `  [${u.readiness}] ${u.label} — ${u.correct}/${u.total} (${pct}) — ${u.note}`
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

/** @param {ReturnType<typeof buildFullAudit>} audit */
export function fullAuditToPlaintext(audit) {
  const lines = [
    "Schnapp — Mastery full audit",
    `Profile: ${audit.profileLabel || audit.profileId || "—"}`,
    `Exported: ${audit.exportedAt}`,
    `Attempts: ${audit.attemptCount}`,
    "",
    "Dealer reasons:",
  ];
  const reasons = Object.entries(audit.dealerStats || {});
  if (!reasons.length) lines.push("  (none)");
  else {
    for (const [code, n] of reasons.sort((a, b) => b[1] - a[1])) {
      lines.push(`  ${code}: ${n}`);
    }
  }
  lines.push("", "Unit × preset:");
  if (!audit.interaction?.length) lines.push("  (none)");
  else {
    for (const row of audit.interaction) {
      const pct =
        row.accuracy != null ? `${Math.round(row.accuracy * 100)}%` : "—";
      const hint =
        row.hintDepthAvg != null
          ? ` · hintΔ ${row.hintDepthAvg.toFixed(1)}`
          : "";
      lines.push(
        `  ${row.topicId}/${row.unitId} × ${row.presetId || "?"} — ${row.correct}/${row.total} (${pct})${hint}`
      );
    }
  }
  lines.push("", "Concepts:");
  if (!audit.concepts?.length) lines.push("  (none)");
  else {
    for (const c of audit.concepts) {
      const pct =
        c.accuracy != null ? `${Math.round(c.accuracy * 100)}%` : "—";
      lines.push(
        `  ${c.conceptId} — ${c.correct}/${c.total} (${pct})${
          c.note ? ` · ${c.note}` : ""
        }`
      );
    }
  }
  if (audit.weakConcepts?.length) {
    lines.push("", `Weak concepts: ${audit.weakConcepts.join(", ")}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function reportCardJson(profile, opts) {
  return JSON.stringify(buildReportCard(profile, opts), null, 2);
}

export function fullAuditJson(profile) {
  return JSON.stringify(buildFullAudit(profile), null, 2);
}
