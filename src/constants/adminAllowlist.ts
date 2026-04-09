export const ADMIN_ALLOWLIST_EMAILS = [
  "divitiae.terrae.llc@gmail.com",
  "marcus@kluje.com",
  "marcusmommsen@gmail.com",
] as const;

export const isAllowlistedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_ALLOWLIST_EMAILS.includes(normalizedEmail as (typeof ADMIN_ALLOWLIST_EMAILS)[number]);
};
