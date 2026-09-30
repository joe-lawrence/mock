/**
 * Vocabulary Practice — question types from item facts (scoped by curriculum).
 *
 * Vocabulary data = facts. Practice = which questions are legitimate now.
 * Prefer MCQ surfaces that reuse Numbers/Nouns choice chrome; gender/article first.
 */

/** @typedef {"article"|"gender"|"meaning"|"form"} VocabQuestionTypeId */

const ARTICLE_CHOICES = [
  { id: "der", label: "der", gender: "masculine" },
  { id: "die", label: "die", gender: "feminine" },
  { id: "das", label: "das", gender: "neuter" },
];

const GENDER_CHOICES = [
  { id: "masculine", label: "der", gender: "masculine" },
  { id: "feminine", label: "die", gender: "feminine" },
  { id: "neuter", label: "das", gender: "neuter" },
];

/** Prefer morphology drills; meaning/form still appear for variety. */
const TYPE_WEIGHTS = {
  article: 4,
  gender: 3,
  meaning: 2,
  form: 2,
};

/**
 * Learner-facing facts available on an item (independent of what we quiz).
 * @param {object} item — generated vocabulary item
 */
export function factsForItem(item) {
  if (!item) return {};
  const facts = {
    surface: item.surface,
    gloss: item.gloss || "",
    sense: item.sense || senseFromGloss(item.gloss) || "",
    type: item.type,
  };
  if (item.engineJoin === "engine-backed" && item.derived) {
    facts.gender = item.derived.gender || null;
    facts.article = item.derived.article || null;
    facts.plural = item.derived.plural || null;
  } else {
    // Content-only nouns often carry the article in the MD heading ("die Zahl").
    const fromHeading = articleFromHeading(item.heading, item.surface);
    if (fromHeading) {
      facts.article = fromHeading.article;
      facts.gender = fromHeading.gender;
    }
  }
  return facts;
}

/**
 * Which question types may be generated for this item given instructional scope.
 *
 * @param {object} item
 * @param {{ topic: string, allowGenderMorphology?: boolean, peers?: object[] }} scope
 * @returns {VocabQuestionTypeId[]}
 */
export function questionTypesForItem(item, scope = {}) {
  if (!item) return [];
  const types = [];
  const facts = factsForItem(item);
  const peers = Array.isArray(scope.peers) ? scope.peers : [];

  // Gender/article whenever we know them — primary Vocabulary Practice focus.
  const allowMorph = scope.allowGenderMorphology !== false;
  if (allowMorph && facts.article) types.push("article");
  if (allowMorph && facts.gender) types.push("gender");

  // Meaning / form MCQs need a gloss and at least one peer distractor when possible.
  if (facts.gloss) {
    const meaningPool = meaningDistractors(item, peers);
    const formPool = formDistractors(item, peers);
    if (meaningPool.length >= 1) types.push("meaning");
    if (formPool.length >= 1) types.push("form");
  }

  return types;
}

/**
 * @param {object} item
 * @param {VocabQuestionTypeId} type
 * @param {{ topic: string, peers?: object[] }} [scope]
 */
