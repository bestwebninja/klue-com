import { Router } from "express";
import authRoutes from "./auth";
import campaignRoutes from "./campaigns";
import leadRoutes from "./leads";
import billingRoutes from "./billing";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/leads", leadRoutes);
router.use("/billing", billingRoutes);

router.get("/health", (_req, res) => res.json({ ok: true }));

export default router;
