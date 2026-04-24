import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonRecord = Record<string, unknown>;

type CreateOrUpdatePayload = {
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
  can_edit_pricing?: boolean;
  can_edit_branding?: boolean;
  trial_days?: number;
  trial_expires_at?: string | null;
  is_frozen?: boolean;
  user_id?: string;
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

const normalizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getTableColumns = async (supabase: ReturnType<typeof createClient>, tableName: string) => {
  const { data, error } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_schema", "public")
    .eq("table_name", tableName);

  if (error) {
    return { columns: new Set<string>(), error };
  }

  return {
    columns: new Set((data ?? []).map((row) => String((row as { column_name: string }).column_name))),
    error: null,
  };
};

const resolveCompany = async (
  supabase: ReturnType<typeof createClient>,
  payload: CreateOrUpdatePayload,
): Promise<{ companyId: string | null; companyName: string | null; error?: ReturnType<typeof errorResponse> }> => {
  const requestedCompanyId = payload.company_id === "__new__" ? null : payload.company_id ?? null;
  const newCompanyName = payload.new_company_name?.trim() || null;

  let companyId: string | null = requestedCompanyId;
  let companyName: string | null = null;

  if (newCompanyName) {
    const { data: existingCompany, error: existingCompanyError } = await supabase
      .from("janitorial_companies")
      .select("id, name")
      .ilike("name", newCompanyName)
      .maybeSingle();

    if (existingCompanyError) {
      return { companyId: null, companyName: null, error: errorResponse(500, "Failed to resolve company", "resolve_company", existingCompanyError.message) };
    }

    if (existingCompany) {
      companyId = existingCompany.id;
      companyName = existingCompany.name;
    } else {
      const { data: insertedCompany, error: companyInsertError } = await supabase
        .from("janitorial_companies")
        .insert({ name: newCompanyName })
        .select("id, name")
        .single();

      if (companyInsertError) {
        return { companyId: null, companyName: null, error: errorResponse(500, "Failed to create company", "create_company", companyInsertError.message) };
      }

      companyId = insertedCompany.id;
      companyName = insertedCompany.name;
    }
  } else if (companyId) {
    const { data: existingCompany, error: companyLookupError } = await supabase
      .from("janitorial_companies")
      .select("id, name")
      .eq("id", companyId)
      .maybeSingle();

    if (companyLookupError) {
      return { companyId: null, companyName: null, error: errorResponse(400, "Invalid company_id", "resolve_company", companyLookupError.message) };
    }

    if (!existingCompany) {
      return { companyId: null, companyName: null, error: errorResponse(400, "Invalid company_id", "resolve_company", "Company not found") };
    }

    companyName = existingCompany.name;
  }

  return { companyId, companyName };
};

const findAuthUserByEmail = async (supabase: ReturnType<typeof createClient>, email: string) => {
  const perPage = 200;
  const maxPages = 50;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return { user: null, error };
    }

    const users = data?.users ?? [];
    const found = users.find((user) => user.email?.trim().toLowerCase() === email) ?? null;
    if (found) {
      return { user: found, error: null };
    }

    if (users.length < perPage) {
      break;
    }
  }

  return { user: null, error: null };
};

