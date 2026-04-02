import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { AdminEmailGuard } from "@/components/AdminEmailGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Users, Bell } from "lucide-react";

const stats = [
  { icon: CheckCircle2, label: "Pending Approvals", value: "7", color: "text-primary" },
  { icon: AlertTriangle, label: "Flagged Campaigns", value: "3", color: "text-destructive" },
  { icon: Users, label: "User Access Requests", value: "5", color: "text-primary" },
  { icon: Bell, label: "Platform Alerts", value: "2", color: "text-amber-500" },
];

function AdminContent() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Admin Dashboard | Kluje" description="Operations and compliance admin panel." noIndex={true} />
      <Navbar />

      <PageHero title="Admin Dashboard" description="Operations and compliance workflows." variant="compact" />

      <section className="container mx-auto px-4 py-12 space-y-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed border-border">
          <CardContent className="pt-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Admin modules coming next</h2>
            <p className="text-sm text-muted-foreground">
              This shell is ready to host a moderation queue, role management, and audit logs.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/cookie-admin">Cookie Management</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin-dashboard">Site Admin</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}

export default function ComplyOSAdminDashboard() {
  return (
    <AdminEmailGuard>
      <AdminContent />
    </AdminEmailGuard>
  );
}
