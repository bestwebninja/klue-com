import test from "node:test";
import assert from "node:assert/strict";
import { leadIntakeSchema } from "./schema";

const validPayload = {
  source: "marketplace_web",
  contactName: "Jordan Lee",
  contactEmail: "jordan@example.com",
  contactPhone: "+1-555-111-2222",
  location: "austin, tx",
  serviceCategory: "Plumber",
  intentScore: 81,
  budgetMin: 3000,
  budgetMax: 9000,
  timeline: "this_month",
  requirements: ["licensed", "insured"],
  scope: {
    summary: "Replace a leaking water heater and inspect nearby piping.",
    urgency: "planned",
    deliverables: ["Water heater replacement", "Safety inspection"],
  },
  attachments: [
    {
      name: "current-water-heater.jpg",
      url: "https://example.com/current-water-heater.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 250000,
    },
  ],
  priorityTier: "high",
} as const;

test("lead intake schema accepts structured scoping payload", () => {
  const parsed = leadIntakeSchema.safeParse(validPayload);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.attachments.length, 1);
    assert.equal(parsed.data.scope?.deliverables?.length, 2);
  }
});

test("lead intake schema rejects budgetMax lower than budgetMin", () => {
  const parsed = leadIntakeSchema.safeParse({
    ...validPayload,
    budgetMin: 5000,
    budgetMax: 1000,
  });
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const issue = parsed.error.issues.find((candidate) => candidate.path.join(".") === "budgetMax");
    assert.equal(Boolean(issue), true);
  }
});

test("lead intake schema enforces minimum scope summary length", () => {
  const parsed = leadIntakeSchema.safeParse({
    ...validPayload,
    scope: {
      summary: "tiny",
    },
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.equal(parsed.error.issues.some((issue) => issue.path.join(".") === "scope.summary"), true);
  }
});
