/**
 * Declension-table quizzes. Two units sit in front of the Case sentence arc:
 * definite articles, then indefinite articles with the plural kein column.
 * Genitive is not asked.
 */

const CASES = Object.freeze([
  { id: "nominative", label: "Nominative" },
  { id: "accusative", label: "Accusative" },
  { id: "dative", label: "Dative" },
]);

const DEFINITE_COLUMNS = Object.freeze([
  { id: "masculine", label: "Masculine" },
  { id: "feminine", label: "Feminine" },
  { id: "neuter", label: "Neuter" },
  { id: "plural", label: "Plural" },
]);

const INDEFINITE_COLUMNS = Object.freeze([
  { id: "masculine", label: "Masculine" },
  { id: "feminine", label: "Feminine" },
  { id: "neuter", label: "Neuter" },
  { id: "kein", label: "Kein" },
]);

/** @type {readonly string[][]} rows are nominative, accusative, dative */
const DEFINITE_FORMS = Object.freeze([
  ["der", "die", "das", "die"],
  ["den", "die", "das", "die"],
  ["dem", "der", "dem", "den"],
]);

const INDEFINITE_FORMS = Object.freeze([
  ["ein", "eine", "ein", "keine"],
  ["einen", "eine", "ein", "keine"],
  ["einem", "einer", "einem", "keinen"],
]);

const TABLES = Object.freeze({
  "case.table.definite": {
    kind: "definite",
    family: "Definite",
    columns: DEFINITE_COLUMNS,
    forms: DEFINITE_FORMS,
    pool: Object.freeze(["der", "die", "das", "den", "dem"]),
  },
  "case.table.indefinite": {
    kind: "indefinite",
    family: "Indefinite",
    columns: INDEFINITE_COLUMNS,
    forms: INDEFINITE_FORMS,
    pool: Object.freeze(["ein", "eine", "keine", "einen", "einem", "einer", "keinen"]),
  },
});

const BUILD = Object.freeze({
  presetId: "build",
  stimulus: "value",
  response: "build-chips",
});

const CHOOSE = Object.freeze({
  presetId: "choose",
  stimulus: "value",
  response: "multi-select",
});

export function isDeclensionUnit(unitId) {
  return Object.prototype.hasOwnProperty.call(TABLES, unitId);
}

export function declensionModes() {
  return ["build", "choose"];
}

function hashSeed(text) {
  let h = 2166136261;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, seed) {
  const rng = mulberry32(hashSeed(seed));
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = out[i];
    out[i] = out[j];
    out[j] = swap;
  }
  return out;
}

function cellsOf(table) {
  const cells = [];
  CASES.forEach((row, rowIndex) => {
    table.columns.forEach((column, columnIndex) => {
      cells.push({
        id: `${row.id}:${column.id}`,
        caseId: row.id,
        caseLabel: row.label,
        columnId: column.id,
        columnLabel: column.label,
        mark: column.id,
        form: table.forms[rowIndex][columnIndex],
        assesses: `article.${table.kind}.${row.id}.${column.id}`,
      });
    });
  });
  return cells;
}

function byCaseCard(unitId, table, rowIndex) {
  const row = CASES[rowIndex];
  const slots = table.columns.map((column, columnIndex) => {
    const form = table.forms[rowIndex][columnIndex];
    return {
      id: `${row.id}:${column.id}`,
      mark: column.id,
      label: column.label,
      form,
      assesses: `article.${table.kind}.${row.id}.${column.id}`,
    };
  });
  return Object.freeze({
    id: `table.${table.kind}.by-case.${row.id}`,
    playId: `table.${table.kind}.by-case.${row.id}`,
    unitId,
    quizType: "table-build",
    shape: "by-case",
    family: table.family,
    prompt: row.label,
    mark: "",
    slots,
    choices: shuffle(table.pool, `${table.kind}:case:${row.id}`),
    interaction: BUILD,
  });
}

function byColumnCard(unitId, table, columnIndex) {
  const column = table.columns[columnIndex];
  const slots = CASES.map((row, rowIndex) => ({
    id: `${row.id}:${column.id}`,
    mark: "",
    label: row.label,
    form: table.forms[rowIndex][columnIndex],
    assesses: `article.${table.kind}.${row.id}.${column.id}`,
  }));
  return Object.freeze({
    id: `table.${table.kind}.by-column.${column.id}`,
    playId: `table.${table.kind}.by-column.${column.id}`,
    unitId,
    quizType: "table-build",
    shape: "by-gender",
    family: table.family,
    prompt: column.label,
    mark: column.id,
    slots,
    choices: shuffle(table.pool, `${table.kind}:column:${column.id}`),
    interaction: BUILD,
  });
}

function byArticleCard(unitId, table, form) {
  const cells = cellsOf(table);
  const correct = cells.filter((cell) => cell.form === form);
  const wrong = cells.filter((cell) => cell.form !== form);
  const extras = shuffle(wrong, `${table.kind}:article:${form}`).slice(
    0,
    Math.max(0, 6 - correct.length)
  );
  const offered = shuffle(
    [...correct, ...extras],
    `${table.kind}:article-order:${form}`
  );
  return Object.freeze({
    id: `table.${table.kind}.by-article.${form}`,
    playId: `table.${table.kind}.by-article.${form}`,
    unitId,
    quizType: "table-choose",
    shape: "by-article",
    family: table.family,
    prompt: form,
    mark: "",
    choices: offered.map((cell) =>
      Object.freeze({
        value: cell.id,
        label: cell.caseLabel,
        mark: cell.mark,
        ariaLabel: `${cell.caseLabel}, ${cell.columnLabel}`,
        correct: cell.form === form,
        assesses: cell.assesses,
      })
    ),
    correctIds: Object.freeze(correct.map((cell) => cell.id)),
    interaction: CHOOSE,
  });
}

/** Every by-case, by-gender, and by-article card for one table unit. */
export function declensionDeck(unitId) {
  const table = TABLES[unitId];
  if (!table) return Object.freeze([]);
  const cards = [];
  CASES.forEach((_, index) => cards.push(byCaseCard(unitId, table, index)));
  table.columns.forEach((_, index) => cards.push(byColumnCard(unitId, table, index)));
  for (const form of table.pool) cards.push(byArticleCard(unitId, table, form));
  return Object.freeze(cards);
}

/**
 * Grade one table screen.
 * Build answers are the slot strings in order.
 * Choose answers are the selected cell ids.
 * @param {object} question
 * @param {string[]|string} answer
 */
export function gradeDeclensionAnswer(question, answer) {
  if (!question) return [];
  if (question.quizType === "table-build") {
    const given = Array.isArray(answer) ? answer : [];
    return (question.slots || []).map((slot, index) => ({
      id: slot.id,
      assesses: slot.assesses,
      label: slot.label,
      form: slot.form,
      given: String(given[index] || ""),
      correct: String(given[index] || "") === slot.form,
    }));
  }
  const selected = new Set(Array.isArray(answer) ? answer : []);
  return (question.choices || [])
    .filter((choice) => choice.correct || selected.has(choice.value))
    .map((choice) => ({
      id: choice.value,
      assesses: choice.assesses,
      label: choice.label,
      form: question.prompt,
      given: selected.has(choice.value) ? choice.value : "",
      correct: selected.has(choice.value) === !!choice.correct,
    }));
}
