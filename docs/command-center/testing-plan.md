# Testing Plan

- Type-check and build frontend (`npm run build`).
- Smoke test routes:
  - `/command-center`
  - `/command-center/:workspaceId`
  - `/command-center/:workspaceId/trade/plumbing`
  - `/command-center/:workspaceId/trade/electrical`
  - `/command-center/:workspaceId/finance`
  - `/command-center/:workspaceId/title`
- Validate RLS behavior with member and non-member test users.
- Exercise edge functions with mocked payloads.