export function createVocabularyQuestion(item, type, scope = {}) {
  const allowed = questionTypesForItem(item, scope);
  if (!allowed.includes(type)) {
    throw new Error(
      `createVocabularyQuestion: type "${type}" not in scope for ${item?.id}`
    );
  }
  const facts = factsForItem(item);
  const peers = Array.isArray(scope.peers) ? scope.peers : [];

  switch (type) {
    case "article":
      return {
        id: `${item.id}:article`,
        vocabId: item.id,
        type,
        instruction: "Choose the article",
        prompt: facts.surface,
        promptLang: "de",
        promptText: facts.surface,
        expect: facts.article,
        accept: [facts.article],
        choices: ARTICLE_CHOICES.map((c) => ({ ...c })),
        choiceKind: "articles",
        revealDe: displayForm(item),
        revealEn: revealEnglish(facts),
        revealArticle: facts.article || null,
        revealGender: facts.gender || null,
        input: "choice",
      };
    case "gender":
      return {
        id: `${item.id}:gender`,
        vocabId: item.id,
        type,
        instruction: "Choose the gender",
        prompt: facts.surface,
        promptLang: "de",
        promptText: facts.surface,
        expect: facts.gender,
        accept: [facts.gender],
        choices: GENDER_CHOICES.map((c) => ({ ...c })),
        choiceKind: "articles",
        revealDe: displayForm(item),
        revealEn: revealEnglish(facts),
        revealArticle: facts.article || null,
        revealGender: facts.gender || null,
        input: "choice",
      };
    case "meaning": {
      const answer = meaningLabel(facts);
      const distractors = meaningDistractors(item, peers);
      const choices = shuffleUnique(
        [{ id: item.id, label: answer, sub: "" }],
        distractors.map((p) => ({
          id: p.id,
          label: meaningLabel(factsForItem(p)),
          sub: "",
        })),
        4
      );
      return {
        id: `${item.id}:meaning`,
        vocabId: item.id,
        type,
        instruction: "What does this mean?",
        prompt: displayForm(item),
        promptLang: "de",
        promptText: displayForm(item),
        expect: item.id,
        accept: [item.id],
        choices,
        choiceKind: "grid",
        revealDe: displayForm(item),
        revealEn: revealEnglish(facts),
        revealArticle: facts.article || null,
        revealGender: facts.gender || null,
        input: "choice",
      };
    }
    case "form": {
      const cue = primaryGloss(facts.gloss);
      const sense = facts.sense || enToDeSense(item, facts, peers);
      const answer = displayForm(item);
      const distractors = formDistractors(item, peers);
      const choices = shuffleUnique(
        [{ id: item.id, label: answer, sub: "" }],
        distractors.map((p) => ({
          id: p.id,
          label: displayForm(p),
          sub: "",
        })),
        4
      );
      return {
        id: `${item.id}:form`,
        vocabId: item.id,
        type,
        instruction: "Pick the German form",
        prompt: sense ? `“${cue}” (${sense})` : `“${cue}”`,
        promptLang: "en",
        promptText: cue,
        promptSense: sense || "",
        expect: item.id,
        accept: [item.id],
        choices,
        choiceKind: "grid",
        revealDe: displayForm(item),
        revealEn: revealEnglish(facts),
        revealArticle: facts.article || null,
        revealGender: facts.gender || null,
        input: "choice",
      };
    }
    default:
      throw new Error(`unknown vocabulary question type: ${type}`);
  }
}

/**
 * Weighted pick — gender/article dominate when available.
 * @param {object} item
 * @param {{ topic: string, prefer?: VocabQuestionTypeId[], peers?: object[] }} [opts]
 */
