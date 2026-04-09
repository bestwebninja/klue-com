import { useEffect, useState } from "react";
import { RoleBasedDashboardHome } from "@/components/dashboard/RoleBasedDashboardHome";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function MyDashboardView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data ?? null);
      });
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Home view for Command Center workspaces.</p>
      </div>
      <RoleBasedDashboardHome profile={profile} />
    </div>
  );
}
