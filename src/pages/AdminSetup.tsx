import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ADMIN_EMAILS = ['divitiae.terrae.llc@gmail.com', 'marcus@kluje.com'];

export default function AdminSetup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-muted-foreground mb-4">You must be signed in to use this page.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const isEligible = ADMIN_EMAILS.includes(user.email ?? '');

  const handleClaim = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('ensure-admin-roles');
      if (error) throw error;
      setStatus('success');
      const result = data?.results?.[user.email ?? ''] ?? 'Done';
      setMessage(result);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full border rounded-2xl p-8 shadow-lg bg-card text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Shield className="h-7 w-7 text-orange-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Bootstrap</h1>
          <p className="text-muted-foreground text-sm mt-1">One-time admin role setup for Kluje owners</p>
        </div>

        <div className="text-sm bg-muted/50 rounded-lg p-4 text-left space-y-1">
          <p><span className="text-muted-foreground">Signed in as:</span> <strong>{user.email}</strong></p>
          <p><span className="text-muted-foreground">Eligible:</span>{' '}
            {isEligible
              ? <span className="text-green-500 font-medium">Yes</span>
              : <span className="text-destructive font-medium">No — this email is not in the admin list</span>
            }
          </p>
        </div>

        {isEligible && status === 'idle' && (
          <Button onClick={handleClaim} className="w-full bg-orange-500 hover:bg-orange-600">
            Claim Admin Access
          </Button>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Granting admin role…</span>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Success: {message}</span>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full bg-orange-500 hover:bg-orange-600">
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="text-sm">Error: {message}</span>
            </div>
            <Button variant="outline" onClick={handleClaim}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
