/**
 * Format samples for free-text answer boxes.
 * A sample is never the item on screen. The box keeps it until the learner types.
 */

/**
 * @param {string[]} samples
 * @param {Iterable<string>} avoid
 */
function writtenClockHour(written) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(written || "").trim());
  if (!m) return null;
  return Number(m[1]);
}

function pick(samples, avoid) {
  const blocked = new Set();
  for (const raw of avoid) {
    const text = String(raw ?? "").trim();
    if (!text) continue;
    blocked.add(text);
    const clock = text.match(/^0?(\d{1,2}):(\d{2})$/);
    if (clock) {
      blocked.add(`${Number(clock[1])}:${clock[2]}`);
      blocked.add(`${String(Number(clock[1])).padStart(2, "0")}:${clock[2]}`);
    }
  }
  return samples.find((sample) => sample && !blocked.has(sample)) || samples[0] || "";
}

/**
 * @param {object} [meta]
 */
function avoidForward(meta) {
  return [meta?.form, meta?.written];
}

/**
 * @param {object} [meta]
 */
function avoidReverse(meta) {
  return [
    meta?.written,
    meta?.form,
    meta?.value != null ? String(meta.value) : "",
    meta?.english,
    meta?.englishWritten,
  ];
}

/**
 * @param {object} [meta]
 */
function wholeEuros(meta) {
  if (meta?.cents != null) return Number(meta.cents) === 0;
  const written = String(meta?.written || "");
  if (/,00(?:\s*€)?$/.test(written)) return true;
  if (/,\d{2}/.test(written)) return false;
  return true;
}

const MEASURE_FORWARD = {
  Meter: ["drei Meter", "fünf Meter"],
  Zentimeter: ["fünf Zentimeter", "drei Zentimeter"],
  Kilometer: ["zwei Kilometer", "fünf Kilometer"],
  Gramm: ["zweihundertfünfzig Gramm", "ein Gramm"],
  Kilo: ["zwei Kilo", "fünf Kilo"],
  Kilogramm: ["zwei Kilogramm", "fünf Kilogramm"],
  Liter: ["ein Liter", "zwei Liter"],
  Milliliter: ["zweihundertfünfzig Milliliter", "ein Milliliter"],
  Grad: ["fünf Grad", "zwanzig Grad"],
  Stundenkilometer: ["fünfzig Stundenkilometer", "dreißig Stundenkilometer"],
};

const MEASURE_REVERSE = {
  Meter: ["3 m", "5 m"],
  Zentimeter: ["5 cm", "12 cm"],
  Kilometer: ["2 km", "5 km"],
  Gramm: ["250 g", "100 g"],
  Kilo: ["2 kg", "5 kg"],
  Kilogramm: ["2 kg", "5 kg"],
  Liter: ["2 l", "1 l"],
  Milliliter: ["250 ml", "100 ml"],
  Grad: ["10 °C", "21 °C"],
  Stundenkilometer: ["50 km/h", "30 km/h"],
};

/**
 * @param {object} [meta]
 * @param {boolean} reverse
 */
function measureSample(meta, reverse) {
  const table = reverse ? MEASURE_REVERSE : MEASURE_FORWARD;
  const samples = table[meta?.unit];
  if (samples) return pick(samples, reverse ? avoidReverse(meta) : avoidForward(meta));
  return reverse ? "3 m" : "drei Meter";
}

/**
 * German form the learner types (Convert forward, Type what you see).
 * @param {object} [meta]
 */
