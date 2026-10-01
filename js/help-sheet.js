/**
 * Session Help sheet — Hint / Vocab / Pattern / Full Reference stack.
 * Cards are omitted when empty; content stays collapsed until tapped.
 */

import {
  getReference,
  referenceIdForPracticeContext,
} from "./reference-ui.js?v=20260930-ref1";
import {
  getVocabulary,
  vocabulary,
} from "./generated/vocabulary.js?v=20260930-vocab17";
import {
  parseCardinalForm,
} from "../engine/numbers/index.js?v=20260930-ref1";
import {
  ATOMIC,
  COMPOUND_ONES,
  TENS,
} from "../engine/numbers/data.js?v=20260930-ref1";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Lemma / surface → vocabulary item (first match). */
let _lemmaIndex = null;
function vocabLemmaIndex() {
  if (_lemmaIndex) return _lemmaIndex;
  const map = new Map();
  for (const item of Object.values(vocabulary)) {
    if (!item || item.status === "retired") continue;
    for (const key of [item.engine?.lemma, item.surface, item.heading]) {
      if (!key) continue;
      const k = String(key)
        .replace(/^(der|die|das)\s+/i, "")
        .trim()
        .toLowerCase();
      if (k && !map.has(k)) map.set(k, item);
    }
  }
  _lemmaIndex = map;
  return map;
}

export function lookupVocabByLemma(lemma) {
  if (!lemma) return null;
  const k = String(lemma)
    .replace(/^(der|die|das)\s+/i, "")
    .trim()
    .toLowerCase();
  return vocabLemmaIndex().get(k) || null;
}

const SKIP_CHOICE = new Set([
  "der",
  "die",
  "das",
  "ein",
  "eine",
  "einen",
  "correct",
  "incorrect",
  "masculine",
  "feminine",
  "neuter",
  "insufficient",
  "ok",
  "bad",
]);

/** Function words / units that aren't digit conversions. */
const NUMBER_WORD_GLOSS = Object.freeze({
  und: "and",
  komma: "decimal point (comma)",
  uhr: "o'clock",
  stunde: "hour",
  stunden: "hours",
  minute: "minute",
  minuten: "minutes",
  sekunde: "second",
  sekunden: "seconds",
  nach: "after / past",
  vor: "before / to",
  halb: "half",
  viertel: "quarter",
  euro: "euro",
  cent: "cent",
});

/** Chip / atom → integer for Help Vocab (eins→1, ein→1, zwanzig→20, …). */
let _numberChipIndex = null;
function numberChipIndex() {
  if (_numberChipIndex) return _numberChipIndex;
  const map = new Map();
  for (let n = 0; n < ATOMIC.length; n++) {
    map.set(ATOMIC[n], n);
  }
  for (const [digit, form] of Object.entries(COMPOUND_ONES)) {
    map.set(form, Number(digit));
  }
  for (const [tensDigit, form] of Object.entries(TENS)) {
    map.set(form, Number(tensDigit) * 10);
  }
  map.set("hundert", 100);
  map.set("tausend", 1000);
  _numberChipIndex = map;
  return map;
}

/**
 * @param {string} raw
 * @returns {{ value: number|null, gloss: string }}
 */
export function numberConversionForToken(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  if (!key) return { value: null, gloss: "" };

  if (NUMBER_WORD_GLOSS[key]) {
    return { value: null, gloss: NUMBER_WORD_GLOSS[key] };
  }

  const chip = numberChipIndex().get(key);
  if (chip != null) return { value: chip, gloss: String(chip) };

  const parsed = parseCardinalForm(key);
  if (parsed != null) return { value: parsed, gloss: String(parsed) };

  // Spoken ordinals inside sentence frames (zwölfte, dreiundfünfzigste, …).
  const ORDINAL_IRREG = Object.freeze({
    erste: 1,
    erster: 1,
    erstes: 1,
    ersten: 1,
    dritte: 3,
    dritter: 3,
    drittes: 3,
    dritten: 3,
    siebte: 7,
    siebter: 7,
    siebtes: 7,
    siebten: 7,
    achte: 8,
    achter: 8,
    achtes: 8,
    achten: 8,
  });
  if (ORDINAL_IRREG[key] != null) {
    const n = ORDINAL_IRREG[key];
    return { value: n, gloss: `${n}.` };
  }
  let stem = key;
  if (/ste$/.test(stem)) stem = stem.slice(0, -3);
  else if (/te$/.test(stem)) stem = stem.slice(0, -2);
  if (stem && stem !== key) {
    const ordChip = numberChipIndex().get(stem);
    if (ordChip != null) return { value: ordChip, gloss: `${ordChip}.` };
    const ordParsed = parseCardinalForm(stem);
    if (ordParsed != null) return { value: ordParsed, gloss: `${ordParsed}.` };
  }

  return { value: null, gloss: "" };
}

