import { ZIP_REGEX } from "./constants";

export const isValidZipCode = (value?: string | null): value is string => {
  if (!value) return false;
  return ZIP_REGEX.test(value.trim());
};

export const sanitizeZipInput = (value: string) => value.replace(/\D/g, "").slice(0, 5);
