import { Router } from "express";
import authRoutes from "./auth";
import campaignRoutes from "./campaigns";
import leadRoutes from "./leads";
import billingRoutes from "./billing";
import adsRoutes from "./ads";
import onboardingRoutes from "./onboarding";
import zipCodesRoutes from "./zipcodes";
import contractorOsRoutes from "./contractor-os";
import areaRiskRoutes from "./area-risk";
import routingRoutes from "./routing";
import providersRoutes from "./providers";
import quoteRequestsRoutes from "./quote-requests";
import verificationRoutes from "./verification";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * Public-by-design routes:
 * - /health (liveness)
 * - /auth/* (token introspection + disabled auth stubs)
 * - /billing/webhooks/stripe (Stripe-signed webhook only)
 * - /onboarding/zip-intelligence/:zipCode (product onboarding ZIP lookup; strict ZIP validation + global API rate limit)
 * - /zipcodes/search (public autocomplete; query validation + global API rate limit)
 * - /area-risk/score (public risk scoring API; request schema validation + global API rate limit)
 * - /signup (contractor signup only; all other contractor-os routes enforce auth locally)
 */
router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth", authRoutes);
router.use("/billing", billingRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/zipcodes", zipCodesRoutes);
router.use("/area-risk", areaRiskRoutes);
router.use("/", contractorOsRoutes);

router.use(requireAuth);
router.use("/campaigns", campaignRoutes);
router.use("/leads", leadRoutes);
router.use("/ads", adsRoutes);
router.use("/routing", routingRoutes);
router.use("/providers", providersRoutes);
router.use("/quote-requests", quoteRequestsRoutes);
router.use("/", verificationRoutes);

export default router;
