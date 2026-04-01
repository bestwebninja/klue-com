import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidZipCode, sanitizeZipInput } from "@/features/zip-explorer/validators";

export const useZipSearch = (initialZip = "") => {
  const [zipInput, setZipInputRaw] = useState(initialZip);
  const navigate = useNavigate();

  const setZipInput = useCallback((value: string) => {
    setZipInputRaw(sanitizeZipInput(value));
  }, []);

  const submitZip = useCallback(() => {
    const sanitized = zipInput.trim();
    if (!isValidZipCode(sanitized)) return false;
    navigate(`/zip/${sanitized}`);
    return true;
  }, [zipInput, navigate]);

  return { zipInput, setZipInput, submitZip, isValid: isValidZipCode(zipInput) };
};
