import test from "node:test";
import assert from "node:assert/strict";
import { compareQuotes, listQuotesByLeadId } from "./quote-comparison-advisor";

test("listQuotesByLeadId returns deterministic provider ordering", () => {
  const leadId = "11111111-1111-1111-1111-111111111111";
  const quotes = listQuotesByLeadId(leadId);

  assert.equal(quotes.length, 2);
  assert.deepEqual(
    quotes.map((quote) => quote.providerName),
    ["Alpha Roofing Co", "Bravo Exteriors"]
  );
});

test("compareQuotes normalizes totals and includes explainability statements", () => {
  const leadId = "11111111-1111-1111-1111-111111111111";
  const result = compareQuotes(leadId);

  assert.notEqual(result, null);
  assert.equal(result?.engineVersion, "quote-comparison-advisor-v1");
  assert.equal(result?.generatedAt, "2026-04-02T00:00:00.000Z");
  assert.equal(result?.totals.min, 10213);
  assert.equal(result?.totals.max, 10759);
  assert.equal(result?.totals.median, 10486);
  assert.equal(result?.totals.normalized[0]?.explanation.includes("normalized_total=subtotal+tax+fees-discount"), true);
  assert.equal(result?.explainability.length, 3);
});

test("compareQuotes flags line item gaps and follow-up questions", () => {
  const leadId = "11111111-1111-1111-1111-111111111111";
  const result = compareQuotes(leadId);

  assert.notEqual(result, null);
  const vents = result?.lineItemComparison.find((item) => item.itemCode === "vents");
  const flashing = result?.lineItemComparison.find((item) => item.itemCode === "flashing");

  assert.deepEqual(vents?.missingFromProviders, ["provider-alpha"]);
  assert.deepEqual(flashing?.missingFromProviders, ["provider-bravo"]);
  assert.equal(result?.followUpQuestions.includes("Can each provider confirm whether debris haul-away is included?"), false);
  assert.equal(result?.followUpQuestions.includes("What assumptions are driving the schedule difference across providers?"), true);
});

test("compareQuotes returns null when no lead quotes exist", () => {
  const result = compareQuotes("22222222-2222-2222-2222-222222222222");
  assert.equal(result, null);
});
