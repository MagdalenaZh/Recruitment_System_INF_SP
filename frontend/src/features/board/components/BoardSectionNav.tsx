import { NavLink } from "react-router-dom";

export function BoardSectionNav() {
  const baseClasses =
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition";

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <NavLink
        to="/board"
        end
        className={({ isActive }) =>
          [
            baseClasses,
            isActive
              ? "border border-sky-400/40 bg-sky-400/15 text-white"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
          ].join(" ")
        }
      >
        Applications
      </NavLink>

      <NavLink
        to="/board/interviews"
        className={({ isActive }) =>
          [
            baseClasses,
            isActive
              ? "border border-sky-400/40 bg-sky-400/15 text-white"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
          ].join(" ")
        }
      >
        Interviews
      </NavLink>
    </div>
  );
}
