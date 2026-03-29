export type PricingTier = {
  id: "starter" | "growth" | "enterprise";
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
};

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 499,
    description: "Launch campaigns quickly with core placements and reporting.",
    features: ["Up to 3 active campaigns", "AI placement recommendations", "Email support"]
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 1499,
    description: "Scale spend with richer targeting controls and better optimization.",
    features: ["Up to 15 active campaigns", "Multi-geo optimization", "Priority support"]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 4999,
    description: "Advanced controls, SLAs, and custom automation for larger teams.",
    features: ["Unlimited campaigns", "Dedicated success manager", "SLA + custom integrations"]
  }
];
