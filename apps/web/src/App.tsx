import { useEffect, useMemo, useState } from "react";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdvertiserLandingPage } from "./pages/AdvertiserLandingPage";
import { AdvertiserDashboardPage } from "./pages/AdvertiserDashboardPage";
import { BillingPage } from "./pages/BillingPage";
import { CampaignSubmissionPage } from "./pages/CampaignSubmissionPage";
import { LoginPage } from "./pages/LoginPage";
import { PlacementsPage } from "./pages/PlacementsPage";
import { SignupPage } from "./pages/SignupPage";

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
}

export function navigate(to: string) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function App() {
  const pathname = usePathname();

  const page = useMemo(() => {
    switch (pathname) {
      case "/":
        return <AdvertiserLandingPage />;
      case "/login":
        return <LoginPage />;
      case "/signup":
        return <SignupPage />;
      case "/dashboard":
        return <AdvertiserDashboardPage />;
      case "/campaigns/new":
        return <CampaignSubmissionPage />;
      case "/placements":
        return <PlacementsPage />;
      case "/billing":
        return <BillingPage />;
      case "/admin":
        return <AdminDashboardPage />;
      default:
        return <LoginPage />;
    }
  }, [pathname]);

  return page;
}
