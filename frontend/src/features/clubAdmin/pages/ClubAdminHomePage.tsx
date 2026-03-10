import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminHomeCard } from "../components/ClubAdminHomeCard";

export function ClubAdminHomePage() {
  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Club Admin Panel
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300">
            Manage applications, assign board members, and update club
            information from one place.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ClubAdminHomeCard
            title="Applications"
            description="Review applications by department, inspect answers and attachments, and make final admission decisions."
            to="/club-admin/applications"
          />

          <ClubAdminHomeCard
            title="Manage board members"
            description="View board members and assign them to specific departments for application review."
            to="/club-admin/board-members"
          />

          <ClubAdminHomeCard
            title="Manage club info"
            description="Edit the club name, short description, recruitment visibility, and general organization details."
            to="/club-admin/club-info"
          />
        </div>
      </div>
    </ClubAdminShell>
  );
}
