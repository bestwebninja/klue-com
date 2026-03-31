import { Router } from "express";
import authRoutes from "./auth";
import campaignRoutes from "./campaigns";
import leadRoutes from "./leads";
import billingRoutes from "./billing";
import adsRoutes from "./ads";
import onboardingRoutes from "./onboarding";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth", authRoutes);
router.use("/billing", billingRoutes);
router.use("/onboarding", onboardingRoutes);

router.use(requireAuth);
router.use("/campaigns", campaignRoutes);
router.use("/leads", leadRoutes);
router.use("/ads", adsRoutes);

export default router;
