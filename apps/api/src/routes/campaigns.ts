import { Router } from "express";
import { z } from "zod";

const router = Router();

const campaignSchema = z.object({
  advertiserId: z.string().uuid(),
  name: z.string().min(3),
  objective: z.enum(["cpc", "cpl", "cpm"]),
  dailyBudget: z.number().positive(),
  lifetimeBudget: z.number().positive().optional()
});

router.get("/", (_req, res) => {
  res.json({ data: [], nextCursor: null });
});

router.post("/", (req, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.status(201).json({ id: crypto.randomUUID(), ...parsed.data, status: "draft" });
});

router.post("/:id/activate", (req, res) => res.json({ id: req.params.id, status: "active" }));
router.post("/:id/pause", (req, res) => res.json({ id: req.params.id, status: "paused" }));

export default router;
