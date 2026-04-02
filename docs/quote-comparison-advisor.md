# Quote Comparison Advisor v1

Quote Comparison Advisor v1 provides deterministic, explainable comparison outputs for homeowner lead quotes.

## API endpoints

- `GET /api/v1/quotes?leadId={leadId}` returns quotes for a lead.
- `POST /api/v1/quotes/compare` returns normalized totals, line-item variance, credential/review comparisons, and follow-up questions.

## Deterministic design

The service uses only explicit formulas and stable sorting rules:

1. **Normalized totals**: `subtotal + tax + fees - discount`.
2. **Line-item comparison**: grouped by `line_code` and sorted lexicographically.
3. **Provider quality score**: deterministic combination of credential count and review summary metrics.
4. **Follow-up questions**: emitted from fixed rule checks for scope gaps (permits, debris, warranty, and schedule spread).
5. **Stable output ordering**: provider-facing sections are sorted by provider display name.

## Explainability fields

`POST /quotes/compare` includes:

- `totals.normalized[].explanation` with formula values.
- `providerComparison[].rationale` with quality-score decomposition.
- `explainability[]` with engine-level rule statements.

## Data model additions

The v1 schema introduces:

- `quotes`
- `quote_line_items`
- `provider_reviews_summary`

These tables support provider quote ingestion and comparison without hidden model behavior.
