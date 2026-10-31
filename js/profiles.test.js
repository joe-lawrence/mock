import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PROFILES_SCHEMA,
  defaultProfileStore,
  normalizeProfileStore,
  addProfile,
  switchActiveProfile,
  deleteProfile,
  exportProfileDocument,
  importProfileDocument,
  recordProfileAttempt,
  recordProfileDealerReason,
  startProfileSession,
  endProfileSession,
  resetProfileTracking,
  getActiveProfile,
  listProfiles,
  saveProfileStore,
  loadProfileStore,
} from "./profiles.js";
import {
  buildReportCard,
  buildFullAudit,
  reportCardToPlaintext,
  fullAuditToPlaintext,
  readinessFromStat,
  parseUnitKey,
  buildProgressReport,
  progressReportHtml,
} from "./mastery-export.js";
import {
  MASTERY_REPORT_CARD_SCHEMA,
  MASTERY_FULL_AUDIT_SCHEMA,
} from "./guidance-contracts.js";

/** @returns {Storage} */
function memStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe("profiles + mastery export (Slice 7)", () => {
  it("default store has one active profile", () => {
    const s = defaultProfileStore();
    assert.equal(s.schema, PROFILES_SCHEMA);
    assert.equal(listProfiles(s).length, 1);
    assert.equal(getActiveProfile(s).label, "You");
  });

  it("isolates evidence across two profiles", () => {
    let store = defaultProfileStore();
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:tens",
      presetId: "build",
      evidenceIds: ["tens.60"],
      correct: false,
      hintDepth: 1.3,
    });
    const aId = store.activeId;
    store = addProfile(store, "Guest");
    const bId = store.activeId;
    assert.notEqual(aId, bId);
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:base",
      presetId: "listen",
      evidenceIds: [],
      correct: true,
      hintDepth: 0,
    });
    const guest = store.profiles[bId];
    const you = store.profiles[aId];
    assert.equal(guest.evidence.grains["numbers:cardinals:base"].correct, 1);
    assert.equal(you.evidence.grains["numbers:cardinals:tens"].correct, 0);
    assert.equal(you.evidence.grains["numbers:cardinals:base"], undefined);
    assert.ok(you.hintHistory.length >= 1);
  });

  it("export/import profile round-trips", () => {
    let store = defaultProfileStore();
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:compounds",
      presetId: "convert",
      evidenceIds: ["compound.eins→ein"],
      correct: true,
    });
    const doc = exportProfileDocument(getActiveProfile(store));
    assert.equal(doc.schema, "schnapp.profile-export.v0");
    assert.ok(doc.profile.evidence.grains["numbers:cardinals:compounds"]);

    let other = addProfile(defaultProfileStore(), "Other");
    other = importProfileDocument(other, doc, { activate: true });
    const active = getActiveProfile(other);
    assert.ok(
      active.evidence.grains["numbers:cardinals:compounds"]?.total >= 1
    );
    assert.match(active.label, /You|import/);
  });

  it("switch + delete keep at least one profile", () => {
    let store = defaultProfileStore();
    store = addProfile(store, "B");
    const b = store.activeId;
    store = switchActiveProfile(store, "p_default");
    assert.equal(store.activeId, "p_default");
    store = deleteProfile(store, b);
    assert.equal(listProfiles(store).length, 1);
    store = deleteProfile(store, store.activeId);
    assert.equal(listProfiles(store).length, 1);
  });

  it("normalize rejects bad payloads", () => {
    const s = normalizeProfileStore({ schema: "nope" });
    assert.equal(s.schema, PROFILES_SCHEMA);
  });

  it("recordProfileDealerReason tallies codes", () => {
    let store = defaultProfileStore();
    store = recordProfileDealerReason(store, "new");
    store = recordProfileDealerReason(store, "new");
    store = recordProfileDealerReason(store, "review");
    const p = getActiveProfile(store);
    assert.equal(p.dealerStats.new, 2);
    assert.equal(p.dealerStats.review, 1);
  });

  it("report card + full audit match contract schemas", () => {
    let store = defaultProfileStore();
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:tens",
      presetId: "build",
      evidenceIds: ["tens.60"],
      correct: false,
      hintDepth: 2,
    });
    store = recordProfileDealerReason(store, "edge_of_competence");
    const p = getActiveProfile(store);
    const card = buildReportCard(p);
    assert.equal(card.schema, MASTERY_REPORT_CARD_SCHEMA.schema);
    assert.ok(card.units.some((u) => u.readiness === "weak"));
    assert.ok(card.suggestedNext);

    const audit = buildFullAudit(p);
    assert.equal(audit.schema, MASTERY_FULL_AUDIT_SCHEMA.schema);
    assert.ok(audit.interaction.some((r) => r.presetId === "build"));
    assert.ok(audit.concepts.some((c) => c.conceptId === "tens.60"));
    assert.equal(audit.dealerStats.edge_of_competence, 1);

    const text = reportCardToPlaintext(card);
    assert.match(text, /Mastery report card/);
    assert.match(fullAuditToPlaintext(audit), /full audit/i);
  });

  it("parseUnitKey and readiness helpers", () => {
    assert.deepEqual(parseUnitKey("numbers:cardinals:tens×convert"), {
      territory: "numbers",
      topicId: "cardinals",
      unitId: "tens",
      presetId: "convert",
    });
    assert.equal(readinessFromStat(null), "unseen");
    assert.equal(readinessFromStat({ correct: 0, total: 2 }), "weak");
    assert.equal(readinessFromStat({ correct: 9, total: 10 }), "ready");
  });

  it("mem storage save/load via normalize shape", () => {
    const storage = memStorage();
    let store = defaultProfileStore();
    store = addProfile(store, "Kid");
    saveProfileStore(store, storage);
    const loaded = loadProfileStore(storage);
    assert.equal(listProfiles(loaded).length, 2);
    assert.equal(getActiveProfile(loaded).label, "Kid");
  });

  it("keeps quiz sessions separate and rolls them into the overall total", () => {
    let store = defaultProfileStore();
    store = startProfileSession(store, {
      mode: "guided",
      label: "Guided · Time",
    });
    store = recordProfileAttempt(store, {
      dealKey: "numbers:time:time-words",
      presetId: "vocab",
      evidenceIds: [],
      correct: true,
    });
    store = startProfileSession(store, {
      mode: "play",
      label: "Play · Suffixes",
    });
    store = recordProfileAttempt(store, {
      dealKey: "nouns:suffixes:real-words",
      presetId: "choose",
      evidenceIds: ["tens.60"],
      correct: false,
    });

    const profile = getActiveProfile(store);
    assert.equal(profile.sessions.length, 2);
    const play = profile.sessions.find((s) => s.label === "Play · Suffixes");
    const guided = profile.sessions.find((s) => s.label === "Guided · Time");
    assert.equal(play.endedAt, null);
    assert.equal(play.mode, "play");
    assert.ok(guided.endedAt);
    assert.equal(play.evidence.grains["nouns:suffixes:real-words"].correct, 0);
    assert.equal(play.evidence.grains["numbers:time:time-words"], undefined);
    assert.equal(guided.evidence.grains["numbers:time:time-words"].correct, 1);
    assert.equal(guided.evidence.grains["nouns:suffixes:real-words"], undefined);
    assert.equal(profile.evidence.grains["numbers:time:time-words"].correct, 1);
    assert.equal(profile.evidence.grains["nouns:suffixes:real-words"].total, 1);
    assert.equal(profile.attemptCount, 2);

    const report = buildProgressReport(profile);
    assert.ok(report.overall.strong.some((u) => u.unitId === "time-words"));
    assert.ok(report.overall.needsWork.some((u) => u.unitId === "real-words"));
    assert.match(report.overall.next, /Real Words/);
    assert.ok(report.overall.topics.some((t) => t.label === "Numbers · Time"));
    assert.ok(report.overall.topics.some((t) => t.label === "Nouns · Suffixes"));
    assert.equal(report.sessions.length, 2);
    assert.equal(report.sessions[0].label, "Play · Suffixes");
    assert.deepEqual(report.sessions[0].strong, []);
    assert.equal(report.sessions[0].needsWork.length, 1);
    assert.equal(report.sessions[1].strong.length, 1);
    assert.ok(report.overall.concepts.includes("tens.60"));
    assert.equal(report.earlierAttempts, 0);
    const html = progressReportHtml(report);
    assert.match(html, /Overall/);
    assert.match(html, /What's next/);
    assert.match(html, /needs work/);
    assert.match(html, />strong</);
    assert.match(html, /Numbers · Time/);
    assert.match(html, /Nouns · Suffixes/);
    assert.match(html, /Play · Suffixes/);
    assert.match(html, /Guided · Time/);
    assert.match(html, /By activity/);
    assert.match(html, /Tens\.60/);
    const escaped = progressReportHtml({
      ...report,
      profileLabel: "You <script>",
    });
    assert.match(escaped, /You &lt;script&gt;/);
    assert.doesNotMatch(escaped, /<script>/);
  });

  it("opens a Practice session when an answer arrives with none open", () => {
    let store = startProfileSession(defaultProfileStore(), {
      mode: "learn",
      label: "Learn",
    });
    store = endProfileSession(store);
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:tens",
      presetId: "build",
      evidenceIds: [],
      correct: true,
    });
    const open = getActiveProfile(store).sessions.find((s) => !s.endedAt);
    assert.equal(open.label, "Practice");
    assert.equal(open.attemptCount, 1);
    assert.equal(open.evidence.grains["numbers:cardinals:tens"].correct, 1);
  });

  it("resetProfileTracking zeros scores and sessions and keeps the profile", () => {
    let store = defaultProfileStore();
    store.profiles[store.activeId].wordBank = {
      introducedUnits: ["numbers:cardinals:tens"],
      cards: {},
    };
    store.profiles[store.activeId].prefs.numbersDifficulty = "assisted";
    store = startProfileSession(store, { mode: "play", label: "Play" });
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:tens",
      presetId: "build",
      evidenceIds: ["tens.60"],
      correct: false,
      hintDepth: 1,
    });
    store = recordProfileDealerReason(store, "review");
    const id = store.activeId;
    const label = getActiveProfile(store).label;
    store = resetProfileTracking(store, id);
    const profile = getActiveProfile(store);
    assert.equal(profile.id, id);
    assert.equal(profile.label, label);
    assert.equal(profile.attemptCount, 0);
    assert.deepEqual(profile.sessions, []);
    assert.deepEqual(profile.evidence.grains, {});
    assert.deepEqual(profile.hintHistory, []);
    assert.deepEqual(profile.dealerStats, {});
    assert.equal(profile.prefs.numbersDifficulty, "assisted");
    assert.deepEqual(profile.wordBank.introducedUnits, ["numbers:cardinals:tens"]);
    const report = buildProgressReport(profile);
    assert.equal(report.overall.units.length, 0);
    assert.match(report.overall.next, /Start Guided/);
    assert.equal(report.sessions.length, 0);
    const html = progressReportHtml(report);
    assert.match(html, /No scored answers in this group yet/);
    assert.match(html, /No quiz sessions yet/);
  });

  it("normalize keeps a single open session", () => {
    const store = normalizeProfileStore({
      schema: PROFILES_SCHEMA,
      activeId: "p_default",
      profiles: {
        p_default: {
          id: "p_default",
          label: "You",
          sessions: [
            {
              id: "s_old",
              label: "Older",
              mode: "play",
              startedAt: "2020-01-01T00:00:00.000Z",
              endedAt: null,
              attemptCount: 1,
              evidence: { grains: {} },
            },
            {
              id: "s_new",
              label: "Newer",
              mode: "guided",
              startedAt: "2021-06-01T00:00:00.000Z",
              endedAt: null,
              attemptCount: 2,
              evidence: { grains: {} },
            },
          ],
        },
      },
    });
    const open = getActiveProfile(store).sessions.filter((s) => !s.endedAt);
    assert.equal(open.length, 1);
    assert.equal(open[0].id, "s_new");
  });
});
