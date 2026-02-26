import { z } from 'zod';

// UK postcode regex pattern - matches formats like SW1A 1AA, M1 1AE, B33 8TH, etc.
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i;

/**
 * Validates a UK postcode format
 * @param postcode - The postcode string to validate
 * @returns true if valid UK postcode format, false otherwise
 */
export const isValidUKPostcode = (postcode: string): boolean => {
  if (!postcode || typeof postcode !== 'string') return false;
  const cleaned = postcode.trim().toUpperCase();
  return UK_POSTCODE_REGEX.test(cleaned);
};

/**
 * Formats a UK postcode to standard format (uppercase with space)
 * @param postcode - The postcode to format
 * @returns Formatted postcode or original string if invalid
 */
export const formatUKPostcode = (postcode: string): string => {
  if (!postcode) return '';
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Insert space before the last 3 characters (inward code)
  if (cleaned.length >= 5 && cleaned.length <= 7) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  }
  return cleaned;
};

/**
 * Zod schema for UK postcode validation
 */
export const ukPostcodeSchema = z.string()
  .trim()
  .min(1, "Postcode is required")
  .max(10, "Postcode is too long")
  .refine(
    (val) => UK_POSTCODE_REGEX.test(val),
    { message: "Please enter a valid UK postcode (e.g., SW1A 1AA)" }
  )
  .transform(formatUKPostcode);

/**
 * Optional UK postcode schema - allows empty string but validates if provided
 */
export const optionalUKPostcodeSchema = z.string()
  .trim()
  .refine(
    (val) => val === '' || UK_POSTCODE_REGEX.test(val),
    { message: "Please enter a valid UK postcode (e.g., SW1A 1AA)" }
  )
  .transform((val) => val ? formatUKPostcode(val) : '');
