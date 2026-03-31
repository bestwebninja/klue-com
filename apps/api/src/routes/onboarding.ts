import { Router } from 'express';
import { fetchZipIntelligence } from '../services/zip-intelligence';

const router = Router();

const cache = new Map<string, { payload: any; refreshedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

router.get('/zip-intelligence/:zipCode', async (req, res, next) => {
  try {
    const { zipCode } = req.params;
    const cached = cache.get(zipCode);
    if (cached && Date.now() - cached.refreshedAt < CACHE_TTL_MS) {
      return res.json({ location: cached.payload.location, cache: cached.payload });
    }

    const payload = await fetchZipIntelligence(zipCode);
    cache.set(zipCode, { payload, refreshedAt: Date.now() });
    return res.json({ location: payload.location, cache: payload });
  } catch (error) {
    return next(error);
  }
});

router.post('/zip-intelligence/:zipCode', async (req, res, next) => {
  try {
    const { zipCode } = req.params;
    const payload = await fetchZipIntelligence(zipCode);
    cache.set(zipCode, { payload, refreshedAt: Date.now() });
    return res.json({ cache: payload, location: payload.location });
  } catch (error) {
    return next(error);
  }
});

export default router;
