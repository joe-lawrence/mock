/**
 * Case slice UI helpers: hub, lookup chart, and one multiple-choice question.
 * Session state stays in mock.js.
 */

import { CASE_TOPICS } from "./case-curriculum.js";
import { vocabularyForScope } from "./generated/vocabulary.js?v=20261030-casetakes";
import { escapeHtml } from "./md-lite.js";
import {
  renderChartLookupHtml,
  renderLearnReadingHtml,
} from "./reference-ui.js";

function esc(s) {
  return escapeHtml(s);
}

function caseVocabRow(topic) {
  const words = vocabularyForScope("case", {
    introducedBy: [`case.${topic.id}`],
  });
  if (!words.length) return "";
  const introducedBy = esc(`case.${topic.id}`);
  return `<li class="numbers-step-row vocab-hub-row">
      <div class="numbers-step-copy">
        <strong>Vocabulary</strong>
        <span class="numbers-step-blurb">Words this topic introduces.</span>
      </div>
      <div class="numbers-step-actions">
        <div class="numbers-step-actions-main">
          <button type="button" class="btn" data-vocab-open data-vocab-mode="learn" data-vocab-territory="case" data-vocab-introduced-by="${introducedBy}">Learn</button>
          <button type="button" class="btn btn-primary" data-vocab-open data-vocab-mode="practice" data-vocab-territory="case" data-vocab-introduced-by="${introducedBy}">Practice</button>
        </div>
      </div>
    </li>`;
}

export function caseHubHtml() {
  const rows = [];
  for (const topic of CASE_TOPICS) {
    rows.push(`<li class="numbers-step-row">
        <div class="numbers-step-copy">
          <strong>${esc(topic.label)}</strong>
          ${topic.blurb ? `<span class="numbers-step-blurb">${esc(topic.blurb)}</span>` : ""}
        </div>
      </li>`);
    const vocab = caseVocabRow(topic);
    if (vocab) rows.push(vocab);
    for (const step of topic.steps || []) {
      rows.push(`<li class="numbers-step-row">
        <div class="numbers-step-copy">
          <strong>${esc(step.label)}</strong>
          ${step.blurb ? `<span class="numbers-step-blurb">${esc(step.blurb)}</span>` : ""}
        </div>
        <div class="numbers-step-actions">
          <button type="button" class="btn" data-case-learn data-topic="${esc(topic.id)}" data-step="${esc(step.id)}">Learn</button>
          <button type="button" class="btn btn-primary" data-case-practice data-topic="${esc(topic.id)}" data-step="${esc(step.id)}">Practice</button>
        </div>
      </li>`);
    }
  }
  return `
    <section class="numbers-browse" aria-label="Case">
      <h2 class="numbers-browse-title">Case</h2>
      <p class="numbers-step-blurb">Accusative constructions first, then dative, then mixed sentences. The table is a lookup. Practice judges a sentence, then picks, builds, hears, or types the form.</p>
      <div class="numbers-step-actions">
        <button type="button" class="btn" data-case-review data-source="path">Review path</button>
        <button type="button" class="btn" data-case-review data-source="list">My list</button>
        <button type="button" class="btn" data-case-input>Input</button>
      </div>
      <ul class="numbers-step-list">${rows.join("")}</ul>
    </section>`;
}

export function caseUserFormHtml() {
  return `<form class="numbers-step-actions" data-case-user-form>
      <input name="lemma" aria-label="German word" placeholder="German word" />
      <input name="gloss" aria-label="Gloss" placeholder="Gloss" />
      <button type="submit" class="btn">Add to my list</button>
    </form>`;
}

export function casePassageHtml(sentences) {
  if (!sentences?.length) {
    return `<p>Open a Case unit, then sentences from those frames show up here.</p>`;
  }
  const rows = sentences
    .map(
      (sentence) => `<li>
        <p class="prompt">${esc(sentence.text)}</p>
        <p class="numbers-step-blurb">${esc(sentence.lemma)} — ${esc(sentence.gloss)}</p>
      </li>`
    )
    .join("");
  return `<section class="numbers-browse" aria-label="Input">
      <h2 class="numbers-browse-title">Input</h2>
      <ul class="numbers-step-list">${rows}</ul>
      <button type="button" class="btn" data-case-understand>I understand</button>
      <p class="exercise-feedback" data-case-understand-note hidden></p>
    </section>`;
}

/** Full Learn reading for one Case unit. */
export function caseChartHtml(referenceId) {
  return renderLearnReadingHtml(referenceId);
}

/**
 * Scrolling body of Case Learn: the unit reading, then the chart’s summary and examples.
 * The series bar stays outside this element so it does not scroll away.
 * @param {{ referenceId?: string, chartId?: string }|null|undefined} step
 */
export function caseLearnHtml(step) {
  const unitHtml = step?.referenceId ? renderLearnReadingHtml(step.referenceId) : "";
  const chartId = step?.chartId || "case.chart.definite";
  const tableHtml =
    chartId && step?.referenceId !== chartId ? renderChartLookupHtml(chartId) : "";
  return `<div class="chart-scroll">${unitHtml}${tableHtml}</div>`;
}

/**
 * @param {object} question
 * @param {{ picked?: string|null, status?: string|null }} [state]
 */
export function caseQuestionHtml(question, state = {}) {
  if (!question) return `<p>No question in this unit.</p>`;
  const locked = !!state.status;
  const choices = (question.choices || [])
    .map((choice) => {
      const mark =
        locked && choice === question.correct
          ? " is-ok"
          : locked && choice === state.picked && choice !== question.correct
            ? " is-bad"
            : "";
      return `<button type="button" class="btn${mark}" data-case-choice="${esc(choice)}" ${
        locked ? "disabled" : ""
      }>${esc(choice)}</button>`;
    })
    .join("");
  const feedback =
    state.status === "correct"
      ? "Correct."
      : state.status === "incorrect"
        ? `The form is ${esc(question.correct)}.`
        : "";
  return `
    <p class="action-instruction">${esc(question.cue || "")}</p>
    <p class="prompt">${esc(question.prompt)}</p>
    <div class="slot-row" role="group" aria-label="Choices">${choices}</div>
    <p class="exercise-feedback" ${feedback ? "" : "hidden"}>${feedback}</p>
    ${
      locked
        ? `<div class="actions"><button type="button" class="btn btn-primary" data-case-next>Next</button></div>`
        : ""
    }`;
}
