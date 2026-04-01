import { useNavigate } from "react-router-dom";
import { useCommandCenter } from "../hooks/useCommandCenter";
import { LoadingState } from "../components/shared/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { CommandCenterSetupWizard } from "../components/onboarding/CommandCenterSetupWizard";
import { saveOnboarding } from "../services/onboardingService";

export default function CommandCenterHomePage() {
  const { user } = useAuth();
  const { instance, loading } = useCommandCenter();
  const navigate = useNavigate();

  if (loading) return <LoadingState />;
  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!instance) {
    return <div className="max-w-xl mx-auto py-10"><CommandCenterSetupWizard onComplete={async (values) => {
      const workspaceId = user.id;
      await saveOnboarding(workspaceId, user.id, values);
      navigate(`/command-center/${workspaceId}/trade/${values.trade}`);
    }} /></div>;
  }

  navigate(`/command-center/${instance.business_unit_id}`);
  return <LoadingState />;
}
