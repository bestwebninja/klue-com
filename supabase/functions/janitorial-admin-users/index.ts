import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonRecord = Record<string, unknown>;

type CreateUserPayload = {
  first_name?: string;
  surname?: string;
  email?: string;
  password?: string;
  company_id?: string | null;
  new_company_name?: string | null;
  role?: string;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  cell_number?: string | null;
  linkedin_url?: string | null;
};

const jsonResponse = (status: number, body: JsonRecord) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const errorResponse = (
  status: number,
  error: string,
  step: string,
  details?: unknown,
) =>
  jsonResponse(status, {
    error,
    step,
    details: details ? String(details) : null,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let body: JsonRecord = {};

  try {
    body = await req.json();
  } catch (parseError) {
    return errorResponse(400, "Invalid JSON payload", "parse_request", parseError);
  }

  const action = typeof body.action === "string" ? body.action : "";
  console.log("janitorial-admin-users: received action", action);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) {
    return errorResponse(500, "Missing SUPABASE_URL", "init_client");
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    return errorResponse(500, "Missing SUPABASE_SERVICE_ROLE_KEY", "init_client");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (action === "list") {
    const [{ data: users, error: usersError }, { data: companies, error: companiesError }] = await Promise.all([
      supabase
        .from("janitorial_user_profiles")
        .select("id, email, first_name, surname, role, company_id, city, state, zip_code, cell_number, linkedin_url, trial_expires_at, can_edit_pricing, can_edit_branding, is_frozen, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("janitorial_companies")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

    if (usersError) {
      return errorResponse(500, "Failed to load users", "list_users", usersError.message);
    }

    if (companiesError) {
      return errorResponse(500, "Failed to load companies", "list_companies", companiesError.message);
    }

    return jsonResponse(200, { users: users ?? [], companies: companies ?? [] });
  }

  if (action === "createUser") {
    const payload = body as CreateUserPayload;

    const firstName = payload.first_name?.trim() ?? "";
    const surname = payload.surname?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";
    const role = payload.role?.trim() ?? "";

    if (!firstName || !surname || !email || !password || !role) {
      return errorResponse(
        400,
        "Missing required fields: first_name, surname, email, password, role",
        "validate_payload",
      );
    }

    console.log("janitorial-admin-users: validated payload", {
      email,
      role,
      has_company_id: Boolean(payload.company_id),
      has_new_company_name: Boolean(payload.new_company_name),
    });

    const requestedCompanyId = payload.company_id === "__new__" ? null : payload.company_id ?? null;
    const newCompanyName = payload.new_company_name?.trim() || null;

    let companyId: string | null = requestedCompanyId;

    if (newCompanyName) {
      const { data: insertedCompany, error: companyInsertError } = await supabase
        .from("janitorial_companies")
        .insert({ name: newCompanyName })
        .select("id")
        .single();

      if (companyInsertError) {
        return errorResponse(500, "Failed to create company", "create_company", companyInsertError.message);
      }

      companyId = insertedCompany.id;
    } else if (companyId) {
      const { data: existingCompany, error: companyLookupError } = await supabase
        .from("janitorial_companies")
        .select("id")
        .eq("id", companyId)
        .maybeSingle();

      if (companyLookupError) {
        return errorResponse(400, "Invalid company_id", "resolve_company", companyLookupError.message);
      }

      if (!existingCompany) {
        return errorResponse(400, "Invalid company_id", "resolve_company", "Company not found");
      }
    }

    console.log("janitorial-admin-users: company resolved", { companyId });

    const { data: createdUserData, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        surname,
        role,
      },
    });

    if (createUserError) {
      const lowerMessage = createUserError.message.toLowerCase();
      const isDuplicateEmail = lowerMessage.includes("already") || lowerMessage.includes("exists") || createUserError.status === 422;
      if (isDuplicateEmail) {
        return errorResponse(409, "User already exists for this email", "create_auth_user", createUserError.message);
      }
      return errorResponse(500, "Failed to create auth user", "create_auth_user", createUserError.message);
    }

    const createdUserId = createdUserData.user?.id;
    if (!createdUserId) {
      return errorResponse(500, "Auth user was not returned", "create_auth_user");
    }

    console.log("janitorial-admin-users: auth user created", { userId: createdUserId });

    const trialExpiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();

    const { error: profileError } = await supabase
      .from("janitorial_user_profiles")
      .upsert({
        id: createdUserId,
        email,
        first_name: firstName,
        surname,
        role,
        company_id: companyId,
        city: payload.city ?? null,
        state: payload.state ?? null,
        zip_code: payload.zip_code ?? null,
        cell_number: payload.cell_number ?? null,
        linkedin_url: payload.linkedin_url ?? null,
        trial_expires_at: trialExpiresAt,
        is_frozen: false,
      });

    if (profileError) {
      return errorResponse(500, "Failed to upsert user profile", "upsert_profile", profileError.message);
    }

    console.log("janitorial-admin-users: profile upserted", { userId: createdUserId });
    console.log("janitorial-admin-users: success", { userId: createdUserId, email });

    return jsonResponse(200, {
      success: true,
      user_id: createdUserId,
      email,
      company_id: companyId,
      trial_expires_at: trialExpiresAt,
    });
  }

  if (action === "freeze" || action === "unfreeze") {
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    if (!userId) {
      return errorResponse(400, "Missing user_id", "validate_payload");
    }

    const { error } = await supabase
      .from("janitorial_user_profiles")
      .update({ is_frozen: action === "freeze" })
      .eq("id", userId);

    if (error) {
      return errorResponse(500, `Failed to ${action} user`, `${action}_user`, error.message);
    }

    return jsonResponse(200, { success: true, user_id: userId });
  }

  if (action === "deleteUser") {
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    if (!userId) {
      return errorResponse(400, "Missing user_id", "validate_payload");
    }

    const { error: profileDeleteError } = await supabase
      .from("janitorial_user_profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      return errorResponse(500, "Failed to delete user profile", "delete_profile", profileDeleteError.message);
    }

    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      return errorResponse(500, "Failed to delete auth user", "delete_auth_user", authDeleteError.message);
    }

    return jsonResponse(200, { success: true, user_id: userId });
  }

  if (action === "updatePermissions") {
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    if (!userId) {
      return errorResponse(400, "Missing user_id", "validate_payload");
    }

    const updates: JsonRecord = {};
    if (typeof body.can_edit_pricing === "boolean") {
      updates.can_edit_pricing = body.can_edit_pricing;
    }
    if (typeof body.can_edit_branding === "boolean") {
      updates.can_edit_branding = body.can_edit_branding;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(400, "No permission fields provided", "validate_payload");
    }

    const { error } = await supabase
      .from("janitorial_user_profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      return errorResponse(500, "Failed to update permissions", "update_permissions", error.message);
    }

    return jsonResponse(200, { success: true, user_id: userId });
  }

  return errorResponse(400, "Unknown action", "route_action", action);
});
