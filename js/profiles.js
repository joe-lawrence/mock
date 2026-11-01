/**
 * Local multi-profile store (spec §17 / Slice 7).
 * Schema-versioned JSON in localStorage — isolated mastery per profile.
 */

import {
  emptyEvidenceStore,
  recordAttemptEvidence,
} from "./multi-grain-evidence.js";
import { emptyWordBank, normalizeWordBank } from "./word-bank.js";
import {
  emptyGuidedProgress,
  normalizeGuidedProgress,
} from "./guided-path.js";

export const PROFILES_SCHEMA = "schnapp.profiles.v0";
export const PROFILES_STORAGE_KEY = "schnapp-profiles";
/** One-time: old default soft-arc was assisted; Independent is now the default. */
export const ASSIST_DEFAULT_MIGRATE_KEY = "schnapp-assist-default-independent-v1";

const HINT_HISTORY_CAP = 100;
const SESSION_CAP = 40;
const SESSION_MODES = new Set(["guided", "play", "learn", "practice"]);

/**
 * @typedef {object} ProfilePrefs
 * @property {"assisted"|"core"} [numbersDifficulty]
 * @property {"assisted"|"core"} [nounsDifficulty]
 */

/**
 * @typedef {object} LearnerProfile
 * @property {string} id
 * @property {string} label
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {{ grains: Record<string, object> }} evidence
 * @property {ProfilePrefs} prefs
 * @property {{ at: number, depth: number, unitKey?: string, presetId?: string }[]} hintHistory
 * @property {Record<string, number>} dealerStats
 * @property {number} attemptCount
 * @property {QuizSession[]} sessions
 * @property {{ graduated: string[], skipped: string[], openKey: string|null, stage: number, streak: number, deals: number }} [guidedProgress]
 */

/**
 * One bounded run of quizzing (a Start on the home screen, or a later practice burst).
 * Evidence here is that run only. The profile evidence store is the overall total.
 * @typedef {object} QuizSession
 * @property {string} id
 * @property {string} label
 * @property {"guided"|"play"|"learn"|"practice"} mode
 * @property {string} startedAt
 * @property {string|null} endedAt
 * @property {number} attemptCount
 * @property {{ grains: Record<string, object> }} evidence
 */

/**
 * @typedef {object} ProfileStore
 * @property {string} schema
 * @property {string} activeId
 * @property {Record<string, LearnerProfile>} profiles
 */

function uid(prefix = "p") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function nowIso() {
  return new Date().toISOString();
}

/** @param {string} [label] @returns {LearnerProfile} */
export function createEmptyProfile(label = "You") {
  const at = nowIso();
  return {
    id: uid("p"),
    label: String(label || "Learner").trim() || "Learner",
    createdAt: at,
    updatedAt: at,
    evidence: emptyEvidenceStore(),
    prefs: {
      numbersDifficulty: "core",
      nounsDifficulty: "core",
    },
    hintHistory: [],
    dealerStats: {},
    attemptCount: 0,
    sessions: [],
    wordBank: emptyWordBank(),
    guidedProgress: emptyGuidedProgress(),
  };
}

/** @param {unknown} raw @returns {QuizSession|null} */
function normalizeSession(raw) {
  if (!raw || typeof raw !== "object") return null;
  const src = /** @type {Record<string, unknown>} */ (raw);
  const mode = SESSION_MODES.has(String(src.mode)) ? String(src.mode) : "practice";
  return {
    id: typeof src.id === "string" && src.id ? src.id : uid("s"),
    label: String(src.label || "Quiz").trim() || "Quiz",
    mode,
    startedAt: typeof src.startedAt === "string" ? src.startedAt : nowIso(),
    endedAt: typeof src.endedAt === "string" && src.endedAt ? src.endedAt : null,
    attemptCount: Number(src.attemptCount) || 0,
    evidence:
      src.evidence &&
      typeof src.evidence === "object" &&
      /** @type {{ grains?: object }} */ (src.evidence).grains
        ? {
            grains: {
              .../** @type {{ grains: Record<string, object> }} */ (src.evidence).grains,
            },
          }
        : emptyEvidenceStore(),
  };
}