export function pickQuestionType(item, opts = {}) {
  const allowed = questionTypesForItem(item, opts);
  if (!allowed.length) return null;
  const prefer = (opts.prefer || []).filter((t) => allowed.includes(t));
  const pool = prefer.length ? prefer : allowed;
  const weighted = [];
  for (const t of pool) {
    const w = TYPE_WEIGHTS[t] || 1;
    for (let i = 0; i < w; i++) weighted.push(t);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

/**
 * @param {object} question
 * @param {string} rawAnswer
 */
export function evaluateVocabularyAnswer(question, rawAnswer) {
  const answer = String(rawAnswer || "").trim();
  if (!answer) {
    return { status: "incorrect", reason: "empty" };
  }
  const expect = String(question.expect || "").trim().toLowerCase();
  const given = answer.toLowerCase();
  const ok = (question.accept || [question.expect]).some(
    (a) => String(a || "").trim().toLowerCase() === given
  );
  return {
    status: ok ? "correct" : "incorrect",
    expect,
    given: answer,
  };
}

/** @deprecated text input removed from default practice — kept for callers. */
export function vocabInputMatches(raw, question) {
  const typed = String(raw || "")
    .trim()
    .toLowerCase();
  const accept = (question?.accept || [question?.expect]).map((a) =>
    String(a || "")
      .trim()
      .toLowerCase()
  );
  return {
    typed,
    isPrefix: typed.length > 0 && accept.some((v) => v.startsWith(typed)),
    isComplete: accept.some((v) => v === typed),
  };
}

/** Display with article when known. */
export function displayForm(item) {
  const facts = factsForItem(item);
  if (facts.article && facts.surface) return `${facts.article} ${facts.surface}`;
  if (item?.heading && facts.surface && item.heading.includes(facts.surface)) {
    return item.heading;
  }
  return facts.surface || item?.heading || "";
}

/**
 * Colored article + lemma HTML for answer-key DE line (quiz parity).
 * @param {object} question
 */
export function revealDeHtml(question) {
  const word = question?.revealDe || "";
  const article = question?.revealArticle;
  const gender = question?.revealGender;
  if (!article || !word) return escapeHtml(word);

  const tint = articleTintClass(article, gender);
  const lemma = word.replace(new RegExp(`^${article}\\s+`, "i"), "");
  const artHtml = tint
    ? `<span class="answer-art ${tint}">${escapeHtml(article)}</span>`
    : escapeHtml(article);
  return `${artHtml} <span class="answer-lemma">${escapeHtml(lemma)}</span>`;
}

function meaningLabel(facts) {
  if (!facts?.gloss) return "";
  const primary = primaryGloss(facts.gloss);
  if (facts.sense) return `${primary} (${facts.sense})`;
  return primary;
}

function meaningDistractors(item, peers) {
  const answer = meaningLabel(factsForItem(item));
  return peers.filter((p) => {
    if (!p || p.id === item.id) return false;
    const label = meaningLabel(factsForItem(p));
    return label && label !== answer;
  });
}

function formDistractors(item, peers) {
  const answer = displayForm(item);
  return peers.filter((p) => {
    if (!p || p.id === item.id) return false;
    const label = displayForm(p);
    return label && label !== answer;
  });
}

/** Take answer + up to (n-1) distractors, shuffled. */
function shuffleUnique(answerChoices, distractors, n) {
  const pool = shuffle([...distractors]);
  const out = [...answerChoices];
  for (const d of pool) {
    if (out.length >= n) break;
    if (out.some((c) => c.id === d.id || c.label === d.label)) continue;
    out.push(d);
  }
  return shuffle(out);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function articleTintClass(article, gender) {
  if (gender === "masculine" || article === "der") return "art-color-masc";
  if (gender === "feminine" || article === "die") return "art-color-fem";
  if (gender === "neuter" || article === "das") return "art-color-neut";
  return "";
}

function articleFromHeading(heading, surface) {
  const h = String(heading || "").trim();
  const m = h.match(/^(der|die|das)\s+(.+)$/i);
  if (!m) return null;
  if (surface && m[2] !== surface) return null;
  const article = m[1].toLowerCase();
  return { article, gender: genderForArticle(article) };
}

function genderForArticle(article) {
  if (article === "der") return "masculine";
  if (article === "die") return "feminine";
  if (article === "das") return "neuter";
  return null;
}

function revealEnglish(facts) {
  if (!facts?.gloss) return "";
  if (facts.sense) return `${primaryGloss(facts.gloss)} · ${facts.sense}`;
  return facts.gloss;
}

function enToDeSense(item, facts, peers) {
  if (facts.sense) return facts.sense;
  const cue = primaryGloss(facts.gloss);
  if (!cue) return "";
  const clash = peers.some(
    (p) => p && p.id !== item.id && primaryGloss(p.gloss || "") === cue
  );
  if (!clash) return "";
  if (facts.article) return `${facts.article} …`;
  return item.heading || facts.surface || "";
}

function primaryGloss(gloss) {
  const raw = String(gloss || "").trim();
  if (!raw) return "";
  const paren = raw.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (paren) return paren[1].trim();
  return raw.split(",")[0].trim();
}

function senseFromGloss(gloss) {
  const m = String(gloss || "").match(/\((.+)\)\s*$/);
  return m ? m[1].trim() : "";
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
