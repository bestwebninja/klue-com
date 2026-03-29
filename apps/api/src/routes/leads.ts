import { Router } from "express";
import { z } from "zod";

const router = Router();

const leadSchema = z.object({
  source: z.string(),
  contactName: z.string(),
  contactEmail: z.string().email(),
  serviceCategory: z.string(),
  intentScore: z.number().min(0).max(100)
});

router.post("/", (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  return res.status(201).json({
    id: crypto.randomUUID(),
    ...parsed.data,
    status: "new",
    routeRecommendation: {
      strategy: "bid_weight + quality_score + conversion_history",
      topAdvertiserIds: []
    }
  });
});

router.post("/:id/route", (req, res) => {
  res.json({ id: req.params.id, status: "routed", dispatchedAt: new Date().toISOString() });
});

router.post("/:id/disposition", (req, res) => {
  res.json({ id: req.params.id, status: req.body?.status ?? "accepted" });
});

export default router;
