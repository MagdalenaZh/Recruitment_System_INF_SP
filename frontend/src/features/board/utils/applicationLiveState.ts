import type {
  LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import {
  isAfterInterviewReviewState,
  isApprovedApplicationState,
  isConcludedApplicationState,
  isHibernatedApplicationState,
  isInitialApplicationState,
  isProcessingApplicationState,
} from "../../../services/applications/applicationStateTypes";
import type {
  ApplicationDetail,
  ApplicationListItem,
  ApplicationStatus,
  BoardVote,
} from "../types/boardTypes";

export type ApplicationUpdatePayload = LatestApplicationStateResponse;

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function getApplicationIdFromUpdate(
  payload: ApplicationUpdatePayload,
): string | null {
  return payload.applicationId ?? null;
}

export function normalizeBaseStatus(applicationStatus: number): ApplicationStatus {
  switch (applicationStatus) {
    case 1:
      return "Pending";
    case 2:
      return "Pending";
    case 3:
      return "Interview";
    case 4:
      return "Rejected";
    case 5:
      return "Approved";
    case 6:
      return "FinalReview";
    default:
      return "Unknown";
  }
}

export function inferStatusFromUpdate(
  payload: ApplicationUpdatePayload,
): ApplicationStatus | null {
  if (isConcludedApplicationState(payload)) {
    return payload.conclusionResult === 4 ? "Rejected" : "Approved";
  }

  if (isHibernatedApplicationState(payload)) {
    return "FinalReview";
  }

  if (isAfterInterviewReviewState(payload)) {
    return "Interview";
  }

  if (isApprovedApplicationState(payload)) {
    return "InterviewPending";
  }

  if (isProcessingApplicationState(payload)) {
    return "Pending";
  }

  if (isInitialApplicationState(payload)) {
    return "Submitted";
  }

  return null;
}

function extractMyVoteFromUserDecisionsMap(
  payload: ApplicationUpdatePayload,
  currentUserId: string | null,
): BoardVote | null {
  if (!currentUserId) {
    return null;
  }

  if (!("userDecisionsMap" in payload) || !payload.userDecisionsMap) {
    return null;
  }

  const decisions = payload.userDecisionsMap as Record<string, boolean>;
  const targetKey = Object.keys(decisions).find(
    (key) => normalizeKey(key) === normalizeKey(currentUserId),
  );

  if (!targetKey) {
    return null;
  }

  const decision = decisions[targetKey];

  if (decision === true) return "Approve";
  if (decision === false) return "Reject";
  return null;
}

function readApprovals(
  payload: ApplicationUpdatePayload,
): Pick<ApplicationListItem, "approvalsCount" | "requiredApprovals"> | null {
  if (isProcessingApplicationState(payload)) {
    return {
      approvalsCount: payload.currentNumberOfApprovals,
      requiredApprovals: payload.requiredNumberOfApprovals,
    };
  }

  if (isAfterInterviewReviewState(payload)) {
    return {
      approvalsCount: payload.currentNumberOfPostInterviewApprovals,
      requiredApprovals: payload.requiredNumberOfApprovals,
    };
  }

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
  const approvals = readApprovals(payload);
  const voteFromMap = extractMyVoteFromUserDecisionsMap(payload, currentUserId);

  return {
    ...item,
    status: inferredStatus ?? item.status,
    approvalsCount: approvals?.approvalsCount ?? item.approvalsCount,
    requiredApprovals: approvals?.requiredApprovals ?? item.requiredApprovals,
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
  const approvals = readApprovals(payload);
  const voteFromMap = extractMyVoteFromUserDecisionsMap(payload, currentUserId);

  return {
    ...detail,
    status: inferredStatus ?? detail.status,
    approvalsCount: approvals?.approvalsCount ?? detail.approvalsCount,
    requiredApprovals: approvals?.requiredApprovals ?? detail.requiredApprovals,
    myVote: voteFromMap ?? detail.myVote,
  };
}
