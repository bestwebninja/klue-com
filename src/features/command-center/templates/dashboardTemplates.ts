import { electricalTemplate } from "./electricalTemplate";
import { financeTemplate } from "./financeTemplate";
import { finishingTemplate } from "./finishingTemplate";
import { hvacTemplate } from "./hvacTemplate";
import { landscapingTemplate } from "./landscapingTemplate";
import { plumbingTemplate } from "./plumbingTemplate";
import { remodelingTemplate } from "./remodelingTemplate";
import { roofingTemplate } from "./roofingTemplate";
import { titleTemplate } from "./titleTemplate";
import { windowsDoorsTemplate } from "./windowsDoorsTemplate";
import type { Audience, DashboardTemplate, TradeKey } from "./types";

export const dashboardTemplates: DashboardTemplate[] = [
  plumbingTemplate,
  electricalTemplate,
  hvacTemplate,
  roofingTemplate,
  remodelingTemplate,
  finishingTemplate,
  landscapingTemplate,
  windowsDoorsTemplate,
  financeTemplate,
  titleTemplate,
];

export function getTemplateByAudience(audience: Audience, trade?: TradeKey): DashboardTemplate | undefined {
  return dashboardTemplates.find((template) => template.audience === audience && (audience !== "trade" || template.trade === trade));
}

export function getTemplateByKey(key: string): DashboardTemplate | undefined {
  return dashboardTemplates.find((template) => template.key === key);
}
