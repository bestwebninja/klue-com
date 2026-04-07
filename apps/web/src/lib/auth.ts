import { supabase } from "./supabase";

const STORAGE_KEY = "kluje_auth";

export type AuthRole = "admin" | "user";

export type AuthSession = {
  token: string;
  refreshToken: string;
  role: AuthRole;
  email: string;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  type: "access" | "refresh";
  exp: number;
  iss: string;
  aud: string;
};

const base64UrlToUtf8 = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
};

export const decodeTokenPayload = (token: string): TokenPayload | null => {
  const [body] = token.split(".");
  if (!body) return null;

  try {
    return JSON.parse(base64UrlToUtf8(body)) as TokenPayload;
  } catch {
    return null;
  }
};

export const saveSession = (session: AuthSession) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  void supabase.auth.signOut();
};

export const getSession = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    const payload = decodeTokenPayload(parsed.token);

    // Check expiry only — Supabase JWTs don't have a custom `type` field
    if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
      clearSession();
      return null;
    }

    // Use stored role/email (Supabase JWT `role` is "authenticated", not the app role)
    return { ...parsed };
  } catch {
    clearSession();
    return null;
  }
};

export const isAdminSession = (session: AuthSession | null) => {
  if (!session) return false;
  return session.role === "admin";
};

/**
 * Call once at app startup. Supabase will silently refresh the access token
 * before it expires; we sync the new token back into our session storage so
 * the app never sees an expired token.
 */
export const initSessionAutoRefresh = (onSessionChange: (session: AuthSession | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supabaseSession) => {
    if (supabaseSession && (event === "TOKEN_REFRESHED" || event === "SIGNED_IN")) {
      const stored = getSession();
      if (stored) {
        const updated: AuthSession = {
          ...stored,
          token: supabaseSession.access_token,
          refreshToken: supabaseSession.refresh_token
        };
        saveSession(updated);
        onSessionChange(updated);
      }
    } else if (event === "SIGNED_OUT") {
      localStorage.removeItem(STORAGE_KEY);
      onSessionChange(null);
    }
  });

  return () => subscription.unsubscribe();
};
