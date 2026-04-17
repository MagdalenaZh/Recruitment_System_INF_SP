import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClubAdminPageHeader } from "../components/ClubAdminPageHeader";
import { ClubAdminSectionNav } from "../components/ClubAdminSectionNav";
import { ClubAdminShell } from "../components/ClubAdminShell";
import {
  clubAdminApi,
  resolveCurrentClubId,
} from "../../../services/clubAdmin/clubAdminApi";
import { boardApi } from "../../../services/board/boardApi";
import {
  getLatestApplicationStates,
  primeLatestApplicationStates,
} from "../../../services/applications/applicationStatusApi";
import {
  isConcludedApplicationState,
  isHibernatedApplicationState,
  type LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import { useFinalizeApplication } from "../hooks/useFinalizeApplication";

type DecisionRecord = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  departmentName: string;
};

type PendingFinalAction = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  departmentName: string;
  decision: "Admit" | "Reject";
} | null;

function deriveEffectiveStage(
  applicationStatus: number,
  latestState: LatestApplicationStateResponse | undefined,
): "pending" | "accepted" | "rejected" | "other" {
  if (latestState && isConcludedApplicationState(latestState)) {
    if (latestState.conclusionResult === 5) return "accepted";
    if (latestState.conclusionResult === 4) return "rejected";
  }

  if (latestState && isHibernatedApplicationState(latestState)) {
    return "pending";
  }

  if (applicationStatus === 6) return "pending";
  if (applicationStatus === 5) return "accepted";
  if (applicationStatus === 4) return "rejected";
  return "other";
}

