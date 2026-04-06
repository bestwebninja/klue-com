import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isAllowlistedAdminEmail } from "@/constants/adminAllowlist";

export default function CookieAdminLoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Already authenticated — redirect if allowed
  if (user && isAllowlistedAdminEmail(user.email)) {
    navigate("/cookie-admin", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowlistedAdminEmail(email)) {
      toast({ title: "Access denied", description: "This email is not authorised.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message || "Invalid credentials.", variant: "destructive" });
        return;
      }
      navigate("/cookie-admin", { replace: true });
    } catch {
      toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Cookie Admin Login | Kluje" description="Authorised personnel only — sign in to manage cookie policies." noIndex={true} />
      <Navbar />

      <div className="flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-sm border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Cookie Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground">Authorised personnel only</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kluje.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
