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
            title="Club Info Manager"
            description="View club details, departments, open positions, and manage department heads."
            to="/club-admin/club-info"
          />

          <ClubAdminHomeCard
            title="Application Manager"
            description="Add, remove, and update the text-based application questions."
            to="/club-admin/application-management"
          />

          <ClubAdminHomeCard
            title="Current Club Applications"
            description="Review applications using the already implemented applications flow."
            to="/board"
          />

          <ClubAdminHomeCard
            title="Interviews"
            description="Open the interview page and manage the recruitment interview flow."
            to="/board/interviews"
          />
        </div>
      </div>
    </ClubAdminShell>
  );
}
