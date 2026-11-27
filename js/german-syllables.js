/**
 * Lightweight German orthographic syllabification for karaoke display.
 * Pedagogical approximation (not a full Duden hyphenator).
 */

const VOWEL_RE = /[aeiouyäöü]/i;

/**
 * Clusters that stay wholly in the following onset (Duden-ish).
 * Keep this tight — over-grouping yields A-pfel instead of Ap-fel.
 */
const ONSET_CLUSTERS = ["sch", "ch", "ck", "tz", "ph", "th", "qu"];

/** Productive endings peeled as their own beat(s) when long enough. */
const PEEL_SUFFIXES = [
  "schaften",
  "schaft",
  "heiten",
  "heit",
  "keiten",
  "keit",
  "ungen",
  "ung",
  "lich",
  "isch",
  "chen",
  "lein",
  "tion",
  "sion",
  "ismus",
  "isten",
  "ist",
  "ieren",
];

const ARTICLE_RE =
  /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)$/i;

function isVowelChar(ch) {
  return VOWEL_RE.test(ch);
}

/**
 * Find vowel-nucleus spans (diphthongs count as one).
 * @param {string} word
 * @returns {{ start: number, end: number }[]}
 */
function findNuclei(word) {
  const w = word;
  const nuclei = [];
  let i = 0;
  while (i < w.length) {
    if (!isVowelChar(w[i])) {
      i += 1;
      continue;
    }
    let end = i + 1;
    const two = w.slice(i, i + 2).toLowerCase();
    if (["ai", "ei", "au", "eu", "äu", "ie"].includes(two)) {
      end = i + 2;
    } else if (
      end < w.length &&
      isVowelChar(w[end]) &&
      // allow "oo" / "ee" style doubles as one nucleus
      w[end].toLowerCase() === w[i].toLowerCase()
    ) {
      end = i + 2;
    }
    nuclei.push({ start: i, end });
    i = end;
  }
  return nuclei;
}

/**
 * How many leading consonants of `cluster` belong to the next onset.
 * @param {string} cluster
 */
function onsetLength(cluster) {
  if (!cluster) return 0;
  const lower = cluster.toLowerCase();
  for (const c of ONSET_CLUSTERS) {
    if (lower.endsWith(c) && c.length <= cluster.length) {
      // Prefer leaving at least one consonant in the coda when cluster is long
      // (Ap-fel: "pf" → onset "f" after split? Ap|fel — cluster "pf", onset "f")
      if (c === "ck" || c === "tz") {
        // Orthographic: Zu-cker / Kat-ze — keep cluster with following syllable.
        return c.length;
      }
      if (cluster.length === c.length) return c.length;
      return c.length;
    }
  }
  // Default maximal onset: last consonant starts next syllable.
  return 1;
}

/**
 * Syllabify one orthographic token (no spaces).
 * @param {string} token
 * @returns {string[]}
 */
function syllabifyToken(token) {
  const raw = String(token || "").trim();
  if (!raw) return [];
  if (raw.length <= 2) return [raw];

  // Peel a productive suffix when the stem still has a vowel.
  for (const suf of PEEL_SUFFIXES) {
    if (raw.length <= suf.length + 2) continue;
    if (!raw.toLowerCase().endsWith(suf)) continue;
    const stem = raw.slice(0, -suf.length);
    if (!findNuclei(stem).length) continue;
    const stemSyls = syllabifyTokenCore(stem);
    const sufSyls = syllabifyTokenCore(
      raw.slice(stem.length) // preserve casing of suffix
    );
    if (stemSyls.length && sufSyls.length) {
      return [...stemSyls, ...sufSyls];
    }
  }

  return syllabifyTokenCore(raw);
}

/**
 * Nucleus-based split without suffix peeling.
 * @param {string} word
 * @returns {string[]}
 */
function syllabifyTokenCore(word) {
  const w = String(word || "");
  if (!w) return [];
  const nuclei = findNuclei(w);
  if (nuclei.length <= 1) return [w];

  const cuts = [0];
  for (let n = 0; n < nuclei.length - 1; n++) {
    const afterNucleus = nuclei[n].end;
    const beforeNext = nuclei[n + 1].start;
    const cluster = w.slice(afterNucleus, beforeNext);
    if (!cluster.length) {
      // Hiatus: split between vowels (Bo-a rare; usually "i-on" handled by peel)
      cuts.push(afterNucleus);
      continue;
    }
    // Double consonant → split in the middle (Mit-tag, Bren-nen)
    if (
      cluster.length >= 2 &&
      cluster[0].toLowerCase() === cluster[1].toLowerCase() &&
      !isVowelChar(cluster[0])
    ) {
      cuts.push(afterNucleus + 1);
      continue;
    }
    let onset = onsetLength(cluster);
    if (onset > cluster.length) onset = cluster.length;
    // Never leave the previous syllable without its nucleus already included.
    const cut = beforeNext - onset;
    cuts.push(Math.max(afterNucleus, cut));
  }
  cuts.push(w.length);

  const parts = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const piece = w.slice(cuts[i], cuts[i + 1]);
    if (piece) parts.push(piece);
  }
  return parts.length ? parts : [w];
}

/**
 * Orthographic syllables for a German lemma (or compound).
 * @param {string} word
 * @param {{ compound?: { prefix?: string, rootWord?: string } | null }} [opts]
 * @returns {string[]}
 */
export function germanOrthSyllables(word, opts = {}) {
  const raw = String(word || "").trim();
  if (!raw) return [];

  const { compound } = opts;
  if (compound?.prefix && compound?.rootWord) {
    const joined = `${compound.prefix}${compound.rootWord}`;
    if (joined.toLowerCase() === raw.toLowerCase()) {
      // Preserve lemma casing on the joined surface by slicing the original.
      const preLen = compound.prefix.length;
      const pre = raw.slice(0, preLen);
      const root = raw.slice(preLen);
      return [...syllabifyToken(pre), ...syllabifyToken(root)];
    }
  }

  if (raw.includes("-")) {
    return raw.split("-").flatMap((part) => syllabifyToken(part));
  }

  return syllabifyToken(raw);
}

/**
 * Karaoke beats for a spoken phrase (optional leading article + lemma syllables).
 * First stem syllable is marked stressed (native default).
 *
 * @param {string} phrase
 * @param {{ compound?: { prefix?: string, rootWord?: string } | null }} [opts]
 * @returns {Array<{ text: string, stress: boolean, article?: boolean }>}
 */
export function karaokeSyllablesForPhrase(phrase, opts = {}) {
  const trimmed = String(phrase || "").trim();
  if (!trimmed) return [];

  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 2 && ARTICLE_RE.test(tokens[0])) {
    const lemma = tokens.slice(1).join(" ");
    const body = germanOrthSyllables(lemma, opts);
    const beats = [
      { text: tokens[0], stress: false, article: true },
      ...body.map((text, i) => ({ text, stress: i === 0 })),
    ];
    return beats;
  }

  const body = germanOrthSyllables(trimmed, opts);
  return body.map((text, i) => ({ text, stress: i === 0 }));
}