/**
 * Collect lemma-like strings from the active exercise.
 * @param {object|null} exercise
 * @returns {string[]}
 */
/** True for full utterances / MC sentence keys — not dict lemmas. */
function looksLikePhrase(s) {
  const t = String(s || "").trim();
  if (!t) return false;
  // Multi-word, or a single token that is clearly a punctuated sentence.
  return /\s/.test(t) || /[.!?…]$/.test(t);
}

export function lemmasOnExercise(exercise) {
  if (!exercise) return [];
  const out = [];
  const add = (raw) => {
    if (raw == null) return;
    const s = String(raw).trim();
    if (!s || SKIP_CHOICE.has(s.toLowerCase())) return;
    // Sentence / phrase answers are not vocab lemmas (e.g. sentence-ordinal MC).
    if (looksLikePhrase(s)) return;
    // Prefer capitalized German nouns / known surfaces; allow lowercase number words.
    if (!out.includes(s)) out.push(s);
  };

  add(exercise.target?.lemma);
  add(exercise.prompt?.lemma);
  add(exercise.resolution?.lemma);
  add(exercise.resolution?.expectedLemma);

  const choices = exercise.materials?.choices;
  if (Array.isArray(choices)) {
    for (const c of choices) {
      if (typeof c === "string") add(c);
    }
  }

  return out;
}

/**
 * Number-construction building blocks (German chips), when present.
 * @param {object|null} exercise
 * @returns {string[]}
 */
export function numberPartsOnExercise(exercise) {
  const parts = exercise?.materials?.parts;
  if (!Array.isArray(parts) || !parts.length) return [];
  return parts
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter((p) => p && !/^[-–—…·.]+$/.test(p));
}

function genderClass(g) {
  if (g === "masculine" || g === "m") return "m";
  if (g === "feminine" || g === "f") return "f";
  if (g === "neuter" || g === "n") return "n";
  return "";
}

function articleForGender(g) {
  if (g === "masculine") return "der";
  if (g === "feminine") return "die";
  if (g === "neuter") return "das";
  return "";
}

/** Learner-dict genitive ending cue (engine has no genitive table yet). */
function genitiveEndingForGender(g) {
  if (g === "feminine") return "-";
  if (g === "masculine" || g === "neuter") return "-(e)s";
  return "";
}

/**
 * Plural ending marker for dict line (-en, -er, -).
 * @param {string} lemma
 * @param {object|null} lex
 * @param {object|null} vocabItem
 */
function pluralEndingFor(lemma, lex, vocabItem) {
  const ending = lex?.plural?.ending;
  if (ending != null && ending !== "") {
    return ending === "—" || ending === "-" ? "-" : `-${ending}`;
  }
  const form = vocabItem?.derived?.plural || lex?.plural?.form || "";
  if (!form || !lemma) return "";
  if (form === lemma) return "-";
  // Umlaut plurals (Buch → Bücher): show full plural as -Bücher-style is ugly;
  // prefer "-"+suffix when form shares a prefix, else "-"+form.
  if (form.toLowerCase().startsWith(String(lemma).toLowerCase())) {
    const rest = form.slice(lemma.length);
    return rest ? `-${rest}` : "-";
  }
  return `-${form}`;
}