/** @param {unknown} raw @returns {QuizSession[]} */
function normalizeSessions(raw) {
  if (!Array.isArray(raw)) return [];
  const sessions = raw.map(normalizeSession).filter(Boolean).slice(0, SESSION_CAP);
  const open = sessions.filter((s) => !s.endedAt);
  if (open.length > 1) {
    open.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    const keep = open[0].id;
    for (const s of sessions) {
      if (!s.endedAt && s.id !== keep) s.endedAt = s.startedAt;
    }
  }
  return sessions;
}

/** @param {LearnerProfile} profile @returns {QuizSession|null} */
function openSession(profile) {
  return (profile?.sessions || []).find((s) => s && !s.endedAt) || null;
}

/** @returns {ProfileStore} */
export function defaultProfileStore() {
  const p = createEmptyProfile("You");
  p.id = "p_default";
  return {
    schema: PROFILES_SCHEMA,
    activeId: p.id,
    profiles: { [p.id]: p },
  };
}

/** @param {unknown} raw @returns {ProfileStore} */
export function normalizeProfileStore(raw) {
  if (!raw || typeof raw !== "object") return defaultProfileStore();
  const src = /** @type {Record<string, unknown>} */ (raw);
  if (src.schema !== PROFILES_SCHEMA || !src.profiles || typeof src.profiles !== "object") {
    return defaultProfileStore();
  }
  const profiles = /** @type {Record<string, LearnerProfile>} */ ({});
  for (const [id, p] of Object.entries(
    /** @type {Record<string, LearnerProfile>} */ (src.profiles)
  )) {
    if (!p || typeof p !== "object") continue;
    profiles[id] = {
      id: p.id || id,
      label: p.label || "Learner",
      createdAt: p.createdAt || nowIso(),
      updatedAt: p.updatedAt || nowIso(),
      evidence: p.evidence?.grains
        ? { grains: { ...p.evidence.grains } }
        : emptyEvidenceStore(),
      prefs: {
        numbersDifficulty:
          p.prefs?.numbersDifficulty === "assisted" ? "assisted" : "core",
        nounsDifficulty:
          p.prefs?.nounsDifficulty === "assisted" ? "assisted" : "core",
      },
      hintHistory: Array.isArray(p.hintHistory) ? p.hintHistory.slice(-HINT_HISTORY_CAP) : [],
      dealerStats: p.dealerStats && typeof p.dealerStats === "object" ? { ...p.dealerStats } : {},
      attemptCount: Number(p.attemptCount) || 0,
      sessions: normalizeSessions(p.sessions),
      wordBank: normalizeWordBank(p.wordBank),
      guidedProgress: normalizeGuidedProgress(p.guidedProgress),
    };
  }
  if (!Object.keys(profiles).length) return defaultProfileStore();
  const activeId =
    typeof src.activeId === "string" && profiles[src.activeId]
      ? src.activeId
      : Object.keys(profiles)[0];
  return { schema: PROFILES_SCHEMA, activeId, profiles };
}

/**
 * One-time migrate profile soft-arc prefs from the old Assisted default → Independent.
 * @param {ProfileStore} store
 * @param {Storage} [storage]
 */
function migrateAssistDefaultIndependent(store, storage = globalThis.localStorage) {
  try {
    if (storage?.getItem?.(ASSIST_DEFAULT_MIGRATE_KEY) === "1") return store;
    let changed = false;
    for (const p of Object.values(store.profiles || {})) {
      if (!p?.prefs) continue;
      if (p.prefs.numbersDifficulty === "assisted") {
        p.prefs.numbersDifficulty = "core";
        changed = true;
      }
      if (p.prefs.nounsDifficulty === "assisted") {
        p.prefs.nounsDifficulty = "core";
        changed = true;
      }
    }
    storage?.setItem?.(ASSIST_DEFAULT_MIGRATE_KEY, "1");
    if (changed) {
      storage?.setItem?.(PROFILES_STORAGE_KEY, JSON.stringify(store));
    }
  } catch {
    /* ignore */
  }
  return store;
}

/** @param {Storage} [storage] */
export function loadProfileStore(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(PROFILES_STORAGE_KEY);
    if (!raw) return defaultProfileStore();
    const store = normalizeProfileStore(JSON.parse(raw));
    return migrateAssistDefaultIndependent(store, storage);
  } catch {
    return defaultProfileStore();
  }
}

