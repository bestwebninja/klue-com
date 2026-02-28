import { z } from 'zod';

// US ZIP code regex pattern - matches 5-digit (12345) and ZIP+4 (12345-6789) formats
export const US_ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;

/**
 * Validates a US ZIP code format
 * @param zipCode - The ZIP code string to validate
 * @returns true if valid US ZIP code format, false otherwise
 */
export const isValidUSZipCode = (zipCode: string): boolean => {
  if (!zipCode || typeof zipCode !== 'string') return false;
  const cleaned = zipCode.trim();
  return US_ZIP_CODE_REGEX.test(cleaned);
};

/**
 * Formats a US ZIP code to standard format
 * @param zipCode - The ZIP code to format
 * @returns Formatted ZIP code or original string if invalid
 */
export const formatUSZipCode = (zipCode: string): string => {
  if (!zipCode) return '';
  return zipCode.trim();
};

/**
 * Zod schema for US ZIP code validation
 */
export const usZipCodeSchema = z.string()
  .trim()
  .min(1, "ZIP code is required")
  .max(10, "ZIP code is too long")
  .refine(
    (val) => US_ZIP_CODE_REGEX.test(val),
    { message: "Please enter a valid US ZIP code (e.g., 90210)" }
  )
  .transform(formatUSZipCode);

/**
 * Optional US ZIP code schema - allows empty string but validates if provided
 */
export const optionalUSZipCodeSchema = z.string()
  .trim()
  .refine(
    (val) => val === '' || US_ZIP_CODE_REGEX.test(val),
    { message: "Please enter a valid US ZIP code (e.g., 90210)" }
  )
  .transform((val) => val ? formatUSZipCode(val) : '');
