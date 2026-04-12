import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCommandCenter } from "../hooks/useCommandCenter";
import { LoadingState } from "../components/shared/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { CommandCenterSetupWizard } from "../components/onboarding/CommandCenterSetupWizard";
import { saveOnboarding } from "../services/onboardingService";

/** Derive a trade route segment from a template_key stored in dashboard_bootstraps.
 *  Examples: "trade_plumbing_v1" → "plumbing", "plumbing" → "plumbing", "" → "remodeling"
 */
function tradeFromTemplateKey(templateKey?: string | null): string {
  if (!templateKey) return "remodeling";
  // Strip leading "trade_" prefix and trailing "_v<n>" suffix
  const stripped = templateKey.replace(/^trade_/, "").replace(/_v\d+$/, "");
  return stripped || "remodeling";
}

export default function CommandCenterHomePage() {
  const { user } = useAuth();
  const { instance, loading, workspaceId } = useCommandCenter();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && instance) {
      const trade = tradeFromTemplateKey(instance.template_key);
      navigate(`/command-center/${workspaceId}/trade/${trade}?section=today`, { replace: true });
    }
  }, [loading, user, instance, workspaceId, navigate]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  if (!instance) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <CommandCenterSetupWizard
          workspaceId={workspaceId ?? user.id}
          onComplete={async (values) => {
            await saveOnboarding(workspaceId ?? user.id, user.id, values);
            navigate(`/command-center/${workspaceId ?? user.id}/trade/${values.trade}?section=today`);
          }}
        />
      </div>
    );
  }

  return <LoadingState />;
}
