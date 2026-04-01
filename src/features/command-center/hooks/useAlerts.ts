import { useQuery } from "@tanstack/react-query";
import { alertService } from "../services/alertService";

export function useAlerts() { return useQuery({ queryKey: ["cc-alerts"], queryFn: alertService.list }); }
