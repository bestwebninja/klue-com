import { Router } from "express";
import { z } from "zod";
import { fetchZipIntelligence } from "../services/zip-intelligence";

const router = Router();

const querySchema = z.object({ q: z.string().trim().min(1).max(20) });

const runtimeCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

router.get("/search", async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const normalizedQuery = parsed.data.q.replace(/[^0-9]/g, "").slice(0, 5);
    if (!normalizedQuery) return res.json({ results: [] });

    const candidateZips = new Set<string>([normalizedQuery]);
    if (normalizedQuery.length >= 3) {
      for (let i = 0; i < 10; i += 1) {
        const suffix = `${i}`;
        if (normalizedQuery.length === 5) break;
        candidateZips.add(`${normalizedQuery}${suffix}`.slice(0, 5));
      }
    }

    const results: Array<{
      zipCode: string;
      city?: string;
      state?: string;
      county?: string;
      lat?: number;
      lng?: number;
      score: number;
    }> = [];

    await Promise.all(
      Array.from(candidateZips)
        .filter((zip) => zip.length >= 3)
        .slice(0, 8)
        .map(async (zipCandidate) => {
          const cached = runtimeCache.get(zipCandidate);
          if (cached && cached.expiresAt > Date.now()) {
            const item = cached.data;
            results.push({ ...item, score: item.zipCode === normalizedQuery ? 100 : 50 });
            return;
          }

          const payload = await fetchZipIntelligence(zipCandidate);
          if (!payload?.location?.zip_code) return;

          const item = {
            zipCode: payload.location.zip_code,
            city: payload.location.city,
            state: payload.location.state,
            county: payload.location.county,
            lat: payload.location.latitude,
            lng: payload.location.longitude
          };

          runtimeCache.set(zipCandidate, { data: item, expiresAt: Date.now() + CACHE_TTL_MS });
          results.push({ ...item, score: item.zipCode === normalizedQuery ? 100 : 50 });
        })
    );

    const deduped = Array.from(new Map(results.map((item) => [item.zipCode, item])).values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score, ...rest }) => rest);

    return res.json({ results: deduped });
  } catch (error) {
    return next(error);
  }
});

export default router;
