import { Router } from "express";
import { z } from "zod";
import { searchProviders } from "../services/routing/provider-routing-service";

const router = Router();

const searchSchema = z.object({
  tenantId: z.string().uuid(),
  serviceCategory: z.string().trim().min(1),
  budget: z.coerce.number().nonnegative().optional(),
  zipCode: z.string().trim().min(3).max(10).optional(),
  intent: z.enum(["urgent_service", "planned_project", "quote_only"]).default("planned_project"),
  topN: z.coerce.number().int().min(1).max(20).default(5)
});

router.get("/search", async (req, res, next) => {
  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const result = await searchProviders({
      tenantId: parsed.data.tenantId,
      serviceCategory: parsed.data.serviceCategory,
      budget: parsed.data.budget ?? null,
      zipCode: parsed.data.zipCode ?? null,
      intent: parsed.data.intent,
      topN: parsed.data.topN
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
