# API Contracts

- `POST /functions/v1/command-center-ai` body: `{ agentKey, payload }` => `{ ok, result }`
- `POST /functions/v1/command-center-voice-session` body: session request => `{ status, sessionId }`
- Additional functions (`command-center-documents`, `command-center-risk-sync`, `command-center-adapter-proxy`) are stubs for next integration phase.
