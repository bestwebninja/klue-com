import { Router } from "express";
import { AreaRiskRequestSchema, scoreAreaRisk } from "../services/area-risk";

const router = Router();

router.post("/score", (req, res) => {
  const parsed = AreaRiskRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  return res.json(scoreAreaRisk(parsed.data));
});

export default router;
