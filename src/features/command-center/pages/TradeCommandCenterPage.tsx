import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Home, ClipboardList, MessageSquare, User, Settings, MapPin, Image, Star, Shield, BookOpen, HelpCircle, FileText, HardHat } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardTemplate } from "../hooks/useDashboardTemplate";
import { CommandCenterLayout } from "../components/layout/CommandCenterLayout";
import { KPIInsightCard } from "../components/cards/KPIInsightCard";
import { PipelineBoard } from "../components/pipeline/PipelineBoard";
import { AgentPanel } from "../components/agents/AgentPanel";
import GCCommandDashboard from "@/components/dashboard/GCCommandDashboard";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const providerNavItems = [
  { value: "home", label: "Home", icon: Home },
  { value: "gc-command", label: "Contractors", icon: HardHat },
  { value: "quotes", label: "Quotes", icon: ClipboardList },
  { value: "messages", label: "Messages", icon: MessageSquare },
  { value: "profile", label: "Profile", icon: User },
  { value: "services", label: "Services", icon: Settings },
  { value: "locations", label: "Locations", icon: MapPin },
  { value: "portfolio", label: "Portfolio", icon: Image },
  { value: "reviews", label: "Reviews", icon: Star },
  { value: "verification", label: "Verification", icon: Shield },
  { value: "blog", label: "Blog", icon: BookOpen },
  { value: "expert", label: "Expert Q&A", icon: HelpCircle },
  { value: "subscription", label: "Subscription", icon: FileText },
];

function RemodelingProviderDashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const navItems = useMemo(() => providerNavItems, []);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "220px", "--sidebar-width-icon": "3rem" } as CSSProperties}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          items={navItems}
          activeTab="gc-command"
          onTabChange={(tab) => navigate(`/dashboard?tab=${tab}`)}
          isSubscribed={profile?.subscription_status === "active"}
          isAdmin={isAdmin}
          userId={user.id}
          userName={profile?.full_name || undefined}
          unreadMessages={0}
          onSignOut={async () => {
            await signOut();
            navigate("/");
          }}
        />
        <SidebarInset className="flex-1 min-w-0">
          <DashboardHeader
            userName={profile?.full_name || undefined}
            userEmail={user.email}
            isSubscribed={profile?.subscription_status === "active"}
            isAdmin={isAdmin}
            onSignOut={async () => {
              await signOut();
              navigate("/");
            }}
            showContractorIdentity={true}
          />
          <main className="h-[calc(100vh-4rem)] overflow-hidden">
            <GCCommandDashboard />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function TradeCommandCenterPage() {
  const { workspaceId = "default-workspace", tradeKey = "plumbing" } = useParams();

  if (tradeKey === "remodeling") {
    return <RemodelingProviderDashboardPage />;
  }

  const template = useDashboardTemplate("trade", tradeKey as any);

  return (
    <CommandCenterLayout workspaceId={workspaceId}>
      <h1 className="text-2xl font-semibold">{template?.name ?? "Trade Command Center"}</h1>
      <div className="grid md:grid-cols-4 gap-3">
        {template?.config.kpis.map((k) => (
          <KPIInsightCard key={k.key} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </div>
      <PipelineBoard items={[{ id: "1", label: "Urgent service call", stage: "Dispatch", priority: "high" }]} />
      <AgentPanel name={template?.config.agents[0]?.label ?? "Agent"} description={template?.config.agents[0]?.description ?? ""} />
    </CommandCenterLayout>
  );
}
