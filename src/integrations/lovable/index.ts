// Lovable cloud-auth replaced with direct Supabase OAuth.
// This file is kept for backwards compatibility but no longer uses @lovable.dev/cloud-auth-js.
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri ?? window.location.origin + "/auth/callback",
          queryParams: opts?.extraParams,
        },
      });
      if (error) return { error };
      // Browser navigates away; signal caller
      return { redirected: true };
    },
  },
};
