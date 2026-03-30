import { useEffect, useMemo, useState } from "react";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdvertiserLandingPage } from "./pages/AdvertiserLandingPage";
import { AdvertiserDashboardPage } from "./pages/AdvertiserDashboardPage";
import { BillingPage } from "./pages/BillingPage";
import { CampaignSubmissionPage } from "./pages/CampaignSubmissionPage";
import { CookieAdminPage } from "./pages/CookieAdminPage";
import { CookieAdminLoginPage } from "./pages/CookieAdminLoginPage";
import { DemoPage } from "./pages/DemoPage";
import { DoNotSellPage } from "./pages/DoNotSellPage";
import { LoginPage } from "./pages/LoginPage";
import { MetricsPage } from "./pages/MetricsPage";
import { PlacementsPage } from "./pages/PlacementsPage";
import { PricingPage } from "./pages/PricingPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { PrivacyPreferencesPage } from "./pages/PrivacyPreferencesPage";
import { PrivacyRequestPage } from "./pages/PrivacyRequestPage";
import { SignupPage } from "./pages/SignupPage";
import { getSession, isAdminSession } from "./lib/auth";

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

// Public routes that don't require authentication
const PUBLIC_ROUTES = new Set([
  "/", "/login", "/signup", "/demo", "/pricing", "/metrics",
  "/privacy", "/privacy/request", "/privacy/preferences", "/privacy/do-not-sell",
  "/about", "/cookie-admin/login",
]);

export function App() {
  const pathname = usePathname();
  const session = getSession();
  const requiresAuth = !PUBLIC_ROUTES.has(pathname);

  if (requiresAuth && !session) {
    return <LoginPage />;
  }

  // Admin-only routes
  if ((pathname === "/admin-dashboard" || pathname === "/cookie-admin") && !isAdminSession(session)) {
    return <AdvertiserDashboardPage />;
  }

  const page = useMemo(() => {
    switch (pathname) {
      case "/":
        return <AdvertiserLandingPage />;
      case "/login":
        return <LoginPage />;
      case "/signup":
        return <SignupPage />;
      case "/demo":
        return <DemoPage />;
      case "/pricing":
        return <PricingPage />;
      case "/metrics":
        return <MetricsPage />;
      case "/privacy":
        return <PrivacyPage />;
      case "/privacy/request":
        return <PrivacyRequestPage />;
      case "/privacy/preferences":
        return <PrivacyPreferencesPage />;
      case "/privacy/do-not-sell":
        return <DoNotSellPage />;
      case "/about":
        return <AboutPage />;
      case "/dashboard":
        return <AdvertiserDashboardPage />;
      case "/campaigns/new":
        return <CampaignSubmissionPage />;
      case "/placements":
        return <PlacementsPage />;
      case "/billing":
        return <BillingPage />;
      case "/admin-dashboard":
        return <AdminDashboardPage />;
      case "/cookie-admin":
        return <CookieAdminPage />;
      case "/cookie-admin/login":
        return <CookieAdminLoginPage />;
      default:
        return <LoginPage />;
    }
  }, [pathname]);

  return page;
}
