# Partner-signup PR audit (2026-04-11 refresh)

## Scope + environment constraints
- Current branch HEAD: `d4f6e2e` (`Merge pull request #137`).
- Prior partner-signup baseline merges present in local history:
  - PR #128 at `4071201`
  - PR #129 at `66b5609`
  - PR #130 at `bbdeecc`
- Local repository has no configured `origin` remote, so direct fetch/checkout of PR refs (`#131`, `#133`, `#134`) is not possible from this environment.

## Current-main inspection results
1. Footer CTA already links to `/partners/signup` in `src/components/Footer.tsx`.
2. A single `/partners/signup` route exists in `src/App.tsx`, wired to `PartnerSignup`.
3. Main currently contains two partner-signup page files:
   - `src/pages/PartnerSignup.tsx` (full production multi-step implementation)
   - `src/pages/PartnerSignupPage.tsx` (scaffold placeholder)
4. No standalone `src/components/PartnerSignupWizard.tsx` exists in main.

## Decision output (required 1-7)

### 1) Recommended action for #131
Close PR #131 as superseded, unless reviewers can point to uniquely valuable content not already represented by `src/pages/PartnerSignup.tsx`.

### 2) Recommended action for #133
Do not merge directly. Recreate as a clean follow-up PR from current main and keep only uniquely valuable wizard/page improvements.

### 3) Recommended action for #134
Merge PR #134 only if it is still conflict-free and strictly additive (e.g., wizard scaffold only). If merge tooling is unavailable, recreate its exact additive file(s) on a new branch from current main.

### 4) Exact files already in main
- `src/components/Footer.tsx`
- `src/App.tsx`
- `src/pages/PartnerSignup.tsx`
- `src/pages/PartnerSignupPage.tsx`

### 5) Exact files worth salvaging from #133
Given no direct PR branch access in this environment, limit salvage to likely unique targets only:
- `src/components/PartnerSignupWizard.tsx` (if present in #133)
- Any unique sections from `src/pages/PartnerSignup*.tsx` that are not already present in `src/pages/PartnerSignup.tsx`

### 6) Is a fresh replacement PR cleaner than rebasing?
Yes. A fresh replacement PR from latest main is cleaner and safer than a high-conflict rebase when #133 overlaps with previously merged route/page/footer work.

### 7) Draft GitHub comment text

#### Draft comment for PR #131
> Thanks for the contribution. We re-audited current `main` after the merged partner-signup sequence (#128, #129, #130), and footer CTA + `/partners/signup` route/page wiring are already present.
>
> To avoid duplicated routing/page maintenance, we’re closing #131 as superseded.
>
> If there is uniquely valuable content in this branch that is not in `main`, please call it out and we can re-open as a focused follow-up PR.

#### Draft comment for PR #133
> Thanks — we reviewed this against current `main` after #128/#129/#130.
>
> There appears to be potentially reusable wizard/page implementation, but this PR overlaps with already-merged route/page/footer wiring.
>
> Safest path: open a fresh follow-up PR from latest `main` that preserves only unique wizard/content improvements and excludes duplicate `/partners/signup` route or footer wiring.
>
> If helpful, we can cherry-pick only the wizard/content commits to preserve authorship.

## Minimal executable hygiene plan (when direct PR actions are unavailable)
1. If #134 is additive, create branch `codex/merge-134-additive-only` from `main`, apply exact additive scaffold file(s), and open PR.
2. Create branch `codex/salvage-133-wizard-only` from `main`, add only unique wizard/page improvements, and explicitly avoid duplicate route/footer wiring.
3. Post supersede comment on #131 and close it.
