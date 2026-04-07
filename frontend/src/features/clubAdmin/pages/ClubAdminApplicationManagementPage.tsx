import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminPageHeader } from "../components/ClubAdminPageHeader";
import { useClubAdminApplicationQuestions } from "../hooks/useClubAdminApplicationQuestions";
import { ApplicationQuestionsManager } from "../components/ApplicationQuestionsManager";

export function ClubAdminApplicationManagementPage() {
  const { clubName, questions, loading, error, refetch, saveQuestions } =
    useClubAdminApplicationQuestions();

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Application management"
          description={
            clubName
              ? `Manage the application questions for ${clubName}.`
              : "Manage the application questions for this club."
          }
          onRefresh={refetch}
        />

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading application questions…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : (
            <ApplicationQuestionsManager
              initialQuestions={questions}
              onSave={saveQuestions}
            />
          )}
        </div>
      </div>
    </ClubAdminShell>
  );
}