function forwardSample(meta) {
  const kind = meta?.kind || "cardinal";
  const avoid = avoidForward(meta);
  switch (kind) {
    case "decimal":
      return pick(["vier Komma acht fünf", "drei Komma null"], avoid);
    case "money":
      return wholeEuros(meta)
        ? pick(["drei Euro", "ein Euro"], avoid)
        : pick(["zwei Euro fünfzig", "drei Euro zwanzig"], avoid);
    case "fraction":
    case "fraction-half":
    case "fraction-unit":
    case "fraction-proper":
      return pick(["ein Viertel", "drei Viertel", "ein Drittel"], avoid);
    case "mixed-fraction":
      return pick(["zweieinhalb", "eineinhalb", "drei und ein Viertel"], avoid);
    case "clock":
      return pick(["fünf vor halb zwei", "zehn nach drei", "drei Uhr"], avoid);
    case "digital-time":
      return pick(
        ["dreizehn Uhr fünfundzwanzig", "acht Uhr null null"],
        avoid
      );
    case "duration":
      return pick(["zwei Stunden fünfzehn Minuten", "eine Stunde"], avoid);
    case "weekday":
      return pick(["Montag", "Freitag"], avoid);
    case "month":
      return pick(["Januar", "März"], avoid);
    case "measure":
      return measureSample(meta, false);
    case "ordinal":
    case "ordinal-am":
      return pick(["zwölfte", "dritte", "zwanzigste"], avoid);
    case "calendar-date":
    case "calendar-date-year":
      return pick(["am dritten Oktober", "am ersten Mai"], avoid);
    default:
      return pick(["vierzehn", "einundzwanzig", "dreißig"], avoid);
  }
}

/**
 * Written / English value the learner types (Convert reverse).
 * @param {object} [meta]
 */
function reverseSample(meta) {
  const kind = meta?.kind || "cardinal";
  const avoid = avoidReverse(meta);
  switch (kind) {
    case "decimal":
      return pick(["3,14", "16,42"], avoid);
    case "money":
      return wholeEuros(meta)
        ? pick(["3 €", "12 €"], avoid)
        : pick(["3,50 €", "12,50 €"], avoid);
    case "fraction":
    case "fraction-half":
    case "fraction-unit":
    case "fraction-proper":
      return pick(["2/3", "1/4", "3/4"], avoid);
    case "mixed-fraction":
      return pick(["2 1/2", "1 1/4"], avoid);
    case "clock": {
      const hour = writtenClockHour(meta?.written);
      if (hour != null && (hour === 0 || hour >= 13)) {
        return pick(["21:15", "14:05", "18:30"], avoid);
      }
      return pick(["9:15", "3:30", "2:15"], avoid);
    }
    case "digital-time":
      return pick(["14:05", "8:00"], avoid);
    case "duration":
      return pick(["2h 30min", "1h"], avoid);
    case "weekday":
      return pick(["Monday", "Friday"], avoid);
    case "month":
      return pick(["January", "March"], avoid);
    case "measure":
      return measureSample(meta, true);
    case "ordinal":
    case "ordinal-am":
      return pick(["12.", "3.", "21."], avoid);
    case "calendar-date":
      return pick(["9.11.", "3.10."], avoid);
    case "calendar-date-year":
      return pick(["3.10.2020", "1.5.1999"], avoid);
    default:
      return pick(["13", "16", "21", "40"], avoid);
  }
}

/**
 * @param {object} [meta]
 * @param {{ reverse?: boolean }} [opts]
 */
export function freeformPlaceholder(meta, opts = {}) {
  const sample = opts.reverse ? reverseSample(meta) : forwardSample(meta);
  if (!sample) return "";
  const hour = writtenClockHour(meta?.written);
  const twentyFour =
    opts.reverse &&
    meta?.kind === "clock" &&
    hour != null &&
    (hour === 0 || hour >= 13);
  return twentyFour ? `e.g. ${sample} (24h)` : `e.g. ${sample}`;
}

/**
 * Article or dative-plural sample that is not the form under test.
 * @param {{ target?: string, case?: string, articleKind?: string, kind?: string, correct?: string }} [question]
 */
