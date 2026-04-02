import type { UserType } from "./types";

export type UserTypeInput = {
  email?: string;
  orgName?: string;
  tags?: string[];
};

export type UserTypeResult = {
  userType: UserType;
  confidence: number;
  detectorVersion: string;
  signals: string[];
};

export const detectUserTypeStub = (input: UserTypeInput): UserTypeResult => {
  const email = (input.email ?? "").toLowerCase();
  const tags = (input.tags ?? []).map((tag) => tag.toLowerCase());
  const orgName = (input.orgName ?? "").toLowerCase();

  if (tags.includes("enterprise") || orgName.includes("llc") || orgName.includes("inc")) {
    return {
      userType: "enterprise_partner",
      confidence: 0.79,
      detectorVersion: "user-type-stub-v1",
      signals: ["org_shape_enterprise"]
    };
  }

  if (tags.includes("property_manager") || email.includes("property")) {
    return {
      userType: "property_manager",
      confidence: 0.77,
      detectorVersion: "user-type-stub-v1",
      signals: ["tag_or_email_property"]
    };
  }

  if (email.length > 0) {
    return {
      userType: "homeowner",
      confidence: 0.67,
      detectorVersion: "user-type-stub-v1",
      signals: ["default_email_present"]
    };
  }

  return {
    userType: "unknown",
    confidence: 0.5,
    detectorVersion: "user-type-stub-v1",
    signals: ["insufficient_signals"]
  };
};
