export const ADMIN_ALLOWLIST_EMAILS = [
  'divitiae.terrae.llc@gmail.com',
  'marcus@kluje.com',
  'marcusmommsen@gmail.com',
] as const;

export const isAllowlistedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_ALLOWLIST_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_ALLOWLIST_EMAILS)[number]);
};
