import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminHomeCard } from "../components/ClubAdminHomeCard";
import { useClubAdminClubInfo } from "../hooks/useClubAdminClubInfo";

export function ClubAdminHomePage() {
  const { data, loading, error } = useClubAdminClubInfo();

  const clubName = data?.clubName ?? "Your Club";

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {loading ? "Club Admin Panel" : `${clubName} Admin Panel`}
          </h1>

          <p className="mt-3 max-w-3xl text-base text-slate-300">
            {loading
              ? "Loading your club information..."
              : `Manage recruitment and club settings for ${clubName} from one place.`}
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <ClubAdminHomeCard
            title="Club Settings"
            description="Edit club information, departments, and application questions from one page."
            to="/club-admin/club-info"
          />

          <ClubAdminHomeCard
            title="Interview Slots"
            description="Create and update the available interview booking slots for applicants."
            to="/club-admin/interview-slots"
          />

          <ClubAdminHomeCard
            title="Final Decisions"
            description="Review round-two-approved applicants and make the final admit or reject decision."
            to="/club-admin/final-decisions"
          />

          <ClubAdminHomeCard
            title="Applications & Interviews"
            description="Jump into the shared applications and interview workspaces."
            to="/board"
          />
        </div>
      </div>
    </ClubAdminShell>
  );
}
