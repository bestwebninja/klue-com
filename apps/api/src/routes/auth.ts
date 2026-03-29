import { Router } from "express";
import { z } from "zod";
import {
  AuthRequest,
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
  requireAuth
} from "../middleware/auth";
import { env } from "../config/env";
import { authRateLimit } from "../middleware/rate-limit";

const router = Router();
router.use(authRateLimit);

const authSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const DEFAULT_ADMIN_EMAIL = "admin@kluje.com";

const issueTokens = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const identity = {
    sub: crypto.randomUUID(),
    email: normalizedEmail,
    role: normalizedEmail === DEFAULT_ADMIN_EMAIL ? "admin" : "user"
  };
  const token = issueAccessToken(identity);
  const refreshToken = issueRefreshToken(identity);
  return { token, refreshToken };
};

router.post("/register", (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { token, refreshToken } = issueTokens(parsed.data.email);
  return res.status(201).json({ token, refreshToken, user: { email: parsed.data.email.toLowerCase() } });
});

router.post("/login", (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { token, refreshToken } = issueTokens(parsed.data.email);
  return res.json({
    token,
    refreshToken,
    expiresIn: env.accessTokenTtl,
    user: {
      email: parsed.data.email.trim().toLowerCase(),
      role: parsed.data.email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL ? "admin" : "user"
    }
  });
});

router.post("/refresh", (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const payload = verifyRefreshToken(parsed.data.refreshToken);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const token = issueAccessToken({
    sub: payload.sub,
    email: payload.email,
    role: payload.role
  });

  return res.json({ token, expiresIn: env.accessTokenTtl });
});

router.post("/logout", (_req, res) => res.status(204).send());

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  return res.json({
    user: {
      sub: req.user?.sub,
      email: req.user?.email,
      role: req.user?.role
    }
  });
});

export default router;
