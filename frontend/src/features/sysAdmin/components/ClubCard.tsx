import type { ReactNode } from "react";
import type { SysAdminClub } from "../types/sysAdminTypes";
import { GlassPanel } from "./GlassPanel";

type ClubCardProps = {
  club: SysAdminClub;
  actions?: ReactNode;
};

export function ClubCard({ club, actions }: ClubCardProps) {
  return (
    <GlassPanel className="p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
          {club.category || "Uncategorized"}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          {club.clubName}
        </h3>
      </div>

      {actions ? <div className="mt-5">{actions}</div> : null}
    </GlassPanel>
  );
}
