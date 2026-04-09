import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostOAuthConsentScreen from '@/components/auth/PostOAuthConsentScreen';

const NON_OAUTH_PROVIDERS = new Set(['email', 'phone']);

type Stage =
  | 'exchanging'       // exchanging OAuth code for session
  | 'enriching'        // fetching LinkedIn profile + age check
  | 'age_rejected'     // LinkedIn account too young
  | 'consent'          // show push + newsletter consent
  | 'redirecting'      // all done, going to dashboard
  | 'error';           // generic error

export default function AuthCallback() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('exchanging');
  const [errorMsg, setErrorMsg] = useState('');
  const [userData, setUserData] = useState<{ id: string; email: string; isNew: boolean; provider: string } | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    handleCallback();
  }, []);

  const syncAdminRoleOnOAuth = async () => {
    try {
      const { error: syncAdminError } = await supabase.functions.invoke('sync-admin-role-on-login');
      if (syncAdminError) {
        console.error('Admin role sync error (non-fatal):', syncAdminError);
      }
    } catch (syncError) {
      console.error('Admin role sync exception (non-fatal):', syncError);
    }
  };

  const handleCallback = async () => {
    // Supabase automatically exchanges the ?code param or hash fragment
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      setErrorMsg(error?.message ?? 'No session found after OAuth. Please try again.');
      setStage('error');
      return;
    }

    const user = session.user;
    const provider = user.app_metadata?.provider ?? 'email';
    const providers = Array.isArray(user.app_metadata?.providers)
      ? (user.app_metadata.providers as string[])
      : [];
    const isNew = isNewUser(user.created_at);

    const hasOAuthProvider = providers.some((p) => !NON_OAUTH_PROVIDERS.has(p));
    const isOAuthProvider = Boolean(session.provider_token) || hasOAuthProvider || !NON_OAUTH_PROVIDERS.has(provider);

    if (isOAuthProvider) {
      await syncAdminRoleOnOAuth();
    }

    // Record auth method in profile
    await supabase
      .from('profiles')
      .update({ last_auth_method: provider === 'linkedin_oidc' ? 'linkedin' : provider } as any)
      .eq('id', user.id);

    // ---------- LinkedIn enrichment & age gate ----------
    if (provider === 'linkedin_oidc') {
      setStage('enriching');
      try {
        const { data: enrichResult, error: enrichError } = await supabase.functions.invoke(
          'linkedin-enrich',
          { body: { userId: user.id, accessToken: session.provider_token } }
        );

        if (enrichError) throw enrichError;

        if (enrichResult?.ageRejected) {
          // Sign the user out immediately — not allowed
          await supabase.auth.signOut();
          setStage('age_rejected');
          return;
        }
      } catch (e) {
        console.error('LinkedIn enrichment error (non-fatal):', e);
        // Non-fatal: allow login even if enrichment fails, log for manual review
      }
    }

    setUserData({ id: user.id, email: user.email ?? '', isNew, provider });

    // New social signup → show consent screen; existing → redirect
    if (isNew) {
      setStage('consent');
    } else {
      finishRedirect(user.app_metadata);
    }
  };

  const finishRedirect = (appMeta?: Record<string, unknown>) => {
    setStage('redirecting');
    const role = appMeta?.role as string | undefined;
    if (role === 'admin') navigate('/dashboard');
    else navigate('/dashboard');
  };

  const handleConsentDone = () => {
    if (userData) finishRedirect();
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function isNewUser(createdAt: string) {
    return Date.now() - new Date(createdAt).getTime() < 60_000; // created < 60 s ago
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (stage === 'consent' && userData) {
    return (
      <PostOAuthConsentScreen
        userId={userData.id}
        email={userData.email}
        provider={userData.provider}
        onComplete={handleConsentDone}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">

        {(stage === 'exchanging' || stage === 'enriching' || stage === 'redirecting') && (
          <>
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto" />
            <p className="text-slate-300 text-sm">
              {stage === 'enriching'
                ? 'Verifying your LinkedIn profile…'
                : stage === 'redirecting'
                ? 'All set — taking you to your dashboard…'
                : 'Completing sign-in…'}
            </p>
          </>
        )}

        {stage === 'age_rejected' && (
          <>
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-white text-xl font-semibold">LinkedIn account too new</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              To keep Kluje secure, we only allow LinkedIn accounts that are at least
              <strong className="text-white"> 1 year old</strong>. Please use Google
              or email to sign in instead.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white"
            >
              Back to sign in
            </Button>
          </>
        )}

        {stage === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-white text-xl font-semibold">Sign-in failed</h2>
            <p className="text-slate-400 text-sm">{errorMsg}</p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white"
            >
              Try again
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
