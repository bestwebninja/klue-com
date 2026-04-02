import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isAllowlistedAdminEmail } from "@/constants/adminAllowlist";

export function AdminEmailGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const isAllowed = isAllowlistedAdminEmail(user?.email);

  if (!user || !isAllowed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4 py-32 px-4 text-center">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            This page is restricted to authorised administrators. Please sign in with a permitted account.
          </p>
          <Button asChild variant="outline">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
