import { Router } from "express";
import { AreaRiskRequestSchema, scoreAreaRisk } from "../services/area-risk";
import { verificationStore } from "../services/verification-store";

const router = Router();

router.post("/score", (req, res) => {
  const parsed = AreaRiskRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const response = scoreAreaRisk(parsed.data);
  const providerId = typeof req.body?.context?.providerId === "string" ? req.body.context.providerId.trim() : "";
  const tenantId = req.header("x-tenant-id") ?? "default-tenant";

  const complianceFlags: Array<{ code: string; severity: "info" | "warning" | "critical" }> = [];

  if (response.status === "suppressed") {
    complianceFlags.push({ code: "area_risk_suppressed", severity: "warning" });
  } else if (response.status === "blocked") {
    complianceFlags.push({ code: "area_risk_mosaicing_blocked", severity: "critical" });
  } else if (response.area_risk?.band === "high") {
    complianceFlags.push({ code: "area_risk_high_band", severity: "warning" });
  }

  if (providerId && complianceFlags.length > 0) {
    complianceFlags.forEach((flag) => {
      void verificationStore.addComplianceFlag({
        id: crypto.randomUUID(),
        tenantId,
        providerId,
        requestId: null,
        source: "area-risk",
        code: flag.code,
        severity: flag.severity,
        status: "open",
        details: {
          suppressionReason: response.suppression_reason,
          blockReason: response.block_reason,
          outputLevel: response.compliance.output_level,
          areaRiskBand: response.area_risk?.band
        },
        createdAt: new Date().toISOString(),
        resolvedAt: null
      });
    });
  }

  return res.json({ ...response, compliance_flags: complianceFlags });
});

export default router;
