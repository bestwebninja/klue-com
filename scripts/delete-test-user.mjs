#!/usr/bin/env node
/**
 * Delete adams@acmejanitorial.com from both janitorial_user_profiles
 * and Supabase Auth.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/delete-test-user.mjs
 *
 * Or set it in .env.local and run:
 *   node -r dotenv/config scripts/delete-test-user.mjs
 */

const SUPABASE_URL = "https://haymuibqhppidyfwdzjj.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL = "adams@acmejanitorial.com";

if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: Set SUPABASE_SERVICE_ROLE_KEY env var first.");
  process.exit(1);
}

const headers = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function findUserByEmail(email) {
  let page = 1;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`,
      { headers },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`listUsers failed: ${res.status} ${body}`);
    }
    const json = await res.json();
    const users = json.users ?? [];
    const found = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 200) return null;
    page++;
  }
}

async function deleteAuthUser(userId) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    { method: "DELETE", headers },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`deleteUser failed: ${res.status} ${body}`);
  }
}

async function deleteJanitorialProfile(userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/janitorial_user_profiles?id=eq.${userId}`,
    { method: "DELETE", headers: { ...headers, "Prefer": "return=minimal" } },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`deleteProfile failed: ${res.status} ${body}`);
  }
}

(async () => {
  console.log(`Looking up ${TARGET_EMAIL}...`);
  const user = await findUserByEmail(TARGET_EMAIL);

  if (!user) {
    console.log("User not found — nothing to delete.");
    return;
  }

  console.log(`Found Auth user: id=${user.id} email=${user.email}`);

  console.log("Deleting janitorial_user_profiles row...");
  await deleteJanitorialProfile(user.id);
  console.log("  Profile deleted (or was absent).");

  console.log("Deleting Auth user...");
  await deleteAuthUser(user.id);
  console.log("  Auth user deleted.");

  console.log(`\nDone. ${TARGET_EMAIL} has been fully removed. You can now recreate them via ADMIN-MANAGER.`);
})().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
