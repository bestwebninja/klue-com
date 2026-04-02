import { expertStore, type ExpertQuestionStatus, type ModerationActionType, type ModerationTargetType, type UnsafeAdviceState } from "./expert-store";

const resolveQuestionStatusAfterModeration = (
  targetType: ModerationTargetType,
  actionType: ModerationActionType
): ExpertQuestionStatus | null => {
  if (targetType !== "question") return null;
  if (actionType === "reject") return "closed";
  if (actionType === "flag" || actionType === "escalate") return "moderation_hold";
  if (actionType === "approve" || actionType === "request_changes") return "open";
  return null;
};

export const createExpertQuestion = async (input: {
  tenantId: string;
  askedByUserId: string;
  title: string;
  body: string;
  category: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}) => {
  const now = new Date().toISOString();
  const question = {
    id: expertStore.newId(),
    tenantId: input.tenantId,
    askedByUserId: input.askedByUserId,
    title: input.title,
    body: input.body,
    category: input.category,
    tags: input.tags ?? [],
    status: "open" as const,
    unsafeAdviceState: "none" as const,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now
  };

  await expertStore.saveQuestion(question);
  return question;
};

export const listExpertQuestions = (tenantId: string, status?: ExpertQuestionStatus) =>
  expertStore.listQuestions(tenantId, status).map((question) => ({
    ...question,
    answers: expertStore.listAnswers(question.id),
    assignments: expertStore.listAssignments(question.id)
  }));

export const assignExpertToQuestion = async (input: {
  tenantId: string;
  questionId: string;
  expertUserId: string;
  assignedByUserId: string;
  reason?: string;
}) => {
  const question = expertStore.getQuestion(input.questionId);
  if (!question || question.tenantId !== input.tenantId) return null;

  const now = new Date().toISOString();
  const assignment = {
    id: expertStore.newId(),
    tenantId: input.tenantId,
    questionId: input.questionId,
    expertUserId: input.expertUserId,
    assignedByUserId: input.assignedByUserId,
    status: "pending" as const,
    reason: input.reason ?? null,
    createdAt: now,
    updatedAt: now
  };

  await expertStore.appendAssignment(assignment);
  await expertStore.updateQuestion(input.questionId, { status: "assigned" });
  return assignment;
};

export const postExpertAnswer = async (input: {
  tenantId: string;
  questionId: string;
  expertUserId: string;
  body: string;
  citations?: string[];
  unsafeAdviceState?: UnsafeAdviceState;
  metadata?: Record<string, unknown>;
}) => {
  const question = expertStore.getQuestion(input.questionId);
  if (!question || question.tenantId !== input.tenantId) return null;

  const now = new Date().toISOString();
  const answer = {
    id: expertStore.newId(),
    tenantId: input.tenantId,
    questionId: input.questionId,
    expertUserId: input.expertUserId,
    body: input.body,
    citations: input.citations ?? [],
    unsafeAdviceState: input.unsafeAdviceState ?? "none",
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now
  };

  await expertStore.appendAnswer(answer);
  await expertStore.updateQuestion(input.questionId, {
    status: answer.unsafeAdviceState === "confirmed" ? "moderation_hold" : "answered",
    unsafeAdviceState: answer.unsafeAdviceState
  });

  return answer;
};

export const createModerationAction = async (input: {
  tenantId: string;
  targetType: ModerationTargetType;
  targetId: string;
  actionType: ModerationActionType;
  unsafeAdviceState: UnsafeAdviceState;
  reason?: string;
  metadata?: Record<string, unknown>;
  reviewedByUserId: string;
}) => {
  const action = {
    id: expertStore.newId(),
    tenantId: input.tenantId,
    targetType: input.targetType,
    targetId: input.targetId,
    actionType: input.actionType,
    unsafeAdviceState: input.unsafeAdviceState,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
    reviewedByUserId: input.reviewedByUserId,
    createdAt: new Date().toISOString()
  };

  await expertStore.appendModerationAction(action);

  if (input.targetType === "question") {
    const question = expertStore.getQuestion(input.targetId);
    if (question && question.tenantId === input.tenantId) {
      const nextStatus = resolveQuestionStatusAfterModeration(input.targetType, input.actionType);
      await expertStore.updateQuestion(input.targetId, {
        unsafeAdviceState: input.unsafeAdviceState,
        ...(nextStatus ? { status: nextStatus } : {})
      });
    }
  }


  return action;
};