const getAuthUsersByIds = async (supabase: ReturnType<typeof createClient>, ids: string[]) => {
  const pendingIds = new Set(ids);
  const usersById = new Map<string, { id: string; email: string | null; created_at: string | null; last_sign_in_at: string | null; is_banned: boolean }>();
  const perPage = 200;
  const maxPages = 50;

  for (let page = 1; page <= maxPages && pendingIds.size > 0; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return { usersById, error };
    }

    const users = data?.users ?? [];
    for (const user of users) {
      if (pendingIds.has(user.id)) {
        pendingIds.delete(user.id);
        usersById.set(user.id, {
          id: user.id,
          email: user.email ?? null,
          created_at: user.created_at ?? null,
          last_sign_in_at: user.last_sign_in_at ?? null,
          is_banned: !!user.banned_until,
        });
      }
    }

    if (users.length < perPage) {
      break;
    }
  }

  return { usersById, error: null };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
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
        .select("id, email, first_name, surname, role, company_id, company_name, city, state, zip_code, cell_number, linkedin_url, trial_expires_at, can_edit_pricing, can_edit_branding, is_frozen, created_at")
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

    const userRows = users ?? [];
    const { usersById, error: authUsersError } = await getAuthUsersByIds(supabase, userRows.map((row) => row.id));
    if (authUsersError) {
      return errorResponse(500, "Failed to load auth users", "list_auth_users", authUsersError.message);
    }

    const companyNameById = new Map((companies ?? []).map((company) => [company.id, company.name]));
    const hydratedUsers = userRows.map((user) => ({
      ...user,
      company_name: user.company_name ?? (user.company_id ? companyNameById.get(user.company_id) ?? null : null),
      auth_user: usersById.get(user.id) ?? null,
    }));

    return jsonResponse(200, { users: hydratedUsers, companies: companies ?? [] });
  }

  if (action === "findExistingUserByEmail") {
    const email = normalizeEmail(body.email);
    if (!email) {
      return errorResponse(400, "Missing email", "validate_payload");
    }

    const [{ user: authUser, error: authLookupError }, { data: janitorialProfile, error: profileError }] = await Promise.all([
      findAuthUserByEmail(supabase, email),
      supabase
        .from("janitorial_user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle(),
    ]);

    if (authLookupError) {
      return errorResponse(500, "Failed to find auth user by email", "find_auth_user", authLookupError.message);
    }

    if (profileError) {
      return errorResponse(500, "Failed to find janitorial profile by email", "find_janitorial_profile", profileError.message);
    }

    return jsonResponse(200, {
      found: !!authUser,
      auth_user: authUser
        ? {
          id: authUser.id,
          email: authUser.email ?? email,
          created_at: authUser.created_at,
        }
        : null,
      janitorial_profile: janitorialProfile ?? null,
      can_allocate_trial: !!authUser,
    });
  }

  if (action === "createUser") {
    const payload = body as CreateOrUpdatePayload;

    const firstName = payload.first_name?.trim() ?? "";
    const surname = payload.surname?.trim() ?? "";
    const email = normalizeEmail(payload.email);
    const password = payload.password ?? "";
    const role = payload.role?.trim() ?? "";

    if (!firstName || !surname || !email || !password || !role) {
      return errorResponse(
        400,
        "Missing required fields: first_name, surname, email, password, role",
        "validate_payload",
      );
    }

    const companyResolution = await resolveCompany(supabase, payload);
    if (companyResolution.error) {
      return companyResolution.error;
    }
    const { companyId, companyName } = companyResolution;

    const fullName = `${firstName} ${surname}`.trim();
    const { data: createdUserData, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        janitorial_trial: true,
        first_name: firstName,
        surname,
        full_name: fullName,
        role,
        company_id: companyId,
        company_name: companyName,
      },
    });

    if (createUserError) {
      const lowerMessage = createUserError.message.toLowerCase();
      const isDuplicateEmail = lowerMessage.includes("already") || lowerMessage.includes("exists") || createUserError.status === 422 || createUserError.status === 409;
      if (isDuplicateEmail) {
        return jsonResponse(409, {
          error: "A user with this email already exists",
          step: "create_auth_user",
          details: createUserError.message,
          code: "AUTH_USER_EXISTS",
          existing_email: email,
          suggested_action: "allocateTrialToExistingUser",
        });
      }
      return errorResponse(500, "Failed to create auth user", "create_auth_user", createUserError.message);
    }

    const createdUserId = createdUserData.user?.id;
    if (!createdUserId) {
      return errorResponse(500, "Auth user was not returned", "create_auth_user");
    }

    const trialDays = typeof payload.trial_days === "number" && Number.isFinite(payload.trial_days) && payload.trial_days > 0
      ? Math.floor(payload.trial_days)
      : 7;
    const trialExpiresAt = new Date(Date.now() + (trialDays * 24 * 60 * 60 * 1000)).toISOString();

    const { columns, error: columnsError } = await getTableColumns(supabase, "janitorial_user_profiles");
    if (columnsError) {
      return errorResponse(500, "Failed to inspect profile schema", "inspect_profile_schema", columnsError.message);
    }

    const profileUpsert: JsonRecord = {
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
      can_edit_pricing: payload.can_edit_pricing ?? false,
      can_edit_branding: payload.can_edit_branding ?? false,
      is_frozen: false,
    };

    if (columns.has("company_name")) {
      profileUpsert.company_name = companyName;
    }

    for (const key of Object.keys(profileUpsert)) {
      if (!columns.has(key)) {
        delete profileUpsert[key];
      }
    }

    const { error: profileError } = await supabase
      .from("janitorial_user_profiles")
      .upsert(profileUpsert);

    if (profileError) {
      return errorResponse(500, "Failed to upsert user profile", "upsert_profile", profileError.message);
    }

    return jsonResponse(200, {
      success: true,
      user_id: createdUserId,
      email,
      company_id: companyId,
      company_name: companyName,
      trial_expires_at: trialExpiresAt,
    });
  }

  if (action === "allocateTrialToExistingUser") {
    const payload = body as CreateOrUpdatePayload;
    const email = normalizeEmail(payload.email);

    if (!email) {
      return errorResponse(400, "Missing email", "validate_payload");
    }

    const { user: authUser, error: authLookupError } = await findAuthUserByEmail(supabase, email);
    if (authLookupError) {
      return errorResponse(500, "Failed to find existing auth user", "find_auth_user", authLookupError.message);
    }

    if (!authUser) {
      return errorResponse(404, "No existing auth user found for this email", "find_auth_user");
    }

    const firstName = payload.first_name?.trim() ?? "";
    const surname = payload.surname?.trim() ?? "";
    const role = payload.role?.trim() ?? "janitorial_owner";
    const trialDays = typeof payload.trial_days === "number" && Number.isFinite(payload.trial_days) && payload.trial_days > 0
      ? Math.floor(payload.trial_days)
      : 7;
    const trialExpiresAt = new Date(Date.now() + (trialDays * 24 * 60 * 60 * 1000)).toISOString();

    const companyResolution = await resolveCompany(supabase, payload);
    if (companyResolution.error) {
      return companyResolution.error;
    }
    const { companyId, companyName } = companyResolution;

    const { columns, error: columnsError } = await getTableColumns(supabase, "janitorial_user_profiles");
    if (columnsError) {
      return errorResponse(500, "Failed to inspect profile schema", "inspect_profile_schema", columnsError.message);
    }

    const profileUpsert: JsonRecord = {
      id: authUser.id,
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
      can_edit_pricing: payload.can_edit_pricing ?? false,
      can_edit_branding: payload.can_edit_branding ?? false,
      is_frozen: false,
    };

    if (columns.has("company_name")) {
      profileUpsert.company_name = companyName;
    }

    for (const key of Object.keys(profileUpsert)) {
      if (!columns.has(key)) {
        delete profileUpsert[key];
      }
    }

    const { error: profileError } = await supabase
      .from("janitorial_user_profiles")
      .upsert(profileUpsert, { onConflict: "id" });

    if (profileError) {
      return errorResponse(500, "Failed to upsert user profile", "upsert_profile", profileError.message);
    }

    const fullName = `${firstName} ${surname}`.trim();
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...(authUser.user_metadata ?? {}),
        janitorial_trial: true,
        role,
        first_name: firstName,
        surname,
        full_name: fullName,
        company_id: companyId,
        company_name: companyName,
      },
    });

    if (authUpdateError) {
      return errorResponse(500, "Failed to update auth user metadata", "update_auth_user", authUpdateError.message);
    }

    return jsonResponse(200, {
      success: true,
      adopted_existing_user: true,
      user_id: authUser.id,
      email,
      trial_expires_at: trialExpiresAt,
    });
  }

  if (action === "updateUserProfile") {
    const payload = body as CreateOrUpdatePayload;
    const userId = payload.user_id?.trim() ?? "";

    if (!userId) {
      return errorResponse(400, "Missing user_id", "validate_payload");
    }

    const companyResolution = await resolveCompany(supabase, payload);
    if (companyResolution.error) {
      return companyResolution.error;
    }
    const { companyId, companyName } = companyResolution;

    const { columns, error: columnsError } = await getTableColumns(supabase, "janitorial_user_profiles");
    if (columnsError) {
      return errorResponse(500, "Failed to inspect profile schema", "inspect_profile_schema", columnsError.message);
    }

    const updates: JsonRecord = {};
    if (typeof payload.first_name === "string") updates.first_name = payload.first_name.trim();
    if (typeof payload.surname === "string") updates.surname = payload.surname.trim();
    if (typeof payload.email === "string") updates.email = normalizeEmail(payload.email);
    if (typeof payload.role === "string") updates.role = payload.role.trim();
    if (payload.city !== undefined) updates.city = payload.city;
    if (payload.state !== undefined) updates.state = payload.state;
    if (payload.zip_code !== undefined) updates.zip_code = payload.zip_code;
    if (payload.cell_number !== undefined) updates.cell_number = payload.cell_number;
    if (payload.linkedin_url !== undefined) updates.linkedin_url = payload.linkedin_url;
    if (typeof payload.can_edit_pricing === "boolean") updates.can_edit_pricing = payload.can_edit_pricing;
    if (typeof payload.can_edit_branding === "boolean") updates.can_edit_branding = payload.can_edit_branding;
    if (typeof payload.is_frozen === "boolean") updates.is_frozen = payload.is_frozen;
    if (payload.trial_expires_at !== undefined) updates.trial_expires_at = payload.trial_expires_at;

    updates.company_id = companyId;
    if (columns.has("company_name")) {
      updates.company_name = companyName;
    }

    for (const key of Object.keys(updates)) {
      if (!columns.has(key)) {
        delete updates[key];
      }
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("janitorial_user_profiles")
      .update(updates)
      .eq("id", userId)
      .select("*")
      .maybeSingle();

    if (updateError) {
      return errorResponse(500, "Failed to update janitorial user profile", "update_profile", updateError.message);
    }

    if (!updatedProfile) {
      return errorResponse(404, "Janitorial user profile not found", "update_profile");
    }

    const metadata = {
      janitorial_trial: true,
      role: typeof updates.role === "string" ? updates.role : updatedProfile.role,
      first_name: typeof updates.first_name === "string" ? updates.first_name : updatedProfile.first_name,
      surname: typeof updates.surname === "string" ? updates.surname : updatedProfile.surname,
      full_name: `${typeof updates.first_name === "string" ? updates.first_name : updatedProfile.first_name ?? ""} ${typeof updates.surname === "string" ? updates.surname : updatedProfile.surname ?? ""}`.trim(),
      company_id: companyId,
      company_name: companyName,
    };

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
      email: typeof updates.email === "string" && updates.email ? updates.email : undefined,
      user_metadata: metadata,
    });

    if (authUpdateError) {
      return errorResponse(500, "Failed to update auth user metadata", "update_auth_user", authUpdateError.message);
    }

    return jsonResponse(200, {
      success: true,
      user_id: userId,
      profile: updatedProfile,
    });
  }

  if (action === "removeJanitorialAccess") {
    const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
    if (!userId) {
      return errorResponse(400, "Missing user_id", "validate_payload");
    }

    const { error: profileDeleteError } = await supabase
      .from("janitorial_user_profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      return errorResponse(500, "Failed to remove janitorial access", "delete_janitorial_profile", profileDeleteError.message);
    }

    return jsonResponse(200, { success: true, user_id: userId, removed_janitorial_access: true, deleted_auth_user: false });
  }

  if (action === "deleteUserEverywhere" || action === "deleteUser") {
    const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
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

    return jsonResponse(200, {
      success: true,
      user_id: userId,
      deleted_janitorial_profile: true,
      deleted_auth_user: true,
      action_alias_used: action === "deleteUser",
      action,
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