export function ClubAdminFinalDecisionsPage() {
  const [pendingItems, setPendingItems] = useState<DecisionRecord[]>([]);
  const [acceptedMembers, setAcceptedMembers] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingFinalAction>(null);
  const {
    finalize,
    loading: finalizing,
    error: finalizeError,
  } = useFinalizeApplication();

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentClubId();
      const [applications, clubInfo] = await Promise.all([
        boardApi.getApplicationsByClub(clubId),
        clubAdminApi.getCurrentClubInfo(),
      ]);

      const statusResults = await Promise.all(
        applications.map(async (application) => {
          const states = await getLatestApplicationStates([
            application.applicationId,
          ]);
          return [application.applicationId, states[0]] as const;
        }),
      );
      const latestStateMap = new Map(statusResults);

      const relevantApplications = applications.filter((application) => {
        const effectiveStage = deriveEffectiveStage(
          application.applicationStatus,
          latestStateMap.get(application.applicationId),
        );
        return effectiveStage === "pending" || effectiveStage === "accepted";
      });

      const uniqueUserIds = [
        ...new Set(
          relevantApplications.map((application) => application.userId),
        ),
      ];
      const userInfoResults = await Promise.allSettled(
        uniqueUserIds.map((userId) => boardApi.getUserInformation(userId)),
      );

      const userInfoMap = new Map<
        string,
        { firstName: string; lastName: string; email: string }
      >();
      for (const result of userInfoResults) {
        if (result.status === "fulfilled") {
          userInfoMap.set(result.value.userId, result.value);
        }
      }

      const departmentMap = new Map(
        clubInfo.departments.map((department) => [
          department.departmentId,
          department.departmentName,
        ]),
      );

      const nextPending: DecisionRecord[] = [];
      const nextAccepted: DecisionRecord[] = [];

      for (const application of relevantApplications) {
        const user = userInfoMap.get(application.userId);
        const record: DecisionRecord = {
          applicationId: application.applicationId,
          applicantName: user
            ? `${user.firstName} ${user.lastName}`.trim()
            : application.userId,
          applicantEmail: user?.email ?? "",
          departmentName:
            departmentMap.get(application.departmentId) ?? "Unknown department",
        };

        const effectiveStage = deriveEffectiveStage(
          application.applicationStatus,
          latestStateMap.get(application.applicationId),
        );

        if (effectiveStage === "pending") {
          nextPending.push(record);
          continue;
        }

        if (effectiveStage === "accepted") {
          nextAccepted.push(record);
        }
      }

      nextPending.sort((left, right) =>
        left.applicantName.localeCompare(right.applicantName),
      );
      nextAccepted.sort((left, right) =>
        left.applicantName.localeCompare(right.applicantName),
      );

      setPendingItems(nextPending);
      setAcceptedMembers(nextAccepted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load final decisions.",
      );
      setPendingItems([]);
      setAcceptedMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const pendingCount = useMemo(() => pendingItems.length, [pendingItems]);

  async function handleConfirmDecision() {
    if (!pendingAction) return;

    const action = pendingAction;
    const result = await finalize(action.applicationId, action.decision);
    if (!result) return;

    const nextState: LatestApplicationStateResponse = {
      applicationId: action.applicationId,
      conclusionResult: action.decision === "Admit" ? 5 : 4,
    };
    primeLatestApplicationStates([nextState]);

    setPendingItems((prev) =>
      prev.filter((item) => item.applicationId !== action.applicationId),
    );

    if (action.decision === "Admit") {
      setAcceptedMembers((prev) =>
        [
          ...prev,
          {
            applicationId: action.applicationId,
            applicantName: action.applicantName,
            applicantEmail: action.applicantEmail,
            departmentName: action.departmentName,
          },
        ].sort((left, right) =>
          left.applicantName.localeCompare(right.applicantName),
        ),
      );
      setMessage(`${action.applicantName} was admitted to the club.`);
    } else {
      setMessage(`${action.applicantName} was rejected from the club.`);
    }

    setPendingAction(null);
    await load();
  }

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          {" "}
          <ClubAdminSectionNav />
        </div>
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Final decisions"
          description="Only applicants who passed round two appear here."
          onRefresh={() => void load()}
        />

        <div className="mt-8 space-y-5">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading final decisions...
            </div>
          ) : (
            <>
              {error ? (
                <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
                  {error}
                </div>
              ) : null}

              <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                    Pending final decisions
                  </p>
                </div>

                {pendingItems.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
                    No applicants are waiting for a final decision right now.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4">
                    {pendingItems.map((item) => (
                      <article
                        key={item.applicationId}
                        className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                              Ready for final review
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">
                              {item.applicantName}
                            </h3>
                            <p className="mt-2 text-sm text-slate-300">
                              {item.applicantEmail}
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                              Department: {item.departmentName}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/club-admin/applications/${item.applicationId}`}
                              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                            >
                              Open application
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  applicationId: item.applicationId,
                                  applicantName: item.applicantName,
                                  applicantEmail: item.applicantEmail,
                                  departmentName: item.departmentName,
                                  decision: "Admit",
                                })
                              }
                              className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/25"
                            >
                              Admit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  applicationId: item.applicationId,
                                  applicantName: item.applicantName,
                                  applicantEmail: item.applicantEmail,
                                  departmentName: item.departmentName,
                                  decision: "Reject",
                                })
                              }
                              className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/25"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-6 backdrop-blur shadow-lg">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                    New members
                  </p>
                </div>

                {acceptedMembers.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
                    No accepted applicants yet.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {acceptedMembers.map((member) => (
                      <div
                        key={member.applicationId}
                        className="rounded-2xl border border-white/10 bg-white/10 p-4"
                      >
                        <div className="text-lg font-semibold text-white">
                          {member.applicantName}
                        </div>
                        <div className="mt-1 text-sm text-slate-100">
                          {member.applicantEmail}
                        </div>
                        <div className="mt-1 text-sm text-slate-200">
                          Accepted for: {member.departmentName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {message ? (
            <div className="text-sm text-emerald-300">{message}</div>
          ) : null}
          {finalizeError ? (
            <div className="text-sm text-rose-300">{finalizeError}</div>
          ) : null}
        </div>
      </div>

      <FinalDecisionModal
        open={pendingAction !== null}
        applicantName={pendingAction?.applicantName ?? ""}
        decision={pendingAction?.decision ?? "Admit"}
        loading={finalizing}
        onClose={() => {
          if (!finalizing) {
            setPendingAction(null);
          }
        }}
        onConfirm={() => void handleConfirmDecision()}
      />
    </ClubAdminShell>
  );
}

function FinalDecisionModal({
  open,
  applicantName,
  decision,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  applicantName: string;
  decision: "Admit" | "Reject";
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const decisionVerb = decision === "Admit" ? "accept" : "reject";
  const decisionLabel =
    decision === "Admit" ? "Accept applicant" : "Reject applicant";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
          Confirm final decision
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          You are about to {decisionVerb} this applicant into the club
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Are you sure you want to {decisionVerb}{" "}
          <span className="font-semibold text-white">{applicantName}</span>?
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
              decision === "Admit"
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-rose-600 hover:bg-rose-500",
            ].join(" ")}
          >
            {loading ? "Saving..." : decisionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
