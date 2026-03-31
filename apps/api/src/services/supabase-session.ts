import type { Request } from "express";
import { hasSupabaseAdmin, supabaseAdmin } from "./supabase-admin";

export const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
};

export const resolveSupabaseUser = async (req: Request) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return { user: null, error: "SUPABASE_ADMIN_MISSING" as const };

  const token = getBearerToken(req);
  if (!token) return { user: null, error: "AUTH_TOKEN_MISSING" as const };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { user: null, error: "INVALID_TOKEN" as const };

  return { user: data.user, error: null };
};
