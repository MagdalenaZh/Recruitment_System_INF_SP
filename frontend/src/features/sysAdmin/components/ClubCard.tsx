import type { ReactNode } from "react";
import type { SysAdminClub } from "../types/sysAdminTypes";
import { GlassPanel } from "./GlassPanel";

type ClubCardProps = {
  club: SysAdminClub;
  adminName?: string;
  actions?: ReactNode;
};

export function ClubCard({ club, adminName, actions }: ClubCardProps) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            {club.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{club.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{club.shortName}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            club.status === "active"
              ? "bg-emerald-400/15 text-emerald-300 border border-emerald-300/20"
              : "bg-amber-400/15 text-amber-300 border border-amber-300/20"
          }`}
        >
          {club.status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        {club.description}
      </p>

      <div className="mt-5 space-y-2 text-sm text-slate-300">
        <p>
          <span className="text-slate-400">Club admin:</span>{" "}
          <span className="text-white">{adminName ?? "Not assigned yet"}</span>
        </p>
      </div>

      {actions ? <div className="mt-5">{actions}</div> : null}
    </GlassPanel>
  );
}