function enrichNounRow(lemma, base, lexicon) {
  const lex = lexicon[lemma] || lexicon[base.de] || null;
  const gender = base.gender || lex?.gender || null;
  const article = base.article || articleForGender(gender);
  const gloss = base.en || lex?.gloss || "";
  return {
    ...base,
    gender,
    article,
    en: gloss,
    gloss,
    genitive: gender ? genitiveEndingForGender(gender) : "",
    pluralEnding: pluralEndingFor(lemma || base.de, lex, null),
    plural: base.plural || lex?.plural?.form || "",
  };
}

function articleFromHeading(heading, surface) {
  const h = String(heading || "").trim();
  const m = h.match(/^(der|die|das)\s+(.+)$/i);
  if (!m) return null;
  if (surface && m[2] !== surface) return null;
  const article = m[1].toLowerCase();
  const gender =
    article === "der"
      ? "masculine"
      : article === "die"
        ? "feminine"
        : article === "das"
          ? "neuter"
          : null;
  return { article, gender };
}

/**
 * @param {string[]} lemmas
 * @param {string[]} [extraParts] number chips
 * @param {{ lexicon?: Record<string, { gloss?: string, gender?: string, plural?: object }> }} [opts]
 */
export function buildVocabEntries(lemmas, extraParts = [], opts = {}) {
  const lexicon = opts.lexicon || {};
  const seen = new Set();
  const rows = [];

  const pushRow = (row) => {
    const key = (row.de || "").toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  };

  for (const lemma of lemmas || []) {
    const v = lookupVocabByLemma(lemma);
    if (v) {
      const fromHeading = articleFromHeading(v.heading, v.surface);
      const gender =
        v.derived?.gender || lexicon[lemma]?.gender || fromHeading?.gender || null;
      const lex = lexicon[lemma] || null;
      pushRow({
        de: v.surface || lemma,
        lemma: v.engine?.lemma || lemma,
        en: v.gloss || v.derived?.gloss || lex?.gloss || "",
        gloss: v.gloss || v.derived?.gloss || lex?.gloss || "",
        number: null,
        article:
          v.derived?.article ||
          articleForGender(gender) ||
          fromHeading?.article ||
          "",
        gender,
        genitive: gender ? genitiveEndingForGender(gender) : "",
        pluralEnding: pluralEndingFor(
          v.engine?.lemma || lemma,
          lex,
          v
        ),
        plural: v.derived?.plural || lex?.plural?.form || "",
        fromVocab: true,
        vocabId: v.id,
        kind: "noun",
      });
      continue;
    }
    const lex = lexicon[lemma];
    if (lex) {
      pushRow(
        enrichNounRow(lemma, {
          de: lemma,
          lemma,
          en: lex.gloss || "",
          number: null,
          article: articleForGender(lex.gender),
          gender: lex.gender || null,
          plural: lex.plural?.form || "",
          fromVocab: false,
          kind: "noun",
        }, lexicon)
      );
      continue;
    }
    pushRow({
      de: lemma,
      lemma,
      en: "",
      gloss: "",
      number: null,
      article: "",
      gender: null,
      genitive: "",
      pluralEnding: "",
      plural: "",
      fromVocab: false,
      kind: "surface",
    });
  }

  for (const part of extraParts || []) {
    const v = lookupVocabByLemma(part);
    const num = numberConversionForToken(part);
    const lex = lexicon[part] || null;
    const fromHeading = v ? articleFromHeading(v.heading, v.surface) : null;
    const gender =
      v?.derived?.gender || lex?.gender || fromHeading?.gender || null;
    if (v && (gender || v.gloss || fromHeading)) {
      pushRow({
        de: v.surface || part,
        lemma: v.engine?.lemma || part,
        en: num.gloss || v.gloss || v.derived?.gloss || "",
        gloss: v.gloss || v.derived?.gloss || num.gloss || "",
        number: num.value,
        article:
          v.derived?.article ||
          articleForGender(gender) ||
          fromHeading?.article ||
          "",
        gender,
        genitive: gender ? genitiveEndingForGender(gender) : "",
        pluralEnding: pluralEndingFor(v.engine?.lemma || part, lex, v),
        plural: v.derived?.plural || "",
        fromVocab: true,
        vocabId: v.id,
        kind: "noun",
      });
    } else {
      pushRow({
        de: part,
        lemma: part,
        en: num.gloss || "",
        gloss: num.gloss || "",
        number: num.value,
        article: "",
        gender: null,
        genitive: "",
        pluralEnding: "",
        plural: "",
        fromVocab: false,
        kind: num.value != null || num.gloss ? "number" : "surface",
      });
    }
  }

  return rows;
}

