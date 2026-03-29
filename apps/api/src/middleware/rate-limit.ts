import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

const buildLimiter = (maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "global";
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + env.rateLimitWindowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ error: "Too many requests. Please retry later." });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
  };
};

export const apiRateLimit = buildLimiter(env.rateLimitMax);
export const authRateLimit = buildLimiter(env.authRateLimitMax);
