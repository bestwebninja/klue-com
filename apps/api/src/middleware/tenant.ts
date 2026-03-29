import type { Request, Response, NextFunction } from "express";

export type TenantRequest = Request & { tenantId?: string };

export function tenantMiddleware(req: TenantRequest, _res: Response, next: NextFunction) {
  req.tenantId = req.header("x-tenant-id") ?? "default-tenant";
  next();
}
