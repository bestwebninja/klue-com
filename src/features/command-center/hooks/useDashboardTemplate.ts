import { useMemo } from "react";
import { dashboardTemplateService } from "../services/dashboardTemplateService";
import type { Audience, TradeKey } from "../templates/types";

export function useDashboardTemplate(audience: Audience, trade?: TradeKey) {
  return useMemo(() => dashboardTemplateService.getTemplateByAudience(audience, trade), [audience, trade]);
}
