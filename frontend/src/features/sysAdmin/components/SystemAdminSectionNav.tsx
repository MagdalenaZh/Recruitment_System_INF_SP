import { NavLink } from "react-router-dom";

const links = [
  { to: "/sys-admin", label: "Overview", end: true },
  { to: "/sys-admin/clubs", label: "Manage Clubs" },
];

export function SystemAdminSectionNav() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              [
                "rounded-xl px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border border-sky-300/20 bg-sky-500/20 text-sky-100"
                  : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
