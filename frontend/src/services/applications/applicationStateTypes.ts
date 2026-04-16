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
  scheduledTime?: LatestInterviewSlot;
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

type AnyObject = Record<string, unknown>;

function toRecord(value: unknown): AnyObject | null {
  return value && typeof value === "object" ? (value as AnyObject) : null;
}

function readProp(source: AnyObject, camel: string, pascal: string): unknown {
  if (camel in source) return source[camel];
  if (pascal in source) return source[pascal];
  return undefined;
}

function readStringProp(source: AnyObject, camel: string, pascal: string): string | null {
  const value = readProp(source, camel, pascal);
  return typeof value === "string" ? value : null;
}

function readBooleanProp(source: AnyObject, camel: string, pascal: string): boolean | null {
  const value = readProp(source, camel, pascal);
  return typeof value === "boolean" ? value : null;
}

function readNumberProp(source: AnyObject, camel: string, pascal: string): number | null {
  const value = readProp(source, camel, pascal);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readDecisionMap(source: AnyObject, camel: string, pascal: string): Record<string, boolean> | null {
  const raw = readProp(source, camel, pascal);
  const record = toRecord(raw);
  if (!record) return null;

  const decisions: Record<string, boolean> = {};
  for (const [key, decision] of Object.entries(record)) {
    if (typeof decision === "boolean") {
      decisions[key] = decision;
    }
  }

  return decisions;
}

function readLatestInterviewSlot(source: unknown): LatestInterviewSlot | null {
  const slot = toRecord(source);
  if (!slot) return null;

  const slotId = readStringProp(slot, "slotId", "SlotId");
  const startTime = readStringProp(slot, "startTime", "StartTime");
  const endTime = readStringProp(slot, "endTime", "EndTime");

  if (!slotId || !startTime || !endTime) return null;

  return { slotId, startTime, endTime };
}

export function parseLatestApplicationState(
  value: unknown,
): LatestApplicationStateResponse | null {
  const source = toRecord(value);
  if (!source) return null;

  const applicationId = readStringProp(source, "applicationId", "ApplicationId");
  if (!applicationId) return null;

  const conclusionResult = readNumberProp(source, "conclusionResult", "ConclusionResult");
  if (conclusionResult !== null) {
    return { applicationId, conclusionResult };
  }

  const waitingFinalDecision = readBooleanProp(source, "waitingFinalDecision", "WaitingFinalDecision");
  if (waitingFinalDecision !== null) {
    return { applicationId, waitingFinalDecision };
  }

  const currentNumberOfPostInterviewApprovals = readNumberProp(
    source,
    "currentNumberOfPostInterviewApprovals",
    "CurrentNumberOfPostInterviewApprovals",
  );
  const afterInterviewRequiredApprovals = readNumberProp(
    source,
    "requiredNumberOfApprovals",
    "RequiredNumberOfApprovals",
  );
  const afterInterviewDecisionsMap = readDecisionMap(source, "userDecisionsMap", "UserDecisionsMap");
  const scheduledTimeRaw = readProp(source, "scheduledTime", "ScheduledTime");
  const scheduledTime = readLatestInterviewSlot(scheduledTimeRaw);
  if (
    currentNumberOfPostInterviewApprovals !== null &&
    afterInterviewRequiredApprovals !== null &&
    afterInterviewDecisionsMap !== null &&
    scheduledTime
  ) {
    return {
      applicationId,
      requiredNumberOfApprovals: afterInterviewRequiredApprovals,
      currentNumberOfPostInterviewApprovals,
      userDecisionsMap: afterInterviewDecisionsMap,
      scheduledTime,
    };
  }

  const applicationProcessed = readBooleanProp(source, "applicationProcessed", "ApplicationProcessed");
  if (applicationProcessed !== null) {
    return { applicationId, applicationProcessed };
  }

  const requiredNumberOfApprovals = readNumberProp(source, "requiredNumberOfApprovals", "RequiredNumberOfApprovals");
  const currentNumberOfApprovals = readNumberProp(source, "currentNumberOfApprovals", "CurrentNumberOfApprovals");
  const userDecisionsMap = readDecisionMap(source, "userDecisionsMap", "UserDecisionsMap");
  if (
    requiredNumberOfApprovals !== null &&
    currentNumberOfApprovals !== null &&
    userDecisionsMap !== null
  ) {
    return {
      applicationId,
      requiredNumberOfApprovals,
      currentNumberOfApprovals,
      userDecisionsMap,
    };
  }

  const applicationApproved = readBooleanProp(source, "applicationApproved", "ApplicationApproved");
  if (applicationApproved !== null) {
    const approved: ApprovedApplicationStateRepresentation = {
      applicationId,
      applicationApproved,
    };

    const approvedCurrentApprovals = readNumberProp(source, "currentNumberOfApprovals", "CurrentNumberOfApprovals");
    const approvedRequiredApprovals = readNumberProp(source, "requiredNumberOfApprovals", "RequiredNumberOfApprovals");
    const approvedUserDecisions = readDecisionMap(source, "userDecisionsMap", "UserDecisionsMap");

    if (approvedCurrentApprovals !== null) {
      approved.currentNumberOfApprovals = approvedCurrentApprovals;
    }
    if (approvedRequiredApprovals !== null) {
      approved.requiredNumberOfApprovals = approvedRequiredApprovals;
    }
    if (approvedUserDecisions !== null) {
      approved.userDecisionsMap = approvedUserDecisions;
    }
    if (scheduledTime) {
      approved.scheduledTime = scheduledTime;
    }

    return approved;
  }

  return null;
}

export function parseLatestApplicationStates(value: unknown): LatestApplicationStateResponse[] {
  if (!Array.isArray(value)) {
    const single = parseLatestApplicationState(value);
    return single ? [single] : [];
  }

  const states: LatestApplicationStateResponse[] = [];
  for (const item of value) {
    const parsed = parseLatestApplicationState(item);
    if (parsed) {
      states.push(parsed);
    }
  }

  return states;
}

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
