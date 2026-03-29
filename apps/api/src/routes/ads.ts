import { Router } from "express";
import { z } from "zod";

const router = Router();

const placementRecommendationSchema = z.object({
  vertical: z.string().min(2),
  dailyBudget: z.number().positive(),
  targetGeos: z.array(z.string().min(2)).min(1)
});

const PLACEMENT_CATALOG = [
  { id: "home-finance-native", name: "Home Finance Native Feed", type: "Native", baselineCtr: 1.8 },
  { id: "auto-quote-search", name: "Auto Quote Search Listings", type: "Search", baselineCtr: 2.4 },
  { id: "health-comparison-sidebar", name: "Health Comparison Sidebar", type: "Display", baselineCtr: 0.9 },
  { id: "services-intent-banner", name: "Services Intent Banner", type: "Display", baselineCtr: 1.4 },
  { id: "zipcode-match-carousel", name: "Zipcode Match Carousel", type: "Native", baselineCtr: 2.1 }
];

function scorePlacement(vertical: string, dailyBudget: number, geoCount: number, baselineCtr: number): number {
  const budgetScore = Math.min(1, dailyBudget / 5000);
  const geoFocusScore = geoCount <= 3 ? 1 : geoCount <= 8 ? 0.84 : 0.72;
  const verticalScore = ["finance", "insurance", "health"].includes(vertical.toLowerCase()) ? 1 : 0.88;
  const ctrScore = baselineCtr / 3;

  return Number((budgetScore * 0.3 + geoFocusScore * 0.25 + verticalScore * 0.2 + ctrScore * 0.25).toFixed(3));
}

router.post("/placements/recommendations", (req, res) => {
  const parsed = placementRecommendationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { vertical, dailyBudget, targetGeos } = parsed.data;
  const geoCount = targetGeos.length;

  const ranked = PLACEMENT_CATALOG.map((placement) => {
    const aiScore = scorePlacement(vertical, dailyBudget, geoCount, placement.baselineCtr);
    const projectedCtr = Number((placement.baselineCtr * (0.8 + aiScore / 2)).toFixed(2));

    return {
      ...placement,
      aiScore,
      projectedCtr,
      status: aiScore > 0.82 ? "Recommended" : aiScore > 0.7 ? "Test" : "Limited"
    };
  }).sort((a, b) => b.aiScore - a.aiScore);

  return res.status(200).json({
    data: ranked,
    modelVersion: "placement-ranker-v1",
    generatedAt: new Date().toISOString()
  });
});

export default router;
