import { ZIP_REGEX } from "./constants";

export const isValidZipCode = (value?: string | null): value is string => {
  if (!value) return false;
  return ZIP_REGEX.test(value.trim());
};
