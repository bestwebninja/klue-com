import { Route } from "react-router-dom";
import CommandCenterHomePage from "@/features/command-center/pages/CommandCenterHomePage";
import TradeCommandCenterPage from "@/features/command-center/pages/TradeCommandCenterPage";
import FinanceCommandCenterPage from "@/features/command-center/pages/FinanceCommandCenterPage";
import TitleCommandCenterPage from "@/features/command-center/pages/TitleCommandCenterPage";
import CommandCenterSettingsPage from "@/features/command-center/pages/CommandCenterSettingsPage";
import RemodelingCommandCenterPage from "@/features/command-center/pages/RemodelingCommandCenterPage";

export function getCommandCenterRoutes() {
  return (
    <>
      <Route path="/command-center" element={<CommandCenterHomePage />} />
      <Route path="/command-center/remodeling" element={<RemodelingCommandCenterPage />} />
      <Route path="/command-center/:workspaceId" element={<TradeCommandCenterPage />} />
      <Route path="/command-center/:workspaceId/trade/:tradeKey" element={<TradeCommandCenterPage />} />
      <Route path="/command-center/:workspaceId/finance" element={<FinanceCommandCenterPage />} />
      <Route path="/command-center/:workspaceId/title" element={<TitleCommandCenterPage />} />
      <Route path="/command-center/:workspaceId/settings" element={<CommandCenterSettingsPage />} />
    </>
  );
}
