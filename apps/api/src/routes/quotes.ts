import { Router } from "express";
import { z } from "zod";
import { compareQuotes, listQuotesByLeadId } from "../services/quotes/quote-comparison-advisor";

const router = Router();

const listSchema = z.object({
  leadId: z.string().uuid()
});

const compareSchema = z.object({
  leadId: z.string().uuid()
});

router.get("/", (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = listQuotesByLeadId(parsed.data.leadId);
  return res.status(200).json({ data });
});

router.post("/compare", (req, res) => {
  const parsed = compareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = compareQuotes(parsed.data.leadId);
  if (!result) return res.status(404).json({ error: "No quotes found for lead" });

  return res.status(200).json({ data: result });
});

export default router;
