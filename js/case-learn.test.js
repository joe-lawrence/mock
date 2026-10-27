import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { getCaseStep } from "./case-curriculum.js";
import { caseChartHtml, caseLearnHtml } from "./case-practice.js";
import { renderProse } from "./md-lite.js";
import { buildHelpModel, renderHelpSheetHtml } from "./help-sheet.js";
import {
  renderLearnReadingHtml,
  renderReferenceEntryHtml,
} from "./reference-ui.js";

const css = readFileSync(new URL("../css/mock.css", import.meta.url), "utf8");

describe("learner markup", () => {
  it("renders German forms and bold without leaving the marks", () => {
    const html = renderProse(
      "When the noun is masculine, `der Hund` becomes `den Hund`.\n\n**sehen** takes the accusative."
    );
    assert.match(html, /<code class="de-form" lang="de">der Hund<\/code>/);
    assert.match(html, /<code class="de-form" lang="de">den Hund<\/code>/);
    assert.match(html, /<strong>sehen<\/strong>/);
    assert.equal(html.split("<p>").length - 1, 2);
    assert.equal(html.includes("`"), false);
    assert.equal(html.includes("**"), false);
  });

  it("escapes raw HTML and renders a bullet list", () => {
    const html = renderProse("Use a <tag> & such.\n\n- `die`\n- `das`");
    assert.match(html, /a &lt;tag&gt; &amp; such/);
    assert.match(html, /<ul class="ref-prose"><li><code class="de-form" lang="de">die<\/code><\/li>/);
  });
});

describe("Case Learn article", () => {
  it("renders the masculine unit with forms, notes, and a scrolling chart", () => {
    const step = getCaseStep("accusative", "masc");
    const article = caseChartHtml(step.referenceId);
    assert.match(article, /Masculine accusative/);
    assert.match(article, /<code class="de-form" lang="de">der Hund<\/code>/);
    assert.match(article, /<code class="de-form" lang="de">den Hund<\/code>/);
    assert.match(article, /The noun itself does not change/);
    assert.equal(article.includes("`"), false);

    const learn = caseLearnHtml(step);
    assert.match(learn, /^<div class="chart-scroll">/);
    assert.match(learn, /Masculine accusative/);
    assert.match(learn, /Article forms/);
    assert.match(learn, /look up article forms/);
    assert.equal(learn.includes("Genitive, possessives"), false);
    assert.match(learn, /data-ref-view="learn"/);
    assert.match(learn, /data-ref-view="chart"/);

    const dom = new JSDOM(
      `<!doctype html><html><head><style>${css}</style></head>
      <body class="is-session">
        <div class="app"><main>
          <section id="view-case" class="view view-session is-active">
            <div class="sound-chart" id="case-chart">
              <div class="learn-series-bar">Previous</div>
              ${learn}
            </div>
          </section>
        </main></div>
      </body></html>`
    );
    const { document, getComputedStyle } = dom.window;
    const chart = document.getElementById("case-chart");
    const scroll = chart.querySelector(".chart-scroll");
    assert.equal(getComputedStyle(chart).overflowY, "auto");
    assert.equal(getComputedStyle(scroll).overflow, "auto");
    assert.equal(getComputedStyle(chart.querySelector(".learn-series-bar")).flexShrink, "0");
    assert.ok(scroll.querySelector(".de-form"));
    assert.equal(scroll.textContent.includes("`"), false);
  });

  it("keeps the reference card to the summary, examples, and related links", () => {
    const html = renderReferenceEntryHtml("case.acc.masc");
    assert.match(html, /data-ref-view="card"/);
    assert.match(html, /masculine <code class="de-form" lang="de">der<\/code> becomes <code class="de-form" lang="de">den<\/code>/);
    assert.match(html, /Ich sehe den Hund/);
    assert.match(html, /Feminine and neuter accusative/);
    assert.equal(html.includes("One of the most useful"), false);
    assert.equal(html.includes("When the noun is masculine"), false);
    assert.equal(html.includes("The noun stays the same"), false);
    assert.equal(html.includes("`"), false);
  });

  it("opens the Learn reading from Help, and the short card is the summary", () => {
    const reading = renderLearnReadingHtml("case.acc.masc");
    assert.match(reading, /<h4>Rule<\/h4>/);
    assert.match(reading, /<code class="de-form" lang="de">der Hund<\/code>/);

    const model = buildHelpModel({
      territory: "case",
      referenceId: "case.acc.masc",
    });
    assert.equal(model.pattern, null);
    assert.equal(
      model.reference.summary,
      "In the accusative forms covered here, masculine `der` becomes `den` and masculine `ein` becomes `einen`."
    );
    const help = renderHelpSheetHtml(model);
    assert.match(help, /masculine/);
    assert.match(help, /den/);
    assert.match(help, /Open full unit/);
    assert.equal(help.includes("When the noun is masculine"), false);
  });
});