export function caseFormExample(question) {
  const correct = String(question?.correct || "").trim().toLowerCase();
  if (question?.target === "noun") {
    const nouns = ["Hunden", "Kindern", "Frauen"];
    return nouns.find((item) => item.toLowerCase() !== correct) || nouns[0];
  }
  const indefinite =
    question?.articleKind === "indefinite" || question?.kind === "dative-indef";
  const pools = {
    accusative: indefinite
      ? ["eine", "ein", "einen"]
      : ["die", "das", "den"],
    dative: indefinite ? ["einem", "einer", "eine"] : ["der", "dem", "den"],
    nominative: indefinite ? ["ein", "eine"] : ["die", "das", "der"],
    genitive: indefinite ? ["eines", "einer"] : ["des", "der"],
  };
  const caseId = String(question?.case || "").toLowerCase();
  const pool =
    pools[caseId] ||
    (indefinite ? ["eine", "einen", "einem"] : ["die", "das", "den", "dem"]);
  return pool.find((item) => item.toLowerCase() !== correct) || pool[0];
}

/**
 * Written skeleton for a Case listen card. The graded article stays blank.
 * The noun is shown, because it is not a choice. TTS still speaks the
 * full sentence.
 * @param {{ before?: string, after?: string, nounForm?: string, lemma?: string }} [question]
 * @returns {{ before: string, noun: string, tail: string } | null}
 */
export function caseListenFrameParts(question) {
  const before = String(question?.before || "");
  const after = String(question?.after || "");
  const noun = String(question?.nounForm || question?.lemma || "");
  if (!noun) return null;
  const trimmed = after.trimStart();
  if (!trimmed.startsWith(noun)) return null;
  return { before, noun, tail: trimmed.slice(noun.length) };
}

/**
 * @param {Parameters<typeof caseListenFrameParts>[0]} [question]
 */
export function caseListenFrameText(question) {
  const parts = caseListenFrameParts(question);
  if (!parts) return "";
  return `${parts.before}[ article ] ${parts.noun}${parts.tail}`;
}

/**
 * @param {Parameters<typeof caseListenFrameParts>[0]} [question]
 */
export function caseListenFrameHtml(question) {
  const parts = caseListenFrameParts(question);
  if (!parts) return "";
  const bits = [];
  const before = parts.before.trim();
  const rest = `${parts.noun}${parts.tail}`.trim();
  if (before) bits.push(`<span class="case-listen-text">${escapePlaceholder(before)}</span>`);
  bits.push(`<span class="slot" lang="en">article</span>`);
  if (rest) bits.push(`<span class="case-listen-text">${escapePlaceholder(rest)}</span>`);
  return `<div class="case-listen-sentence" lang="de">${bits.join("")}</div>`;
}

function escapePlaceholder(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function caseLooseText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.?!…,;:]+$/u, "")
    .trim()
    .toLocaleLowerCase("de");
}

/**
 * Case freeform: the article, the article plus its noun, or the whole
 * sentence. Trailing punctuation is optional. Indefinite articles use the
 * same three shapes. A noun-target answer still has to be that form.
 * @param {{ correct?: string, target?: string, nounForm?: string, lemma?: string, sentence?: string }} [question]
 * @param {string} answer
 */
export function caseTypedAnswerMatches(question, answer) {
  const given = caseLooseText(answer);
  const correct = caseLooseText(question?.correct);
  if (!given || !correct) return false;
  if (given === correct) return true;
  if (question?.target === "noun") return false;
  const noun = caseLooseText(question?.nounForm || question?.lemma || "");
  if (noun && given === `${correct} ${noun}`) return true;
  const sentence = caseLooseText(question?.sentence || "");
  return Boolean(sentence) && given === sentence;
}

/** Text-field hint for “type the article / form”, never the answer. */
export function caseTypePlaceholder(question) {
  return `e.g. ${caseFormExample(question)}`;
}

/**
 * Compass type-in. Reverse types the English name.
 * @param {boolean} reverse
 * @param {string[]} [avoid]
 */
export function compassPlaceholder(reverse, avoid = []) {
  const samples = reverse
    ? ["Northeast", "North", "Southeast"]
    : ["Nordosten", "Norden", "Südosten"];
  const blocked = new Set(
    avoid.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
  );
  const sample =
    samples.find((item) => !blocked.has(item.toLowerCase())) || samples[0];
  return `e.g. ${sample}`;
}
