import { z } from "zod";

export const leadScopeSchema = z
  .object({
    summary: z.string().trim().min(5).max(2000),
    urgency: z.enum(["asap", "planned", "researching"]).optional(),
    deliverables: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
    preferredStartDate: z.string().trim().optional(),
    accessibilityNeeds: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  })
  .strict();

export const leadAttachmentSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    url: z.string().url(),
    mimeType: z.string().trim().min(1).max(120).optional(),
    sizeBytes: z.number().int().nonnegative().max(50_000_000).optional(),
  })
  .strict();

export const leadIntakeSchema = z
  .object({
    source: z.string().trim().min(1).max(120),
    contactName: z.string().trim().min(1).max(120),
    contactEmail: z.string().trim().email(),
    contactPhone: z.string().trim().min(6).max(40).optional(),
    location: z.string().trim().min(2).max(200),
    serviceCategory: z.string().trim().min(2).max(120),
    intentScore: z.number().min(0).max(100),
    budgetMin: z.number().nonnegative().optional(),
    budgetMax: z.number().nonnegative().optional(),
    timeline: z.enum(["urgent", "this_week", "this_month", "flexible"]).optional(),
    requirements: z.array(z.string().trim().min(1).max(500)).max(40).optional().default([]),
    scope: leadScopeSchema.optional(),
    attachments: z.array(leadAttachmentSchema).max(20).optional().default([]),
    priorityTier: z.enum(["high", "medium", "low"]).default("medium"),
  })
  .superRefine((value, ctx) => {
    if (typeof value.budgetMin === "number" && typeof value.budgetMax === "number" && value.budgetMax < value.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMax"],
        message: "budgetMax must be greater than or equal to budgetMin",
      });
    }
  });

export type LeadIntakeInput = z.infer<typeof leadIntakeSchema>;
