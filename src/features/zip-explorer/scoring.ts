import type { ZipExplorerModel } from "./types";
import { clampScore } from "./formatters";

export const calculateDerivedScores = (model: Omit<ZipExplorerModel, "derivedScores">) => {
  const familyFit = clampScore(
    ((model.schools.averageRating ?? 0) * 20 +
      (model.walkability.walkScore ?? 0) * 0.4 +
      (model.airQuality.aqi ? 100 - model.airQuality.aqi : 0) * 0.3) /
      1.7,
  );

  const affordability = clampScore(
    (model.affordability.incomeToRentRatio ? model.affordability.incomeToRentRatio * 25 : 0) +
      (model.affordability.incomeToHomeValueRatio ? model.affordability.incomeToHomeValueRatio * 100 : 0),
  );

  const livability = clampScore(
    ((model.walkability.walkScore ?? 0) * 0.5 +
      (model.airQuality.aqi ? 100 - model.airQuality.aqi : 0) * 0.3 +
      (model.klujeRisk.riskScore ? 100 - model.klujeRisk.riskScore : 0) * 0.2),
  );

  return { familyFit, affordability, livability };
};
