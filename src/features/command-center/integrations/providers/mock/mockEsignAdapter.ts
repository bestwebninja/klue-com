import type { EsignAdapter } from "../../adapters/types";
export const mockEsignAdapter: EsignAdapter = { async createEnvelope() { return { envelopeId: "env_mock_1" }; } };
