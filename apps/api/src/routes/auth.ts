import { Request, Response, Router } from "express";
import { z } from "zod";
import { authRateLimit } from "../middleware/rate-limit";
import { resolveSupabaseUser } from "../services/supabase-session";

const router = Router();
router.use(authRateLimit);

const authSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const AUTH_DISABLED_RESPONSE = {
  error: "Auth route disabled",
  code: "AUTH_DISABLED",
  message:
    "Email/password auth is disabled on this API. Use the configured Supabase auth flow to obtain a bearer token."
} as const;

const handleDisabledAuthRoute = (req: Request, res: Response) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  return res.status(503).json(AUTH_DISABLED_RESPONSE);
};

router.post("/register", handleDisabledAuthRoute);
router.post("/login", handleDisabledAuthRoute);

router.post("/refresh", (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  return res.status(503).json(AUTH_DISABLED_RESPONSE);
});

router.post("/logout", (_req, res) => res.status(204).send());

router.get("/me", async (req, res) => {
  const { user, error } = await resolveSupabaseUser(req);

  if (!user) {
    if (error === "SUPABASE_ADMIN_MISSING") {
      return res.status(503).json(AUTH_DISABLED_RESPONSE);
    }

    return res.status(401).json({ error: "Invalid or missing bearer token" });
  }

  return res.json({
    user: {
      sub: user.id,
      email: user.email ?? "",
      role: String(user.app_metadata?.role ?? user.user_metadata?.role ?? "user")
    }
  });
});

export default router;
