import type { SysAdminClub, SysAdminUser } from "../types/sysAdminTypes";

type AssignClubAdminModalProps = {
  open: boolean;
  club: SysAdminClub | null;
  admins: SysAdminUser[];
  currentAdminId?: string;
  onClose: () => void;
  onAssign: (clubId: string, adminId: string) => void;
};

export function AssignClubAdminModal({
  open,
  club,
  admins,
  currentAdminId,
  onClose,
  onAssign,
}: AssignClubAdminModalProps) {
  if (!open || !club) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Assign club admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {club.name}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Pick one mock club admin for this club.
          </p>
        </div>

        <div className="space-y-3">
          {admins.map((admin) => {
            const isCurrent = admin.id === currentAdminId;

            return (
              <button
                key={admin.id}
                type="button"
                onClick={() => {
                  onAssign(club.id, admin.id);
                  onClose();
                }}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  isCurrent
                    ? "border-sky-300/30 bg-sky-500/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{admin.name}</p>
                    <p className="text-sm text-slate-400">{admin.email}</p>
                  </div>

                  {isCurrent ? (
                    <span className="rounded-full border border-sky-300/20 bg-sky-500/20 px-3 py-1 text-xs text-sky-100">
                      Current
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
