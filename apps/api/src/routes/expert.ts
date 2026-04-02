import { Router } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth";
import type { TenantRequest } from "../middleware/tenant";
import {
  assignExpertToQuestion,
  createExpertQuestion,
  createModerationAction,
  listExpertQuestions,
  postExpertAnswer
} from "../services/expert-service";
import {
  expertQuestionStatuses,
  moderationActionTypes,
  moderationTargetTypes,
  unsafeAdviceStates
} from "../services/expert-store";

const router = Router();

const createQuestionSchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(10).max(10_000),
  category: z.string().trim().min(2).max(120),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  metadata: z.record(z.unknown()).optional(),
  assignToExpertUserId: z.string().uuid().optional(),
  assignmentReason: z.string().trim().min(3).max(300).optional()
});

router.post("/questions", async (req, res, next) => {
  try {
    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const tenantId = (req as TenantRequest).tenantId ?? "default-tenant";
    const askedByUserId = (req as AuthRequest).user?.sub ?? "system";

    const question = await createExpertQuestion({
      tenantId,
      askedByUserId,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      tags: parsed.data.tags,
      metadata: parsed.data.metadata
    });

    let assignment = null;
    if (parsed.data.assignToExpertUserId) {
      assignment = await assignExpertToQuestion({
        tenantId,
        questionId: question.id,
        expertUserId: parsed.data.assignToExpertUserId,
        assignedByUserId: askedByUserId,
        reason: parsed.data.assignmentReason
      });
    }

    return res.status(201).json({ data: { question, assignment } });
  } catch (error) {
    return next(error);
  }
});

const listQuestionsQuerySchema = z.object({
  status: z.enum(expertQuestionStatuses).optional()
});

router.get("/questions", (req, res) => {
  const parsed = listQuestionsQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const tenantId = (req as TenantRequest).tenantId ?? "default-tenant";
  const data = listExpertQuestions(tenantId, parsed.data.status);
  return res.status(200).json({ data });
});

const postAnswerSchema = z.object({
  body: z.string().trim().min(10).max(10_000),
  citations: z.array(z.string().trim().url()).max(20).optional(),
  unsafeAdviceState: z.enum(unsafeAdviceStates).optional(),
  metadata: z.record(z.unknown()).optional()
});

router.post("/questions/:questionId/answers", async (req, res, next) => {
  try {
    const params = z.object({ questionId: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid question id" });

    const parsed = postAnswerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const tenantId = (req as TenantRequest).tenantId ?? "default-tenant";
    const expertUserId = (req as AuthRequest).user?.sub ?? "system";

    const answer = await postExpertAnswer({
      tenantId,
      questionId: params.data.questionId,
      expertUserId,
      body: parsed.data.body,
      citations: parsed.data.citations,
      unsafeAdviceState: parsed.data.unsafeAdviceState,
      metadata: parsed.data.metadata
    });

    if (!answer) return res.status(404).json({ error: "Question not found" });
    return res.status(201).json({ data: answer });
  } catch (error) {
    return next(error);
  }
});

const moderationReviewSchema = z.object({
  targetType: z.enum(moderationTargetTypes),
  targetId: z.string().uuid(),
  actionType: z.enum(moderationActionTypes),
  unsafeAdviceState: z.enum(unsafeAdviceStates),
  reason: z.string().trim().min(3).max(500).optional(),
  metadata: z.record(z.unknown()).optional()
});

router.post("/moderation/review", async (req, res, next) => {
  try {
    const parsed = moderationReviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const tenantId = (req as TenantRequest).tenantId ?? "default-tenant";
    const reviewedByUserId = (req as AuthRequest).user?.sub ?? "system";

    const action = await createModerationAction({
      tenantId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      actionType: parsed.data.actionType,
      unsafeAdviceState: parsed.data.unsafeAdviceState,
      reason: parsed.data.reason,
      metadata: parsed.data.metadata,
      reviewedByUserId
    });

    return res.status(201).json({ data: action });
  } catch (error) {
    return next(error);
  }
});

export default router;
