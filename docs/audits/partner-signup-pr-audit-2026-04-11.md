# Partner-signup PR audit (2026-04-11)

## Scope inspected
- Current branch HEAD: `52226f7` (`Merge pull request #132`)
- Merged history references:
  - PR #128 merged at commit `4071201`
  - PR #129 merged at commit `66b5609`
  - PR #130 merged at commit `bbdeecc`
- Working tree files reviewed:
  - `src/components/Footer.tsx`
  - `src/App.tsx`
  - `src/pages/PartnerSignup.tsx`
  - `src/pages/PartnerSignupPage.tsx`

## Findings in current mainline state
1. **Footer CTA is already present** and links to `/partners/signup`.
2. **`/partners/signup` route wiring was duplicated** in `src/App.tsx` (two route entries for the same path).
3. **Two partner signup page implementations currently exist**:
   - `src/pages/PartnerSignup.tsx` (full multi-step form implementation)
   - `src/pages/PartnerSignupPage.tsx` (scaffold/placeholder)
4. **No standalone `PartnerSignupWizard` component exists** yet in current tree.

## Minimal hygiene action executed
- Removed duplicate `/partners/signup` route registration from `src/App.tsx` by keeping the existing full page route (`PartnerSignup`) and removing the extra route pointing to `PartnerSignupPage`.

## PR-level recommendations

### 1) Recommended action for #131
**Close as superseded** unless maintainers identify a uniquely useful content block not present in `src/pages/PartnerSignup.tsx`.

Reason:
- Route/footer/page foundation has already landed across #128/#129/#130.
- Current tree already contains a production-usable partner signup flow and footer CTA.

### 2) Recommended action for #133
**Do not merge directly. Recreate as a fresh clean PR from current main.**

Keep only:
- Unique, reusable wizard UX/component improvements (if truly novel), ideally extracted into a dedicated `PartnerSignupWizard` component.
- Any non-duplicate page content enhancements that are not already in `src/pages/PartnerSignup.tsx`.

Drop:
- Any duplicate `/partners/signup` route registration.
- Any duplicate page-file wiring already merged by #129/#130.
- Any footer CTA duplication.

### 3) Recommended action for #134
**Merge (or recreate exactly) only if it is strictly additive** and limited to scaffolding (e.g., `PartnerSignupWizard` skeleton) without re-adding duplicate route/footer wiring.

Given current tree already has a scaffold-like page (`PartnerSignupPage.tsx`) and a full page (`PartnerSignup.tsx`), safest path is:
- either skip #134 if redundant,
- or cherry-pick only net-new scaffold/component files with no routing duplication.

## Exact files already in main for this feature area
- `src/components/Footer.tsx` (partner signup CTA exists)
- `src/App.tsx` (route registration exists)
- `src/pages/PartnerSignup.tsx` (multi-step partner signup page)
- `src/pages/PartnerSignupPage.tsx` (scaffold placeholder page)

## Exact files worth salvaging from #133
Without direct PR branch access in this environment, salvage should be constrained to likely unique implementation targets only:
- `src/components/PartnerSignupWizard.tsx` (if present in #133)
- `src/pages/PartnerSignup*.tsx` only for unique sections/copy/validation not already in `src/pages/PartnerSignup.tsx`

## Is a fresh replacement PR cleaner than rebasing?
**Yes.**
A fresh replacement PR from current main is cleaner and lower-risk than rebasing if #133 includes route/page wiring overlaps with #128/#129/#130.

## Draft GitHub comments

### Draft comment for PR #131
> Thanks for the contribution. We audited current `main` after merges of #128, #129, and #130, and the partner-signup footer CTA + route/page wiring are already present.
>
> To keep history clean and avoid duplicate routing/page definitions, we’re closing #131 as superseded.
>
> If there’s a uniquely valuable section in this PR that is not in `main`, we can re-open as a focused follow-up PR with only those net-new parts.

### Draft comment for PR #133
> Thanks — we reviewed this against current `main` after #128/#129/#130.
>
> There appears to be useful partner-signup wizard/page work here, but it overlaps with route/page wiring already merged.
>
> Instead of merging this branch directly, we’ll open a fresh follow-up PR from latest `main` that keeps only unique wizard/content improvements and removes duplicate `/partners/signup` route/footer/page wiring.
>
> If you want, we can preserve authorship by cherry-picking the specific wizard commits into that clean branch.
