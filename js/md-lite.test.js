import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractMarkdownLinks,
  renderInline,
  renderProse,
} from "./md-lite.js";

describe("md-lite inline", () => {
  it("keeps German forms, bold, and escapes HTML", () => {
    const html = renderInline("See `der Hund` and **sehen** plus <tag>");
    assert.match(html, /<code class="de-form" lang="de">der Hund<\/code>/);
    assert.match(html, /<strong>sehen<\/strong>/);
    assert.match(html, /&lt;tag&gt;/);
    assert.equal(html.includes("`"), false);
  });

  it("renders italics without underscore markup", () => {
    const html = renderInline("means *the dog* and leave_this_alone");
    assert.match(html, /<em>the dog<\/em>/);
    assert.match(html, /leave_this_alone/);
    assert.equal(html.includes("<em>this</em>"), false);
  });

  it("renders gender and case pills with multi-channel classes", () => {
    const html = renderInline("[M: der] [F: die] [N: das] [NOM: der] [ACC: den] [DAT: dem]");
    assert.match(html, /ref-pill-m g-masc[^>]*>.*der/);
    assert.match(html, /ref-pill-f g-fem[^>]*>.*die/);
    assert.match(html, /ref-pill-n g-neut[^>]*>.*das/);
    assert.match(html, /ref-pill-nom[^>]*>.*der/);
    assert.match(html, /ref-pill-acc[^>]*>.*den/);
    assert.match(html, /ref-pill-dat[^>]*>.*dem/);
  });

  it("renders internal unit links and leaves external URLs as text", () => {
    const ok = renderInline("See [passen zu](case.prep.dat).");
    assert.match(
      ok,
      /<button type="button" class="ref-link" data-ref-id="case\.prep\.dat">passen zu<\/button>/
    );
    const bad = renderInline("No [docs](https://example.com).");
    assert.match(bad, /\[docs\]\(https:\/\/example\.com\)/);
    assert.equal(bad.includes("ref-link"), false);
  });

  it("wraps → in ref-arrow so CSS can pick a clearer glyph font", () => {
    const prose = renderInline("der → den");
    assert.match(prose, /class="ref-arrow"[^>]*>→<\/span>/);
    const form = renderInline("`Hunde → Hunden`");
    assert.match(
      form,
      /de-form[^>]*>Hunde <span class="ref-arrow" aria-hidden="true">→<\/span> Hunden/
    );
  });
});

describe("md-lite blocks", () => {
  it("renders ### subheads inside section bodies", () => {
    const html = renderProse("### Person as subject\n\n**helfen** takes the dative.");
    assert.match(html, /<h3 class="ref-subhead">Person as subject<\/h3>/);
    assert.match(html, /<strong>helfen<\/strong>/);
  });

  it("renders ordered and unordered lists with inline marks", () => {
    const ol = renderProse("1. Check the verb\n2. Then pick [ACC: den]");
    assert.match(ol, /<ol class="ref-prose"><li>Check the verb<\/li>/);
    assert.match(ol, /ref-pill-acc/);
    const ul = renderProse("- `die`\n* *gloss*");
    assert.match(ul, /<ul class="ref-prose"><li><code class="de-form"/);
    assert.match(ul, /<em>gloss<\/em>/);
  });

  it("renders blockquote callouts", () => {
    const html = renderProse("> Do not trust English roles.\n> Prefer the construction.");
    assert.match(html, /<blockquote class="ref-callout">/);
    assert.match(html, /Do not trust English roles/);
  });

  it("still renders pipe tables and paragraphs", () => {
    const html = renderProse(
      "Intro line.\n\n| Case | Form |\n| --- | --- |\n| Acc | `den` |"
    );
    assert.match(html, /<p>Intro line\.<\/p>/);
    assert.match(html, /<table class="ref-table">/);
    assert.match(html, /<code class="de-form" lang="de">den<\/code>/);
  });
});

describe("extractMarkdownLinks", () => {
  it("collects internal and external targets", () => {
    const links = extractMarkdownLinks(
      "See [Plurals](nouns.plurals) and [x](https://example.com)."
    );
    assert.deepEqual(links, [
      { label: "Plurals", id: "nouns.plurals", external: false },
      { label: "x", id: "https://example.com", external: true },
    ]);
  });
});
