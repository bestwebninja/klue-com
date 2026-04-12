/**
 * CommandCenterSetupWizard — three-phase onboarding:
 *
 *   Phase 1 → TradeClassifierForm (trade picker + ZIP + focus)
 *   Phase 2 → "Analyzing your market..." (fires useFirstValueMoment)
 *   Phase 3 → WelcomeInsightsPanel (market intelligence displayed)
 *
 * The wizard does not call onComplete until the user clicks
 * "Enter your Command Center" in the WelcomeInsightsPanel, ensuring
 * every new user experiences the First Value Moment before leaving
 * the onboarding flow.
 */
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { TradeClassifierForm, type TradeClassifierValues } from "./TradeClassifierForm";
import { WelcomeInsightsPanel } from "./WelcomeInsightsPanel";
import { useFirstValueMoment } from "../../hooks/useFirstValueMoment";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface Props {
  workspaceId: string;
  onComplete: (values: TradeClassifierValues) => void;
}

type WizardPhase = "classify" | "analyzing" | "insights";

export function CommandCenterSetupWizard({ workspaceId, onComplete }: Props) {
  const [phase, setPhase] = useState<WizardPhase>("classify");
  const [values, setValues] = useState<TradeClassifierValues | null>(null);
  const { user } = useAuth();
  const fvm = useFirstValueMoment();

  // When FVM completes (success or failure), advance to insights
  useEffect(() => {
    if (phase === "analyzing" && fvm.fired) {
      setPhase("insights");
    }
  }, [fvm.fired, phase]);

  function handleFormSubmit(formValues: TradeClassifierValues) {
    setValues(formValues);
    setPhase("analyzing");
    // Fire the First Value Moment — non-blocking
    if (user?.id) {
      fvm.trigger({ trade: formValues.trade, zip: formValues.zip, userId: user.id });
    } else {
      // No auth context (edge case) — skip straight to insights after brief delay
      setTimeout(() => setPhase("insights"), 1500);
    }
    // Persist onboarding values immediately (fire-and-forget)
    onComplete(formValues);
  }

  const stepLabel =
    phase === "classify" ? "Step 1 of 2 — Your trade" :
    phase === "analyzing" ? "Analyzing your market…" :
    "Your market intelligence";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 max-w-lg mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <BrainCircuit className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Command Center Setup</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stepLabel}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: phase === "classify" ? "33%" : phase === "analyzing" ? "66%" : "100%",
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {phase === "classify" && (
          <TradeClassifierForm onSubmit={handleFormSubmit} />
        )}

        {(phase === "analyzing" || phase === "insights") && values && (
          <WelcomeInsightsPanel
            isLoading={phase === "analyzing" || fvm.isLoading}
            data={fvm.data}
            trade={values.trade}
            workspaceId={workspaceId}
          />
        )}
      </CardContent>
    </Card>
  );
}
