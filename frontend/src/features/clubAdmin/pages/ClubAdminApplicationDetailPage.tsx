import { Link, useParams } from "react-router-dom";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { ApplicationAnswersSection } from "../../board/components/ApplicationAnswersSection";
import { ApplicationAttachmentsSection } from "../../board/components/ApplicationAttachmentsSection";
import { ApplicationDetailHeader } from "../../board/components/ApplicationDetailHeader";
import { useClubAdminApplicationDetail } from "../hooks/useClubAdminApplicationDetail";
import { useFinalizeApplication } from "../hooks/useFinalizeApplication";
import { AdminActionBar } from "../components/AdminActionBar";

export function ClubAdminApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data, setData, loading, error, refetch } =
    useClubAdminApplicationDetail(applicationId);
  const {
    finalize,
    loading: finalizeLoading,
    error: finalizeError,
  } = useFinalizeApplication();

  async function onFinalize(decision: "Admit" | "Reject") {
    if (!data) return;

    const res = await finalize(data.id, decision);
    if (!res) return;

    setData({
      ...data,
      status: res.status,
    });
  }

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              to="/club-admin/applications"
              className="text-sm font-semibold text-slate-300 hover:text-white hover:underline"
            >
              ← Back to applications
            </Link>

            <div className="mt-2 text-sm text-slate-300">
              Application ID: {applicationId}
            </div>
          </div>

          <button
            onClick={refetch}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading application…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : data ? (
            <div className="flex flex-col gap-4">
              <ApplicationDetailHeader app={data as any} />
              <ApplicationAnswersSection answers={data.answers as any} />
              <ApplicationAttachmentsSection
                attachments={data.attachments as any}
              />

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
                <h2 className="text-lg font-semibold text-white">
                  Assigned board members
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {data.assignedBoardMembers.map((memberId) => (
                    <span
                      key={memberId}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200"
                    >
                      {memberId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {data ? (
          <AdminActionBar
            app={data}
            onFinalize={onFinalize}
            loading={finalizeLoading}
            error={finalizeError}
          />
        ) : null}
      </div>
    </ClubAdminShell>
  );
}
