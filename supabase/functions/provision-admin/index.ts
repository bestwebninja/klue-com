import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ADMIN_EMAILS = [
  "divitiae.terrae.llc@gmail.com",
  "marcus@kluje.com",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalised = email.trim().toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.includes(normalised)) {
      return new Response(JSON.stringify({ error: "Email not in admin allowlist" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalised
    );

    let userId: string;

    if (existing) {
      // Update password for existing user
      const { error: updateErr } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password, email_confirm: true }
      );
      if (updateErr) throw updateErr;
      userId = existing.id;
    } else {
      // Create user
      const { data: newUser, error: createErr } =
        await supabase.auth.admin.createUser({
          email: normalised,
          password,
          email_confirm: true,
          user_metadata: { full_name: full_name || "Admin" },
        });
      if (createErr) throw createErr;
      userId = newUser.user.id;
    }

    // Ensure admin role
    const { error: roleErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({
        ok: true,
        message: existing
          ? "Password updated and admin role confirmed"
          : "Admin account created with admin role",
        userId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});