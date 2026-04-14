export type ApplicationConclusionStatus = 4 | 5;

export type LatestInterviewSlot = {
  slotId: string;
  startTime: string;
  endTime: string;
};

export type InitialApplicationStateRepresentation = {
  applicationId: string;
  applicationProcessed: boolean;
};

export type ProcessingApplicationStateRepresentation = {
  applicationId: string;
  requiredNumberOfApprovals: number;
  currentNumberOfApprovals: number;
  userDecisionsMap: Record<string, boolean>;
};

export type HibernatedApplicationStateRepresentation = {
  applicationId: string;
  waitingFinalDecision: boolean;
};

export type AfterInterviewReviewStateRepresentation = {
  applicationId: string;
  requiredNumberOfApprovals: number;
  currentNumberOfPostInterviewApprovals: number;
  userDecisionsMap: Record<string, boolean>;
  scheduledTime: LatestInterviewSlot;
};

export type ApprovedApplicationStateRepresentation = {
  applicationId: string;
  applicationApproved?: boolean;
  currentNumberOfApprovals?: number;
  requiredNumberOfApprovals?: number;
  userDecisionsMap?: Record<string, boolean>;
};

export type ConcludedApplicationStateRepresentation = {
  applicationId: string;
  conclusionResult: ApplicationConclusionStatus | number;
};

export type LatestApplicationStateResponse =
  | InitialApplicationStateRepresentation
  | ProcessingApplicationStateRepresentation
  | HibernatedApplicationStateRepresentation
  | AfterInterviewReviewStateRepresentation
  | ApprovedApplicationStateRepresentation
  | ConcludedApplicationStateRepresentation;

export function hasApplicationId(
  value: unknown,
): value is { applicationId: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { applicationId?: unknown }).applicationId === "string"
  );
}

export function isInitialApplicationState(
  value: LatestApplicationStateResponse,
): value is InitialApplicationStateRepresentation {
  return "applicationProcessed" in value;
}

export function isProcessingApplicationState(
  value: LatestApplicationStateResponse,
): value is ProcessingApplicationStateRepresentation {
  return (
    "currentNumberOfApprovals" in value &&
    "requiredNumberOfApprovals" in value &&
    "userDecisionsMap" in value &&
    !isAfterInterviewReviewState(value)
  );
}

export function isAfterInterviewReviewState(
  value: LatestApplicationStateResponse,
): value is AfterInterviewReviewStateRepresentation {
  return "scheduledTime" in value && "currentNumberOfPostInterviewApprovals" in value;
}

export function isHibernatedApplicationState(
  value: LatestApplicationStateResponse,
): value is HibernatedApplicationStateRepresentation {
  return "waitingFinalDecision" in value;
}

export function isConcludedApplicationState(
  value: LatestApplicationStateResponse,
): value is ConcludedApplicationStateRepresentation {
  return "conclusionResult" in value;
}

export function isApprovedApplicationState(
  value: LatestApplicationStateResponse,
): value is ApprovedApplicationStateRepresentation {
  return (
    hasApplicationId(value) &&
    "applicationApproved" in value &&
    typeof value.applicationApproved === "boolean" &&
    !isInitialApplicationState(value) &&
    !isProcessingApplicationState(value) &&
    !isAfterInterviewReviewState(value) &&
    !isHibernatedApplicationState(value) &&
    !isConcludedApplicationState(value)
  );
}

export function indexApplicationStatesById(
  states: LatestApplicationStateResponse[],
): Record<string, LatestApplicationStateResponse> {
  return states.reduce<Record<string, LatestApplicationStateResponse>>((acc, state) => {
    acc[state.applicationId] = state;
    return acc;
  }, {});
}
