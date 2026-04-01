import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidZipCode } from "@/features/zip-explorer/validators";

export const useZipSearch = (initialZip = "") => {
  const [zipInput, setZipInput] = useState(initialZip);
  const navigate = useNavigate();

  const submitZip = useCallback(() => {
    const sanitized = zipInput.trim();
    if (!isValidZipCode(sanitized)) return false;
    navigate(`/zip/${sanitized}`);
    return true;
  }, [zipInput, navigate]);

  return { zipInput, setZipInput, submitZip, isValid: isValidZipCode(zipInput) };
};
