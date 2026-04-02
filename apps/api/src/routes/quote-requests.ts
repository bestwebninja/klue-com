import { Router } from "express";
import { z } from "zod";
import { getQuoteRequest } from "../services/routing/routing-orchestrator";

const router = Router();

router.get("/:id", (req, res) => {
  const parsed = z.string().uuid().safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: "Invalid quote request id" });

  const quoteRequest = getQuoteRequest(parsed.data);
  if (!quoteRequest) return res.status(404).json({ error: "Quote request not found" });

  return res.status(200).json({ data: quoteRequest });
});

export default router;
