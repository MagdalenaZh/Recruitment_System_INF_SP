import { useEffect, useState } from "react";

type AssignBoardMemberModalProps = {
  open: boolean;
  departmentName: string;
  onClose: () => void;
  onSubmit: (userId: string) => Promise<void> | void;
};

export function AssignBoardMemberModal({
  open,
  departmentName,
  onClose,
  onSubmit,
}: AssignBoardMemberModalProps) {
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setUserId("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedUserId = userId.trim();
    if (!normalizedUserId) return;

    setSaving(true);
    try {
      await onSubmit(normalizedUserId);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Club Admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Assign board member
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Assign{" "}
            <span className="font-medium text-white">{departmentName}</span> and
            the BoardMember role to a user.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30 disabled:opacity-50"
            >
              {saving ? "Assigning..." : "Assign board member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
