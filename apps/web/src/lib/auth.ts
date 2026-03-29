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
};

export const getSession = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    const payload = decodeTokenPayload(parsed.token);

    if (!payload || payload.type !== "access" || payload.exp <= Math.floor(Date.now() / 1000)) {
      clearSession();
      return null;
    }

    return parsed;
  } catch {
    clearSession();
    return null;
  }
};

export const isAdminSession = (session: AuthSession | null) => session?.role === "admin";
