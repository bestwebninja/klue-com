import type { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";
import { resolveSupabaseUser } from "../services/supabase-session";

export type AuthRequest = Request & {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
};

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  type: "access" | "refresh";
  exp: number;
  iss: string;
  aud: string;
};

const signToken = (payload: TokenPayload) => {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", env.jwtSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
};

const verifyToken = (token: string): TokenPayload | null => {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", env.jwtSecret).update(body).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  const now = Math.floor(Date.now() / 1000);

  if (parsed.exp <= now) return null;
  if (parsed.iss !== env.jwtIssuer || parsed.aud !== env.jwtAudience) return null;

  return parsed;
};

const parseTtlSeconds = (raw: string, fallbackSeconds: number): number => {
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackSeconds;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
  return value * multiplier;
};

export const issueAccessToken = (input: { sub: string; email: string; role: string }) => {
  const ttl = parseTtlSeconds(env.accessTokenTtl, 900);
  return signToken({
    ...input,
    type: "access",
    iss: env.jwtIssuer,
    aud: env.jwtAudience,
    exp: Math.floor(Date.now() / 1000) + ttl
  });
};

export const issueRefreshToken = (input: { sub: string; email: string; role: string }) => {
  const ttl = parseTtlSeconds(env.refreshTokenTtl, 604800);
  return signToken({
    ...input,
    type: "refresh",
    iss: env.jwtIssuer,
    aud: env.jwtAudience,
    exp: Math.floor(Date.now() / 1000) + ttl
  });
};

export const verifyRefreshToken = (token: string) => {
  const payload = verifyToken(token);
  if (!payload || payload.type !== "refresh") return null;
  return payload;
};

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const { user, error } = await resolveSupabaseUser(req);

  if (!user) {
    if (error === "SUPABASE_ADMIN_MISSING") {
      return res.status(503).json({
        error: "Auth route disabled",
        code: "AUTH_DISABLED",
        message: "Supabase auth validation is not configured on this API"
      });
    }

    return res.status(401).json({ error: "Invalid or missing bearer token" });
  }

  req.user = {
    sub: user.id,
    email: user.email ?? "",
    role: String(user.app_metadata?.role ?? user.user_metadata?.role ?? "user")
  };

  return next();
}