function patternFromReference(refId) {
  const u = getReference(refId);
  if (!u) return null;
  const sections = u.sections || {};
  const text =
    (sections.pattern && String(sections.pattern).trim()) ||
    (sections.rule && String(sections.rule).trim()) ||
    (u.summary && String(u.summary).trim()) ||
    "";
  return text || null;
}

function refineReferenceId(ctx, exercise) {
  const patternId =
    exercise?.materials?.patternId || exercise?.resolution?.patternId || null;
  if (patternId && typeof patternId === "string") {
    if (/ung|heit|keit|schaft|ion|tät|ik|ei/i.test(patternId)) {
      return "nouns.suffix.feminine";
    }
    if (/chen|lein|ment/i.test(patternId)) return "nouns.suffix.neuter";
    if (/ling|ismus|ner|er/i.test(patternId)) return "nouns.suffix.masculine";
  }
  const gender =
    exercise?.resolution?.gender ||
    exercise?.target?.grammaticalState?.gender ||
    null;
  if (ctx?.territory === "nouns" && gender === "feminine") {
    return "nouns.suffix.feminine";
  }
  if (ctx?.territory === "nouns" && gender === "masculine") {
    return "nouns.suffix.masculine";
  }
  if (ctx?.territory === "nouns" && gender === "neuter") {
    return "nouns.suffix.neuter";
  }
  return referenceIdForPracticeContext(ctx);
}

/**
 * Build the Help model for the active question.
 * @param {{
 *   hint?: string|null,
 *   exercise?: object|null,
 *   territory?: string,
 *   mode?: string,
 *   stepId?: string,
 *   topicId?: string,
 *   referenceId?: string|null,
 *   lexicon?: Record<string, object>,
 * }} opts
 */
export function buildHelpModel(opts = {}) {
  const exercise = opts.exercise || null;
  const ctx = {
    territory: opts.territory || exercise?.territoryId || null,
    mode: opts.mode || exercise?.mode || null,
    stepId: opts.stepId || null,
    topicId: opts.topicId || null,
    referenceId: opts.referenceId || null,
  };

  const hint = opts.hint != null ? String(opts.hint).trim() : "";

  const lemmas = lemmasOnExercise(exercise);
  const parts =
    ctx.territory === "numbers" ? numberPartsOnExercise(exercise) : [];
  // Avoid duplicating lemma surfaces already listed as number parts.
  const lemmaOnly = lemmas.filter(
    (l) => !parts.some((p) => p.toLowerCase() === l.toLowerCase())
  );
  const vocab = buildVocabEntries(lemmaOnly, parts, {
    lexicon: opts.lexicon || {},
  });

  const refId = refineReferenceId(ctx, exercise);
  const ref = refId ? getReference(refId) : null;

  let pattern =
    (exercise?.materials?.patternBlurb &&
      String(exercise.materials.patternBlurb).trim()) ||
    "";
  if (!pattern && refId) {
    pattern = patternFromReference(refId) || "";
  }

  return {
    hint: hint || null,
    vocab: vocab.length ? vocab : null,
    pattern: pattern || null,
    reference: ref
      ? {
          id: ref.id,
          title: ref.title,
          summary: ref.summary || "",
        }
      : null,
  };
}

