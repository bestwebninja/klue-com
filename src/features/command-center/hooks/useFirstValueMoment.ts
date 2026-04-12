/**
 * useFirstValueMoment — fires market_intel agent once after onboarding.
 *
 * Design principles:
 * - Single execution per user (keyed to userId in localStorage, 24h TTL)
 * - Non-blocking: returns immediately with isLoading=true, resolves async
 * - Graceful degradation: if the agent fails, fired=true and data=null
 *   so the UI doesn't get stuck waiting
 * - Works with a brand-new user (no prior data in DB) because market_intel
 *   falls back to knowledge-based analyze_market_conditions for any ZIP
 */
import { useCallback, useState } from "react";
import { runCommandCenterAgent } from "../ai/client/commandCenterAiClient";

const FVM_CACHE_KEY = (userId: string) => `kluje_fvm_${userId}`;
const FVM_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface FVMParams {
  trade: string;
  zip: string;
  userId: string;
}

export interface FVMResult {
  data: Record<string, unknown> | null;
  isLoading: boolean;
  fired: boolean;
  trigger: (params: FVMParams) => Promise<void>;
  reset: () => void;
}

export function useFirstValueMoment(): FVMResult {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fired, setFired] = useState(false);

  const trigger = useCallback(async ({ trade, zip, userId }: FVMParams) => {
    // Check localStorage cache — skip if already run recently
    try {
      const cached = localStorage.getItem(FVM_CACHE_KEY(userId));
      if (cached) {
        const { ts, result } = JSON.parse(cached) as { ts: number; result: Record<string, unknown> };
        if (Date.now() - ts < FVM_TTL_MS) {
          setData(result);
          setFired(true);
          return;
        }
      }
    } catch { /* corrupt cache — proceed */ }

    setIsLoading(true);
    setFired(false);

    try {
      // Use the user's own ID as businessUnitId for the first run.
      // market_intel agent calls analyze_market_conditions(zip, tradeType)
      // which is geocode-based and works even with zero DB records.
      const { data: agentResult } = await runCommandCenterAgent(
        "market_intel",
        { tradeKey: trade, zip, tradeType: trade },
        userId
      );

      const output = agentResult?.output as Record<string, unknown> | null;
      if (output) {
        setData(output);
        try {
          localStorage.setItem(FVM_CACHE_KEY(userId), JSON.stringify({ ts: Date.now(), result: output }));
        } catch { /* storage quota — not critical */ }
      }
    } catch { /* network/edge fn error — degrade gracefully */ }
    finally {
      setIsLoading(false);
      setFired(true);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setFired(false);
  }, []);

  return { data, isLoading, fired, trigger, reset };
}
