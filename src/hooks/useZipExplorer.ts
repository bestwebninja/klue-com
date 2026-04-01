import { useQuery } from "@tanstack/react-query";
import { fetchZipProfileViaProxy } from "@/features/zip-explorer/api";

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export const useZipExplorer = (zip: string) =>
  useQuery({
    queryKey: ["zip-explorer", zip],
    queryFn: () => fetchZipProfileViaProxy(zip),
    enabled: Boolean(zip),
    staleTime: THIRTY_DAYS_MS,
  });