function vocabRowsHtml(rows) {
  const padArt = rows.some((r) => !!r.article);
  return `<div class="help-vocab-list" role="list"${
    padArt ? ' data-pad-art="1"' : ""
  }>${rows
    .map((r) => {
      const g = genderClass(r.gender);
      const gloss =
        r.number != null ? String(r.number) : r.gloss || r.en || "";
      const hasGloss = !!gloss;
      const hasArt = !!r.article;
      const hasInfl = !!(r.genitive || r.pluralEnding);
      let maxState = 0;
      if (hasGloss) maxState = 1;
      if (hasArt) maxState = 2;
      if (hasArt && hasInfl) maxState = 3;

      const gen = r.genitive || "–";
      const pl = r.pluralEnding || "–";
      const artClass = g
        ? `help-dict-art help-gender help-gender-${esc(g)}`
        : "help-dict-art";

      // Always emit the art cell when the list pads, so bare tokens (den, und)
      // line up under lemmas that have der/die/das.
      const artHtml =
        hasArt || padArt
          ? `<span class="${artClass}" data-slot="art">${
              hasArt ? esc(r.article) : ""
            }</span>`
          : "";

      return `<button type="button"
        class="help-dict"
        role="listitem"
        data-help-vocab-cycle
        data-state="0"
        data-max-state="${maxState}"
        data-has-art="${hasArt ? "1" : "0"}"
        aria-expanded="false"
        aria-label="${esc(r.de)}">
        <span class="help-dict-line">
          ${artHtml}<span class="help-dict-lemma" lang="de">${esc(
            r.de
          )}</span><span class="help-dict-infl" data-slot="infl">, ${esc(
            gen
          )}, ${esc(pl)}</span>
        </span>
        <span class="help-dict-gloss" data-slot="gloss">${
          hasGloss ? esc(gloss) : ""
        }</span>
      </button>`;
    })
    .join("")}</div>`;
}

function cardHtml(kind, label, bodyHtml) {
  if (!bodyHtml) return "";
  return `<li class="help-rung-step" data-help-rung>
    <button type="button" class="help-rung-face" data-help-toggle aria-expanded="false">
      <span class="help-rung-name">${esc(label)}</span>
    </button>
    <div class="help-rung-body" data-help-kind="${esc(kind)}" hidden>
      ${bodyHtml}
    </div>
  </li>`;
}

/** HTML for the Help sheet body. */
export function renderHelpSheetHtml(model) {
  const cards = [];

  if (model.hint) {
    cards.push(cardHtml("hint", "Hint", `<p>${esc(model.hint)}</p>`));
  }

  if (model.vocab?.length) {
    cards.push(cardHtml("vocab", "Vocab", vocabRowsHtml(model.vocab)));
  }

  if (model.pattern) {
    cards.push(
      cardHtml("pattern", "Pattern", `<p>${esc(model.pattern)}</p>`)
    );
  }

  if (model.reference) {
    const r = model.reference;
    const sum = r.summary
      ? `<p class="help-ref-summary">${esc(r.summary)}</p>`
      : "";
    cards.push(
      cardHtml(
        "full",
        "Full Reference",
        `<p class="help-ref-title">${esc(r.title)}</p>
         ${sum}
         <button type="button" class="help-ref-open ref-link" data-help-open-ref="${esc(
           r.id
         )}">Open full unit</button>`
      )
    );
  }

  if (!cards.length) {
    return `<p class="help-empty">No help for this question yet.</p>`;
  }

  return `<ul class="help-rung">${cards.join("")}</ul>`;
}

/** Wire accordion + Full Reference open. */
export function wireHelpSheet(root, { onOpenFullReference } = {}) {
  if (!root) return;
  const steps = [...root.querySelectorAll("[data-help-rung]")];

  function setOpen(step, open) {
    step.classList.toggle("is-open", open);
    const btn = step.querySelector("[data-help-toggle]");
    const body = step.querySelector(".help-rung-body");
    btn?.setAttribute("aria-expanded", open ? "true" : "false");
    if (body) body.hidden = !open;
  }

  root.querySelectorAll("[data-help-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = btn.closest("[data-help-rung]");
      const wasOpen = step.classList.contains("is-open");
      steps.forEach((s) => setOpen(s, false));
      if (!wasOpen) setOpen(step, true);
    });
  });

  root.querySelectorAll("[data-help-open-ref]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-help-open-ref");
      if (id && onOpenFullReference) onOpenFullReference(id);
    });
  });

  root.querySelectorAll("[data-help-vocab-cycle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const max = Number(btn.getAttribute("data-max-state") || 0);
      if (max <= 0) return;
      let state = Number(btn.getAttribute("data-state") || 0);
      state = state >= max ? 0 : state + 1;
      btn.setAttribute("data-state", String(state));
      btn.setAttribute("aria-expanded", state > 0 ? "true" : "false");
    });
  });
}

export { getVocabulary };
