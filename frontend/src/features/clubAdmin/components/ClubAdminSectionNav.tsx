import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/club-admin/club-info", label: "Club settings" },
  { to: "/club-admin/interview-slots", label: "Interview slots" },
  { to: "/club-admin/final-decisions", label: "Final decisions" },
] as const;

export function ClubAdminSectionNav() {
  return (
    <div className="flex flex-wrap gap-3">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "border-sky-400/40 bg-sky-400/15 text-white"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
