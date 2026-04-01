# ZIP Explorer SEO Notes

## What this PR adds
- Strong on-page SEO scaffolding for ZIP pages:
  - Dynamic title/description/canonical/robots
  - Open Graph + Twitter tags
  - JSON-LD for breadcrumb, webpage, and place entities
- Modular content sections with non-spammy, data-shaped copy.

## SPA SEO behavior
This project is a Vite SPA. Metadata is set on the client after load, which is useful but less reliable than HTML-first rendering for very large-scale SEO.

## Current limitations
- Client-rendered metadata can be missed or delayed by crawlers.
- ZIP pages are routable and linkable, but not pre-rendered.
- FAQ content is for users first; no guarantee of rich-results treatment.

## Recommendation for strongest crawl reliability
Implement pre-rendering or SSR for `/zip/:zipCode` and related discovery routes in a future iteration.

## Practical strategy
- Keep ZIP pages unique via conditional copy and score labels.
- Maintain clean internal linking through hub + route links.
- Expand discovery gradually instead of fabricating massive dynamic sitemap infra.