/** @param {ProfileStore} store @param {Storage} [storage] */
export function saveProfileStore(store, storage = globalThis.localStorage) {
  const normalized = normalizeProfileStore(store);
  storage?.setItem?.(PROFILES_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

/** @param {ProfileStore} store */
export function listProfiles(store) {
  return Object.values(store?.profiles || {}).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

/** @param {ProfileStore} store @param {object} wordBank */
export function updateActiveWordBank(store, wordBank) {
  const s = normalizeProfileStore(store);
  const profile = s.profiles[s.activeId];
  if (!profile) return s;
  profile.wordBank = normalizeWordBank(wordBank);
  profile.updatedAt = nowIso();
  return s;
}

/** @param {ProfileStore} store */
export function activeWordBank(store) {
  return normalizeWordBank(getActiveProfile(store)?.wordBank);
}

export function getActiveProfile(store) {
  const s = normalizeProfileStore(store);
  return s.profiles[s.activeId] || listProfiles(s)[0];
}

/** @param {ProfileStore} store @param {string} id */
export function switchActiveProfile(store, id) {
  const s = normalizeProfileStore(store);
  if (!s.profiles[id]) return s;
  s.activeId = id;
  return s;
}

/** @param {ProfileStore} store @param {string} [label] */
export function addProfile(store, label = "Learner") {
  const s = normalizeProfileStore(store);
  const p = createEmptyProfile(label);
  s.profiles[p.id] = p;
  s.activeId = p.id;
  return s;
}

/** @param {ProfileStore} store @param {string} id @param {string} label */
export function renameProfile(store, id, label) {
  const s = normalizeProfileStore(store);
  const p = s.profiles[id];
  if (!p) return s;
  p.label = String(label || "").trim() || p.label;
  p.updatedAt = nowIso();
  return s;
}

/** @param {ProfileStore} store @param {string} id */
export function deleteProfile(store, id) {
  const s = normalizeProfileStore(store);
  const ids = Object.keys(s.profiles);
  if (ids.length <= 1 || !s.profiles[id]) return s;
  delete s.profiles[id];
  if (s.activeId === id) s.activeId = Object.keys(s.profiles)[0];
  return s;
}

/**
 * Export one profile as a portable JSON document.
 * @param {LearnerProfile} profile
 */
export function exportProfileDocument(profile) {
  const p = normalizeProfileStore({
    schema: PROFILES_SCHEMA,
    activeId: profile.id,
    profiles: { [profile.id]: profile },
  }).profiles[profile.id];
  return {
    schema: "schnapp.profile-export.v0",
    exportedAt: nowIso(),
    profile: p,
  };
}

/**
 * Import a profile export into the store (replace same id, else add as copy).
 * @param {ProfileStore} store
 * @param {unknown} doc
 * @param {{ activate?: boolean, replace?: boolean }} [opts]
 */
export function importProfileDocument(store, doc, opts = {}) {
  const s = normalizeProfileStore(store);
  const body = typeof doc === "string" ? JSON.parse(doc) : doc;
  const raw =
    body?.profile ||
    (body?.schema === PROFILES_SCHEMA && body?.profiles
      ? body.profiles[body.activeId]
      : null);
  if (!raw || typeof raw !== "object") {
    throw new Error("Not a Schnapp profile export");
  }
  const rawId = raw.id || uid("p");
  const incoming = normalizeProfileStore({
    schema: PROFILES_SCHEMA,
    activeId: rawId,
    profiles: { [rawId]: { ...raw, id: rawId } },
  }).profiles[rawId];
  if (!s.profiles[incoming.id] || opts.replace) {
    s.profiles[incoming.id] = incoming;
  } else {
    const copy = {
      ...incoming,
      id: uid("p"),
      label: `${incoming.label} (import)`,
    };
    s.profiles[copy.id] = copy;
    if (opts.activate !== false) s.activeId = copy.id;
    return s;
  }
  if (opts.activate !== false) s.activeId = incoming.id;
  return s;
}

/**
 * Close the active profile's open quiz session, if any.
 * @param {ProfileStore} store
 */
export function endProfileSession(store) {
  const s = normalizeProfileStore(store);
  const p = getActiveProfile(s);
  const open = openSession(p);
  if (!open) return s;
  open.endedAt = nowIso();
  p.updatedAt = open.endedAt;
  s.profiles[p.id] = p;
  return s;
}

/**
 * Start a quiz session on the active profile. Closes the previous open session.
 * @param {ProfileStore} store
 * @param {{ mode?: string, label?: string }} [meta]
 */
export function startProfileSession(store, meta = {}) {
  const s = endProfileSession(store);
  const p = getActiveProfile(s);
  const mode = SESSION_MODES.has(String(meta.mode)) ? String(meta.mode) : "practice";
  const session = {
    id: uid("s"),
    label: String(meta.label || "Quiz").trim() || "Quiz",
    mode,
    startedAt: nowIso(),
    endedAt: null,
    attemptCount: 0,
    evidence: emptyEvidenceStore(),
  };
  p.sessions = [session, ...(p.sessions || [])].slice(0, SESSION_CAP);
  p.updatedAt = session.startedAt;
  s.profiles[p.id] = p;
  return s;
}

/**
 * Zero mastery tracking on a profile. Keeps the profile, its name, prefs, and word bank.
 * @param {ProfileStore} store
 * @param {string} [id] defaults to the active profile
 */
export function resetProfileTracking(store, id) {
  const s = normalizeProfileStore(store);
  const pid = id || s.activeId;
  const p = s.profiles[pid];
  if (!p) return s;
  p.evidence = emptyEvidenceStore();
  p.sessions = [];
  p.attemptCount = 0;
  p.hintHistory = [];
  p.dealerStats = {};
  p.guidedProgress = emptyGuidedProgress();
  p.updatedAt = nowIso();
  s.profiles[p.id] = p;
  return s;
}

/**
 * Record a scored attempt into the active profile’s long-term evidence
 * and into the open quiz session (opening a Practice session if none is open).
 * @param {ProfileStore} store
 * @param {{
 *   dealKey?: string,
 *   presetId?: string|null,
 *   stimulus?: string|null,
 *   response?: string|null,
 *   evidenceIds?: string[],
 *   correct: boolean,
 *   hintDepth?: number|null,
 * }} attempt
 */
export function recordProfileAttempt(store, attempt) {
  const s = normalizeProfileStore(store);
  const p = getActiveProfile(s);
  if (!p.evidence) p.evidence = emptyEvidenceStore();
  recordAttemptEvidence(p.evidence, attempt);
  p.attemptCount = (p.attemptCount || 0) + 1;
  let session = openSession(p);
  if (!session) {
    session = {
      id: uid("s"),
      label: "Practice",
      mode: "practice",
      startedAt: nowIso(),
      endedAt: null,
      attemptCount: 0,
      evidence: emptyEvidenceStore(),
    };
    p.sessions = [session, ...(p.sessions || [])].slice(0, SESSION_CAP);
  }
  if (!session.evidence) session.evidence = emptyEvidenceStore();
  recordAttemptEvidence(session.evidence, attempt);
  session.attemptCount = (session.attemptCount || 0) + 1;
  if (attempt.hintDepth != null && Number.isFinite(Number(attempt.hintDepth))) {
    p.hintHistory = p.hintHistory || [];
    p.hintHistory.push({
      at: Date.now(),
      depth: Number(attempt.hintDepth),
      unitKey: attempt.dealKey || undefined,
      presetId: attempt.presetId || undefined,
    });
    if (p.hintHistory.length > HINT_HISTORY_CAP) {
      p.hintHistory = p.hintHistory.slice(-HINT_HISTORY_CAP);
    }
  }
  p.updatedAt = nowIso();
  s.profiles[p.id] = p;
  return s;
}

/** @param {ProfileStore} store @param {unknown} progress */
export function recordGuidedProgress(store, progress) {
  const s = normalizeProfileStore(store);
  const p = getActiveProfile(s);
  if (!p) return s;
  p.guidedProgress = normalizeGuidedProgress(progress);
  p.updatedAt = nowIso();
  s.profiles[p.id] = p;
  return s;
}

/** @param {ProfileStore} store @param {string} reasonCode */
export function recordProfileDealerReason(store, reasonCode) {
  const s = normalizeProfileStore(store);
  const p = getActiveProfile(s);
  const code = String(reasonCode || "").trim();
  if (!code) return s;
  p.dealerStats = p.dealerStats || {};
  p.dealerStats[code] = (p.dealerStats[code] || 0) + 1;
  p.updatedAt = nowIso();
  s.profiles[p.id] = p;
  return s;
}

/** @param {ProfileStore} store @param {ProfilePrefs} prefs */
export function updateActivePrefs(store, prefs) {
  const s = normalizeProfileStore(store);
  const p = getActiveProfile(s);
  p.prefs = { ...p.prefs, ...prefs };
  p.updatedAt = nowIso();
  s.profiles[p.id] = p;
  return s;
}
