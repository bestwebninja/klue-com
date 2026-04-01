import { clampScore } from "./formatters";
import type { ZipExplorerModel } from "./types";

export const calculateDerivedScores = (model: Omit<ZipExplorerModel, "derivedScores">) => {
  const ownerRate = model.housing.ownerOccupiedRate ?? 0.5;
  const rentRatio = model.affordability.incomeToRentRatio ?? 2;
  const homeRatio = model.affordability.incomeToHomeValueRatio ?? 0.2;

  // Heuristic only: combines schools + children households + owner stability cues.
  const familyFitScore = clampScore(
    (model.schools.averageRating ?? 5) * 8 +
      (model.demographics.householdsWithChildrenRate ?? 0.25) * 40 +
      ownerRate * 30,
  );

  // Heuristic only: higher rent/home ratios are treated as more affordable.
  const affordabilityScore = clampScore(rentRatio * 20 + homeRatio * 120 - (model.housing.medianGrossRent ?? 1800) / 120);

  const renterFriendlinessScore = clampScore((1 - ownerRate) * 60 + rentRatio * 20 + (model.walkability.walkScore ?? 50) * 0.2);
  const homeownerFriendlinessScore = clampScore(ownerRate * 60 + homeRatio * 120 + (model.housing.medianHomeValue ? 10 : 0));

  const overallZipSnapshotScore = clampScore(
    familyFitScore * 0.25 + affordabilityScore * 0.35 + renterFriendlinessScore * 0.2 + homeownerFriendlinessScore * 0.2,
  );

  const profileLabel = ownerRate > 0.62
    ? "Higher-cost owner market"
    : renterFriendlinessScore > homeownerFriendlinessScore + 10
      ? "Better for renters"
      : familyFitScore >= 65
        ? "Strong for families"
        : "Mixed affordability profile";

  return {
    familyFitScore,
    affordabilityScore,
    renterFriendlinessScore,
    homeownerFriendlinessScore,
    overallZipSnapshotScore,
    profileLabel,
  };
};
