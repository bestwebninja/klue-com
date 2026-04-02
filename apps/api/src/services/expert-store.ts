import { randomUUID } from "node:crypto";
import { hasSupabaseAdmin, supabaseAdmin } from "./supabase-admin";

export const expertQuestionStatuses = ["open", "assigned", "answered", "closed", "moderation_hold"] as const;
export type ExpertQuestionStatus = (typeof expertQuestionStatuses)[number];

export const expertAssignmentStatuses = ["pending", "accepted", "declined", "completed"] as const;
export type ExpertAssignmentStatus = (typeof expertAssignmentStatuses)[number];

export const moderationActionTypes = ["approve", "reject", "flag", "escalate", "request_changes"] as const;
export type ModerationActionType = (typeof moderationActionTypes)[number];

export const moderationTargetTypes = ["question", "answer"] as const;
export type ModerationTargetType = (typeof moderationTargetTypes)[number];

export const unsafeAdviceStates = ["none", "suspected", "confirmed", "cleared"] as const;
export type UnsafeAdviceState = (typeof unsafeAdviceStates)[number];

type JsonRecord = Record<string, unknown>;

export type ExpertQuestionRecord = {
  id: string;
  tenantId: string;
  askedByUserId: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  status: ExpertQuestionStatus;
  unsafeAdviceState: UnsafeAdviceState;
  metadata: JsonRecord;
  createdAt: string;
  updatedAt: string;
};

export type ExpertAnswerRecord = {
  id: string;
  tenantId: string;
  questionId: string;
  expertUserId: string;
  body: string;
  citations: string[];
  unsafeAdviceState: UnsafeAdviceState;
  metadata: JsonRecord;
  createdAt: string;
  updatedAt: string;
};

export type ExpertAssignmentRecord = {
  id: string;
  tenantId: string;
  questionId: string;
  expertUserId: string;
  assignedByUserId: string;
  status: ExpertAssignmentStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ModerationActionRecord = {
  id: string;
  tenantId: string;
  targetType: ModerationTargetType;
  targetId: string;
  actionType: ModerationActionType;
  unsafeAdviceState: UnsafeAdviceState;
  reason: string | null;
  metadata: JsonRecord;
  reviewedByUserId: string;
  createdAt: string;
};

const questions = new Map<string, ExpertQuestionRecord>();
const answers = new Map<string, ExpertAnswerRecord[]>();
const assignments = new Map<string, ExpertAssignmentRecord[]>();
const moderationActions = new Map<string, ModerationActionRecord[]>();

const persistSupabase = async (table: string, payload: Record<string, unknown>) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).insert(payload);
  if (error) {
    console.warn(`[expert-store] failed to persist ${table}: ${error.message}`);
  }
};

const updateSupabase = async (
  table: string,
  values: Record<string, unknown>,
  whereColumn: string,
  whereValue: string
) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).update(values).eq(whereColumn, whereValue);
  if (error) {
    console.warn(`[expert-store] failed to update ${table}: ${error.message}`);
  }
};

export const expertStore = {
  newId() {
    return randomUUID();
  },

  async saveQuestion(question: ExpertQuestionRecord) {
    questions.set(question.id, question);

    await persistSupabase("expert_questions", {
      id: question.id,
      tenant_id: question.tenantId,
      asked_by_user_id: question.askedByUserId,
      title: question.title,
      body: question.body,
      category: question.category,
      tags: question.tags,
      status: question.status,
      unsafe_advice_state: question.unsafeAdviceState,
      metadata: question.metadata,
      created_at: question.createdAt,
      updated_at: question.updatedAt
    });
  },

  async updateQuestion(questionId: string, patch: Partial<ExpertQuestionRecord>) {
    const existing = questions.get(questionId);
    if (!existing) return null;

    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    questions.set(questionId, next);

    await updateSupabase(
      "expert_questions",
      {
        title: next.title,
        body: next.body,
        category: next.category,
        tags: next.tags,
        status: next.status,
        unsafe_advice_state: next.unsafeAdviceState,
        metadata: next.metadata,
        updated_at: next.updatedAt
      },
      "id",
      questionId
    );

    return next;
  },

  getQuestion(questionId: string) {
    return questions.get(questionId) ?? null;
  },

  listQuestions(tenantId: string, status?: ExpertQuestionStatus) {
    return Array.from(questions.values())
      .filter((question) => question.tenantId === tenantId)
      .filter((question) => (status ? question.status === status : true))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  async appendAnswer(answer: ExpertAnswerRecord) {
    const existing = answers.get(answer.questionId) ?? [];
    answers.set(answer.questionId, [...existing, answer]);

    await persistSupabase("expert_answers", {
      id: answer.id,
      tenant_id: answer.tenantId,
      question_id: answer.questionId,
      expert_user_id: answer.expertUserId,
      body: answer.body,
      citations: answer.citations,
      unsafe_advice_state: answer.unsafeAdviceState,
      metadata: answer.metadata,
      created_at: answer.createdAt,
      updated_at: answer.updatedAt
    });
  },

  listAnswers(questionId: string) {
    return answers.get(questionId) ?? [];
  },

  async appendAssignment(assignment: ExpertAssignmentRecord) {
    const existing = assignments.get(assignment.questionId) ?? [];
    assignments.set(assignment.questionId, [...existing, assignment]);

    await persistSupabase("expert_assignments", {
      id: assignment.id,
      tenant_id: assignment.tenantId,
      question_id: assignment.questionId,
      expert_user_id: assignment.expertUserId,
      assigned_by_user_id: assignment.assignedByUserId,
      status: assignment.status,
      reason: assignment.reason,
      created_at: assignment.createdAt,
      updated_at: assignment.updatedAt
    });
  },

  listAssignments(questionId: string) {
    return assignments.get(questionId) ?? [];
  },

  async appendModerationAction(action: ModerationActionRecord) {
    const existing = moderationActions.get(action.targetId) ?? [];
    moderationActions.set(action.targetId, [...existing, action]);

    await persistSupabase("moderation_actions", {
      id: action.id,
      tenant_id: action.tenantId,
      target_type: action.targetType,
      target_id: action.targetId,
      action_type: action.actionType,
      unsafe_advice_state: action.unsafeAdviceState,
      reason: action.reason,
      metadata: action.metadata,
      reviewed_by_user_id: action.reviewedByUserId,
      created_at: action.createdAt
    });
  },

  listModerationActions(targetId: string) {
    return moderationActions.get(targetId) ?? [];
  }
};
