import { useEffect, useState } from "react";
import { commandCenterService } from "../services/commandCenterService";
import { useAuth } from "@/hooks/useAuth";

export function useDashboardInstance() {
  const { user } = useAuth();
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    commandCenterService.resolveDefaultInstance(user.id).then(setInstance).finally(() => setLoading(false));
  }, [user]);

  return { instance, loading };
}
