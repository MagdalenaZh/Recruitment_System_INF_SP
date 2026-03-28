import { useState } from "react";
import type { CreateClubInput } from "../types/sysAdminTypes";

type AddClubModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateClubInput) => void;
};

export function AddClubModal({ open, onClose, onSubmit }: AddClubModalProps) {
  const [form, setForm] = useState<CreateClubInput>({
    name: "",
    shortName: "",
    category: "",
    description: "",
  });

  if (!open) return null;

  function handleChange<K extends keyof CreateClubInput>(
    key: K,
    value: CreateClubInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.shortName.trim() ||
      !form.category.trim() ||
      !form.description.trim()
    ) {
      return;
    }

    onSubmit(form);
    setForm({
      name: "",
      shortName: "",
      category: "",
      description: "",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            System Admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Add new club
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Simple mock form for creating a new club in the admin panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Club name"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
            <input
              value={form.shortName}
              onChange={(e) => handleChange("shortName", e.target.value)}
              placeholder="Short name"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <input
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Category"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
            >
              Add club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
