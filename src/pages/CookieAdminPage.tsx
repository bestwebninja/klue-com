import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { AdminEmailGuard } from "@/components/AdminEmailGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const cookieCategories = [
  { name: "Essential", count: 4, status: "Always On" },
  { name: "Analytics", count: 3, status: "Enabled" },
  { name: "Advertising", count: 6, status: "Enabled" },
  { name: "Marketing", count: 2, status: "Disabled" },
];

const recentConsents = [
  { email: "user1@example.com", date: "2026-03-28", accepted: ["Essential", "Analytics"] },
  { email: "user2@example.com", date: "2026-03-27", accepted: ["Essential", "Analytics", "Advertising"] },
  { email: "user3@example.com", date: "2026-03-26", accepted: ["Essential"] },
];

function CookieAdminContent() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Cookie Management | Kluje Admin" description="Manage cookie categories and view consent logs." noIndex={true} />
      <Navbar />

      <PageHero title="Cookie Management" description="Configure cookie categories and view consent logs." variant="compact" />

      <section className="container mx-auto px-4 py-12 space-y-10">
        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Cookie Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cookieCategories.map((c) => (
              <Card key={c.name} className="border-border">
                <CardContent className="pt-5">
                  <p className="text-sm text-muted-foreground">{c.name}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{c.count} cookies</p>
                  <Badge variant={c.status === "Disabled" ? "destructive" : "secondary"} className="mt-2">
                    {c.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Consent logs */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Consent Logs</h2>
          <Card className="border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Accepted Categories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentConsents.map((c) => (
                  <TableRow key={c.email}>
                    <TableCell className="font-medium">{c.email}</TableCell>
                    <TableCell>{c.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.accepted.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function CookieAdminPage() {
  return (
    <AdminEmailGuard>
      <CookieAdminContent />
    </AdminEmailGuard>
  );
}
