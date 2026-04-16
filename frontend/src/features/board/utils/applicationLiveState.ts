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
      return "Submitted";
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

function readVoteActivity(
  payload: ApplicationUpdatePayload,
): Pick<ApplicationListItem, "totalVotes" | "approveVotes" | "rejectVotes"> | null {
  if (!("userDecisionsMap" in payload) || !payload.userDecisionsMap) {
    return null;
  }

  const decisions = payload.userDecisionsMap as Record<string, boolean>;
  let approveVotes = 0;
  let rejectVotes = 0;

  for (const vote of Object.values(decisions)) {
    if (vote === true) approveVotes += 1;
    else if (vote === false) rejectVotes += 1;
  }

  return {
    totalVotes: approveVotes + rejectVotes,
    approveVotes,
    rejectVotes,
  };
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
  const voteActivity = readVoteActivity(payload);

  return {
    ...item,
    status: inferredStatus ?? item.status,
    approvalsCount:
      inferredStatus === "InterviewPending"
        ? 0
        : approvals?.approvalsCount ?? item.approvalsCount,
    requiredApprovals:
      inferredStatus === "InterviewPending"
        ? 0
        : approvals?.requiredApprovals ?? item.requiredApprovals,
    totalVotes: voteActivity?.totalVotes ?? item.totalVotes,
    approveVotes: voteActivity?.approveVotes ?? item.approveVotes,
    rejectVotes: voteActivity?.rejectVotes ?? item.rejectVotes,
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
  const voteActivity = readVoteActivity(payload);

  let interviewSlot: ApplicationDetail["interviewSlot"] = detail.interviewSlot;
  let voterDecisions: ApplicationDetail["voterDecisions"] = detail.voterDecisions;

  if (isAfterInterviewReviewState(payload)) {
    interviewSlot = payload.scheduledTime;
    voterDecisions = payload.userDecisionsMap as Record<string, boolean>;
  } else if (isProcessingApplicationState(payload)) {
    voterDecisions = payload.userDecisionsMap as Record<string, boolean>;
  } else if (isApprovedApplicationState(payload)) {
    if (payload.userDecisionsMap) {
      voterDecisions = payload.userDecisionsMap as Record<string, boolean>;
    }
    if (payload.scheduledTime) {
      interviewSlot = payload.scheduledTime;
    }
  }

  return {
    ...detail,
    status: inferredStatus ?? detail.status,
    approvalsCount:
      inferredStatus === "InterviewPending"
        ? 0
        : approvals?.approvalsCount ?? detail.approvalsCount,
    requiredApprovals:
      inferredStatus === "InterviewPending"
        ? 0
        : approvals?.requiredApprovals ?? detail.requiredApprovals,
    totalVotes: voteActivity?.totalVotes ?? detail.totalVotes,
    approveVotes: voteActivity?.approveVotes ?? detail.approveVotes,
    rejectVotes: voteActivity?.rejectVotes ?? detail.rejectVotes,
    myVote: voteFromMap ?? detail.myVote,
    interviewSlot,
    voterDecisions,
  };
}
