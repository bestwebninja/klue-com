/**
 * linkedin-enrich
 * ───────────────
 * Called from AuthCallback.tsx after a successful LinkedIn OIDC login.
 * Responsibilities:
 *   1. Fetch LinkedIn profile data (name, picture, headline, vanityName)
 *      via the LinkedIn API v2 using the OAuth access token.
 *   2. Run the account-age gate:
 *      – Primary check : LinkedIn "member since" via SerpAPI Google search
 *      – Fallback check: profile maturity signals (experience count, connections)
 *      – If account appears < 1 year old → return { ageRejected: true }
 *   3. Persist enriched data to public.profiles and log the auth event.
 *
 * Environment variables required:
 *   SERPAPI_KEY          – SerpAPI key for Google search (optional but recommended)
 *   SUPABASE_URL         – auto-injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY – auto-injected by Supabase
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { userId, accessToken } = await req.json() as { userId: string; accessToken: string };

    if (!userId) return err('userId is required', 400);

    // ── 1. Fetch LinkedIn profile via API ──────────────────────────────────
    let profileData: LinkedInProfile | null = null;

    if (accessToken) {
      try {
        profileData = await fetchLinkedInProfile(accessToken);
      } catch (e) {
        console.warn('LinkedIn API fetch failed:', e);
      }
    }

    // ── 2. Age gate ────────────────────────────────────────────────────────
    let ageRejected = false;
    let ageCheckStatus: 'approved' | 'rejected' | 'manual_review' = 'manual_review';
    let rejectionReason: string | null = null;
    const rawResponse: Record<string, unknown> = {};

    if (profileData) {
      const serpApiKey = Deno.env.get('SERPAPI_KEY');

      if (serpApiKey && profileData.vanityName) {
        // Primary: SerpAPI Google search for the profile page
        const ageResult = await checkAgeViaSerpApi(profileData.vanityName, serpApiKey);
        rawResponse.serpApiResult = ageResult;

        if (ageResult.isYoung) {
          ageRejected = true;
          ageCheckStatus = 'rejected';
          rejectionReason = `LinkedIn profile appears to be < 1 year old (source: SERP cache date)`;
        } else if (ageResult.confirmed) {
          ageCheckStatus = 'approved';
        }
        // else: not enough data → manual_review (allow for now, flag in DB)
      } else {
        // Fallback: profile maturity heuristics
        const signals = scoreProfileMaturity(profileData);
        rawResponse.maturitySignals = signals;

        if (signals.score < 20) {
          ageRejected = true;
          ageCheckStatus = 'rejected';
          rejectionReason = `Profile maturity score too low (${signals.score}/100): ${signals.reasons.join(', ')}`;
        } else {
          ageCheckStatus = signals.score >= 50 ? 'approved' : 'manual_review';
        }
      }
    } else {
      // No profile data – allow but flag for manual review
      ageCheckStatus = 'manual_review';
    }

    // ── 3. Persist age-check result ────────────────────────────────────────
    await supabase.from('linkedin_age_checks').upsert(
      {
        user_id:          userId,
        linkedin_sub:     profileData?.id ?? null,
        profile_url:      profileData?.vanityName
          ? `https://www.linkedin.com/in/${profileData.vanityName}`
          : null,
        check_status:     ageCheckStatus,
        rejection_reason: rejectionReason,
        raw_response:     rawResponse,
        checked_at:       new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    // ── 4. Enrich profile if not rejected ──────────────────────────────────
    if (!ageRejected && profileData) {
      const updates: Record<string, unknown> = {
        last_auth_method: 'linkedin',
      };

      if (profileData.profilePictureUrl) updates.avatar_url       = profileData.profilePictureUrl;
      if (profileData.headline)           updates.linkedin_headline = profileData.headline;
      if (profileData.vanityName) {
        updates.linkedin_profile_url  = `https://www.linkedin.com/in/${profileData.vanityName}`;
        updates.linkedin_verified_at  = new Date().toISOString();
      }
      if (profileData.firstName || profileData.lastName) {
        updates.first_name = profileData.firstName ?? undefined;
        updates.last_name  = profileData.lastName  ?? undefined;
        if (!updates.full_name) {
          updates.full_name = [profileData.firstName, profileData.lastName].filter(Boolean).join(' ');
        }
      }

      await supabase.from('profiles').update(updates).eq('id', userId);
    }

    // ── 5. Log the auth event ───────────────────────────────────────────────
    await supabase.from('social_auth_events').insert({
      user_id:  userId,
      provider: 'linkedin',
      event:    ageRejected ? 'age_rejected' : 'login',
      metadata: { ageCheckStatus, hasProfile: !!profileData },
    });

    return json({ ageRejected, ageCheckStatus });

  } catch (e) {
    console.error('linkedin-enrich error:', e);
    return json({ ageRejected: false, error: String(e) });
  }
});

// ── Types ───────────────────────────────────────────────────────────────────

interface LinkedInProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  vanityName?: string;
  profilePictureUrl?: string;
  numConnections?: number;
  positions?: unknown[];
  educations?: unknown[];
}

interface MaturitySignals {
  score: number; // 0–100
  reasons: string[];
}

interface SerpAgeResult {
  isYoung: boolean;
  confirmed: boolean;
  cacheDate?: string;
}

// ── LinkedIn API ─────────────────────────────────────────────────────────────

async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  // LinkedIn OIDC userinfo endpoint
  const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) throw new Error(`LinkedIn userinfo ${userInfoRes.status}`);
  const userInfo = await userInfoRes.json();

  // LinkedIn v2 profile endpoint (basic fields)
  const profileRes = await fetch(
    'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,headline,vanityName,profilePicture(displayImage~:playableStreams))',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  let profile: Record<string, unknown> = {};
  if (profileRes.ok) {
    profile = await profileRes.json();
  }

  // Extract profile picture URL (highest resolution)
  let profilePictureUrl: string | undefined;
  const streams = (profile as any)?.profilePicture?.['displayImage~']?.elements;
  if (Array.isArray(streams) && streams.length > 0) {
    const largest = streams[streams.length - 1];
    profilePictureUrl = largest?.identifiers?.[0]?.identifier;
  }
  // Fallback to OIDC picture
  if (!profilePictureUrl && userInfo.picture) profilePictureUrl = userInfo.picture;

  const firstName = (profile as any)?.firstName?.localized
    ? Object.values((profile as any).firstName.localized)[0] as string
    : userInfo.given_name;

  const lastName = (profile as any)?.lastName?.localized
    ? Object.values((profile as any).lastName.localized)[0] as string
    : userInfo.family_name;

  return {
    id:               userInfo.sub ?? (profile as any).id,
    firstName,
    lastName,
    headline:         (profile as any).headline ?? undefined,
    vanityName:       (profile as any).vanityName ?? undefined,
    profilePictureUrl,
  };
}

// ── SerpAPI age check ────────────────────────────────────────────────────────

async function checkAgeViaSerpApi(vanityName: string, apiKey: string): Promise<SerpAgeResult> {
  const query = encodeURIComponent(`site:linkedin.com/in/${vanityName}`);
  const url = `https://serpapi.com/search.json?engine=google&q=${query}&api_key=${apiKey}&num=1`;

  const res = await fetch(url);
  if (!res.ok) return { isYoung: false, confirmed: false };

  const data = await res.json() as {
    organic_results?: Array<{ cached_page_link?: string; snippet?: string; date?: string }>;
  };

  const top = data.organic_results?.[0];
  if (!top) return { isYoung: false, confirmed: false };

  // Google often shows a date for LinkedIn pages ("Jan 15, 2022 –  ...")
  const rawDate = top.date ?? top.snippet?.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/)?.[0];
  if (!rawDate) return { isYoung: false, confirmed: false };

  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) return { isYoung: false, confirmed: false };

  const isYoung = Date.now() - parsed.getTime() < ONE_YEAR_MS;
  return { isYoung, confirmed: true, cacheDate: parsed.toISOString() };
}

// ── Profile maturity heuristics (fallback) ───────────────────────────────────

function scoreProfileMaturity(p: LinkedInProfile): MaturitySignals {
  let score = 0;
  const reasons: string[] = [];

  if (p.profilePictureUrl) {
    score += 25;
  } else {
    reasons.push('no profile picture');
  }

  if (p.headline && p.headline.trim().length > 5) {
    score += 20;
  } else {
    reasons.push('no headline');
  }

  if (p.vanityName && !/^[a-z]+-[a-z]+-\w{8,}$/i.test(p.vanityName)) {
    // Custom vanity URL (not the auto-generated "firstname-lastname-randomhash" format)
    score += 30;
  } else {
    reasons.push('appears to be auto-generated vanity URL');
  }

  if (p.firstName && p.lastName) {
    score += 10;
  }

  // LinkedIn doesn't return connection count in v2 OIDC, but if we got it
  if (p.numConnections && p.numConnections >= 10) {
    score += 15;
  }

  return { score: Math.min(score, 100), reasons };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}
