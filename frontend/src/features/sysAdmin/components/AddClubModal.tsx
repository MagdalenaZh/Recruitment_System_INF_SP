import { useState } from "react";
import type { CreateClubInput } from "../types/sysAdminTypes";

const CATEGORY_OPTIONS = [
  "Math & Science",
  "Technology",
  "Sports",
  "Business",
  "Politics",
  "Art",
  "Media & Journalism",
  "Entrepreneurship",
  "Music",
  "Other",
] as const;

type AddClubModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateClubInput) => Promise<void> | void;
};

const initialForm: CreateClubInput = {
  clubName: "",
  description: "",
  category: "",
};

export function AddClubModal({ open, onClose, onSubmit }: AddClubModalProps) {
  const [form, setForm] = useState<CreateClubInput>(initialForm);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function handleChange<K extends keyof CreateClubInput>(
    key: K,
    value: CreateClubInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.clubName.trim()) {
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        clubName: form.clubName.trim(),
        description: form.description.trim(),
        category: form.category?.trim() ?? "",
      });

      setForm(initialForm);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            System Admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Create club
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Add the basic club information. Club admins can manage the rest
            later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.clubName}
            onChange={(e) => handleChange("clubName", e.target.value)}
            placeholder="Club name"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <select
            value={form.category ?? ""}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
          >
            <option value="">Choose category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description (optional)"
            rows={5}
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
              {saving ? "Creating..." : "Create club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
