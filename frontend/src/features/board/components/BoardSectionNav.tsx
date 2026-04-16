import { NavLink } from "react-router-dom";

export function BoardSectionNav() {
  const baseClasses =
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition";

  return (
    <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <NavLink
        to="/board"
        end
        className={({ isActive }) =>
          [
            baseClasses,
            isActive
              ? "border border-blue-200 bg-blue-600 text-white shadow-sm"
              : "border border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
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
              ? "border border-blue-200 bg-blue-600 text-white shadow-sm"
              : "border border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
          ].join(" ")
        }
      >
        Interviews
      </NavLink>
    </div>
  );
}
