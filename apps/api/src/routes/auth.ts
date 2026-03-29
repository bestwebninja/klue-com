import { Router } from "express";
import { z } from "zod";

const router = Router();
const authSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post("/register", (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.status(201).json({ token: "mock-jwt", user: { email: parsed.data.email } });
});

router.post("/login", (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.json({ token: "mock-jwt", refreshToken: "mock-refresh" });
});

router.post("/refresh", (_req, res) => res.json({ token: "new-mock-jwt" }));
router.post("/logout", (_req, res) => res.status(204).send());

export default router;
