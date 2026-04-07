import type {
  ApplicationDetail,
  ApplicationListItem,
  ApplicationStatus,
  BoardVote,
} from "../types/boardTypes";

export type ApplicationUpdatePayload = Record<string, unknown>;

function readString(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" ? value : null;
}

function readNumber(obj: Record<string, unknown>, key: string): number | null {
  const value = obj[key];
  return typeof value === "number" ? value : null;
}

function readBoolean(obj: Record<string, unknown>, key: string): boolean | null {
  const value = obj[key];
  return typeof value === "boolean" ? value : null;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function getApplicationIdFromUpdate(
  payload: ApplicationUpdatePayload,
): string | null {
  return readString(payload, "ApplicationId");
}

export function normalizeBaseStatus(applicationStatus: number): ApplicationStatus {
  switch (applicationStatus) {
    case 0:
      return "Submitted";
    case 1:
      return "Pending";
    case 2:
      return "Approved";
    case 3:
      return "Rejected";
    case 4:
      return "Interview";
    default:
      return "Unknown";
  }
}

export function inferStatusFromUpdate(
  payload: ApplicationUpdatePayload,
): ApplicationStatus | null {
  if ("ConclusionResult" in payload) {
    const result = readString(payload, "ConclusionResult") ?? "";
    return result.toLowerCase().includes("reject") ? "Rejected" : "Approved";
  }

  if ("InterviewTimesProposals" in payload) {
    return "Approved";
  }

  if ("ScheduledTime" in payload) {
    return "Interview";
  }

  if (
    "CurrentNumberOfApprovals" in payload ||
    "RequiredNumberOfApprovals" in payload ||
    "UserDecisionsMap" in payload
  ) {
    return "Pending";
  }

  if ("ApplicationProcessed" in payload) {
    return "Submitted";
  }

  return null;
}

function extractMyVoteFromUserDecisionsMap(
  payload: ApplicationUpdatePayload,
  currentUserId: string | null,
): BoardVote | null {
  if (!currentUserId) return null;

  const rawMap = payload["UserDecisionsMap"];
  if (!rawMap || typeof rawMap !== "object") return null;

  const decisions = rawMap as Record<string, unknown>;
  const targetKey = Object.keys(decisions).find(
    (key) => normalizeKey(key) === normalizeKey(currentUserId),
  );

  if (!targetKey) return null;

  const decision = readBoolean(decisions, targetKey);
  if (decision === true) return "Approve";
  if (decision === false) return "Reject";
  return null;
}

export function applyUpdateToApplicationListItem(
  item: ApplicationListItem,
  payload: ApplicationUpdatePayload,
  currentUserId: string | null,
): ApplicationListItem {
  const payloadAppId = getApplicationIdFromUpdate(payload);
  if (!payloadAppId || normalizeKey(payloadAppId) !== normalizeKey(item.id)) {
    return item;
  }

  const inferredStatus = inferStatusFromUpdate(payload);
  const currentApprovals = readNumber(payload, "CurrentNumberOfApprovals");
  const requiredApprovals = readNumber(payload, "RequiredNumberOfApprovals");
  const voteFromMap = extractMyVoteFromUserDecisionsMap(payload, currentUserId);

  return {
    ...item,
    status: inferredStatus ?? item.status,
    approvalsCount:
      currentApprovals !== null ? currentApprovals : item.approvalsCount,
    requiredApprovals:
      requiredApprovals !== null ? requiredApprovals : item.requiredApprovals,
    myVote: voteFromMap ?? item.myVote,
  };
}

export function applyUpdateToApplicationDetail(
  detail: ApplicationDetail,
  payload: ApplicationUpdatePayload,
  currentUserId: string | null,
): ApplicationDetail {
  const payloadAppId = getApplicationIdFromUpdate(payload);
  if (!payloadAppId || normalizeKey(payloadAppId) !== normalizeKey(detail.id)) {
    return detail;
  }

  const inferredStatus = inferStatusFromUpdate(payload);
  const currentApprovals = readNumber(payload, "CurrentNumberOfApprovals");
  const requiredApprovals = readNumber(payload, "RequiredNumberOfApprovals");
  const voteFromMap = extractMyVoteFromUserDecisionsMap(payload, currentUserId);

  return {
    ...detail,
    status: inferredStatus ?? detail.status,
    approvalsCount:
      currentApprovals !== null ? currentApprovals : detail.approvalsCount,
    requiredApprovals:
      requiredApprovals !== null
        ? requiredApprovals
        : detail.requiredApprovals,
    myVote: voteFromMap ?? detail.myVote,
  };
}