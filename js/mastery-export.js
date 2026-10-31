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
import { WEAK_ACCURACY } from "../engine/dealer.js";

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
      label: `${topicHeading(parsed.territory, parsed.topicId)} · ${displayName(parsed.unitId)}`,
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

const TERRITORY_NAMES = {
  numbers: "Numbers",
  nouns: "Nouns",
  case: "Case",
  sounds: "Sounds",
};

/** Title-case a curriculum id for the report card view. */
export function displayName(id) {
  const raw = String(id || "")
    .replace(/[-_]/g, " ")
    .trim();
  if (!raw) return "";
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** @param {string} territory @param {string} topicId */
export function topicHeading(territory, topicId) {
  const terr = TERRITORY_NAMES[territory] || displayName(territory) || "Topic";
  return `${terr} · ${displayName(topicId)}`;
}

/**
 * Strong / needs-work / next for one evidence store (overall or a single session).
 * @param {Record<string, object>} grains
 * @param {number} [attemptCount]
 */
export function progressSlice(grains, attemptCount = 0) {
  const store = { grains: grains || {} };
  const card = buildReportCard({ evidence: store });
  const units = card.units;
  const topics = [];
  const byTopic = new Map();
  for (const unit of units) {
    const id = `${unit.territory}:${unit.topicId}`;
    if (!byTopic.has(id)) {
      const topic = {
        id,
        label: topicHeading(unit.territory, unit.topicId),
        units: [],
      };
      byTopic.set(id, topic);
      topics.push(topic);
    }
    byTopic.get(id).units.push(unit);
  }
  for (const topic of topics) {
    topic.strong = topic.units.filter((u) => u.readiness === "ready").length;
    topic.needsWork = topic.units.filter((u) => u.readiness === "weak").length;
  }

  const activities = grainsOfKind(store, EVIDENCE_GRAIN.UNIT_PRESET).map(
    ({ key, stat }) => {
      const parsed = parseUnitKey(key);
      return {
        label: `${displayName(parsed.unitId)} · ${displayName(parsed.presetId || "mix")}`,
        topicId: parsed.topicId,
        readiness: readinessFromStat(stat),
        correct: stat.correct,
        total: stat.total,
        accuracy: grainAccuracy(stat),
      };
    }
  );

  const concepts = weakConcepts(store, {
    threshold: WEAK_ACCURACY,
    minTotal: 1,
  }).map((w) => w.stat.conceptId || String(w.key).replace(/^concept:/, ""));

  let correct = 0;
  let total = 0;
  for (const unit of units) {
    correct += unit.correct || 0;
    total += unit.total || 0;
  }

  return {
    attemptCount,
    correct,
    total,
    units,
    topics,
    activities,
    concepts,
    strong: units.filter((u) => u.readiness === "ready"),
    needsWork: units.filter((u) => u.readiness === "weak"),
    building: units.filter((u) => u.readiness === "building"),
    next: card.suggestedNext,
  };
}

/**
 * Learner-facing breakdown: overall, then each quiz session.
 * @param {import("./profiles.js").LearnerProfile} profile
 */
export function buildProgressReport(profile) {
  const sessions = (profile?.sessions || []).map((session) => ({
    id: session.id,
    label: session.label || "Quiz",
    mode: session.mode || "practice",
    startedAt: session.startedAt || null,
    endedAt: session.endedAt || null,
    open: !session.endedAt,
    ...progressSlice(session.evidence?.grains || {}, session.attemptCount || 0),
  }));
  const sessionAttempts = sessions.reduce(
    (n, session) => n + (session.attemptCount || 0),
    0
  );
  const overallAttempts = profile?.attemptCount || 0;
  return {
    profileId: profile?.id || null,
    profileLabel: profile?.label || null,
    earlierAttempts: Math.max(0, overallAttempts - sessionAttempts),
    overall: progressSlice(profile?.evidence?.grains || {}, overallAttempts),
    sessions,
  };
}

function escapeReportHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatQuizWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function readinessMark(readiness) {
  if (readiness === "ready") return { text: "strong", cls: "is-ready" };
  if (readiness === "weak") return { text: "needs work", cls: "is-weak" };
  if (readiness === "building") return { text: "in progress", cls: "is-building" };
  return { text: "not yet", cls: "is-building" };
}

function reportUnitItems(units) {
  if (!units?.length) return `<li class="coach-soft">None yet</li>`;
  return units
    .map((unit) => {
      const mark = readinessMark(unit.readiness);
      const pct =
        unit.accuracy != null ? `${Math.round(unit.accuracy * 100)}%` : "—";
      return `<li class="report-row">
        <span>${escapeReportHtml(displayName(unit.unitId))}</span>
        <span class="report-pill ${mark.cls}">${mark.text}</span>
        <span class="coach-stat">${unit.correct}/${unit.total} · ${pct}</span>
      </li>`;
    })
    .join("");
}

function reportSliceHtml(slice) {
  if (!slice?.attemptCount && !slice?.units?.length) {
    return `<p class="coach-soft">No scored answers in this group yet.</p>`;
  }
  const topics = (slice.topics || [])
    .map((topic) => {
      const bits = [];
      if (topic.strong) bits.push(`${topic.strong} strong`);
      if (topic.needsWork) bits.push(`${topic.needsWork} need work`);
      const note = bits.length ? ` · ${bits.join(", ")}` : "";
      return `<section class="report-topic">
        <h5 class="coach-h">${escapeReportHtml(topic.label)}${
          note
            ? `<span class="coach-stat">${escapeReportHtml(note)}</span>`
            : ""
        }</h5>
        <ul class="coach-list report-units">${reportUnitItems(topic.units)}</ul>
      </section>`;
    })
    .join("");
  const activities = (slice.activities || [])
    .map((row) => {
      const mark = readinessMark(row.readiness);
      return `<li class="report-row">
        <span>${escapeReportHtml(row.label)}</span>
        <span class="report-pill ${mark.cls}">${mark.text}</span>
        <span class="coach-stat">${row.correct}/${row.total}</span>
      </li>`;
    })
    .join("");
  const concepts = (slice.concepts || [])
    .map((id) => `<li>${escapeReportHtml(displayName(id))}</li>`)
    .join("");
  return `<p class="coach-soft"><strong>What's next.</strong> ${escapeReportHtml(
    slice.next || "Keep practicing."
  )}</p>
    <h5 class="coach-h">Strong</h5>
    <ul class="coach-list report-units">${reportUnitItems(slice.strong)}</ul>
    <h5 class="coach-h">Needs work</h5>
    <ul class="coach-list report-units">${reportUnitItems(slice.needsWork)}</ul>
    <h5 class="coach-h">In progress</h5>
    <ul class="coach-list report-units">${reportUnitItems(slice.building)}</ul>
    <h5 class="coach-h">By topic</h5>
    ${topics || `<p class="coach-soft">No topics yet.</p>`}
    ${
      activities
        ? `<details class="coach-hood"><summary>By activity</summary><ul class="coach-list report-units">${activities}</ul></details>`
        : ""
    }
    ${
      concepts
        ? `<h5 class="coach-h">Concepts that need work</h5><ul class="coach-list">${concepts}</ul>`
        : ""
    }`;
}

/** Sheet body for the in-app report card. */
export function progressReportHtml(report) {
  const overall = report?.overall || progressSlice({}, 0);
  const pct =
    overall.total > 0
      ? `${Math.round((overall.correct / overall.total) * 100)}%`
      : "—";
  const earlier = report?.earlierAttempts
    ? `<p class="coach-soft">${report.earlierAttempts} earlier answers are in the overall totals only. New answers are grouped into sessions.</p>`
    : "";
  const sessions = (report?.sessions || [])
    .map((session, index) => {
      const when = formatQuizWhen(session.startedAt);
      const stateLabel = session.open ? "in progress" : "finished";
      const answers = `${session.attemptCount || 0} answers`;
      return `<details class="coach-hood" ${index === 0 ? "open" : ""}>
        <summary>${escapeReportHtml(session.label)} · ${escapeReportHtml(answers)}${
          when ? ` · ${escapeReportHtml(when)}` : ""
        } · ${stateLabel}</summary>
        ${reportSliceHtml(session)}
      </details>`;
    })
    .join("");

  return `<div class="coach-sheet report-card">
      <p class="coach-soft">${escapeReportHtml(report?.profileLabel || "Learner")} · ${
        overall.attemptCount || 0
      } answers · ${overall.correct}/${overall.total || 0} correct (${pct})</p>
      <p class="coach-soft" style="margin-top:0">
        <button type="button" class="btn" data-report-back>Back to profiles</button>
      </p>
      <section class="coach-block">
        <h4 class="coach-h">Overall</h4>
        ${reportSliceHtml(overall)}
        ${earlier}
      </section>
      <section class="coach-block">
        <h4 class="coach-h">Sessions</h4>
        ${
          sessions ||
          `<p class="coach-soft">No quiz sessions yet. Start Guided or Play and this list will split each run.</p>`
        }
      </section>
    </div>`;
}

export function reportCardJson(profile, opts) {
  return JSON.stringify(buildReportCard(profile, opts), null, 2);
}

export function fullAuditJson(profile) {
  return JSON.stringify(buildFullAudit(profile), null, 2);
}
