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
  scheduledTime: LatestInterviewSlot;
};

export type ApprovedApplicationStateRepresentation = {
  applicationId: string;
};

export type ConcludedApplicationStateRepresentation = {
  applicationId: string;
  conclusionResult: ApplicationConclusionStatus | number;
};

export type LatestApplicationStateResponse =
  | InitialApplicationStateRepresentation
  | ProcessingApplicationStateRepresentation
  | HibernatedApplicationStateRepresentation
  | ApprovedApplicationStateRepresentation
  | ConcludedApplicationStateRepresentation;

export function hasApplicationId(
  value: unknown,
): value is { applicationId: string } {
  return !!value && typeof value === "object" && typeof (value as { applicationId?: unknown }).applicationId === "string";
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
    "requiredNumberOfApprovals" in value ||
    "currentNumberOfApprovals" in value ||
    "userDecisionsMap" in value
  );
}

export function isHibernatedApplicationState(
  value: LatestApplicationStateResponse,
): value is HibernatedApplicationStateRepresentation {
  return "scheduledTime" in value;
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
    !isInitialApplicationState(value) &&
    !isProcessingApplicationState(value) &&
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
