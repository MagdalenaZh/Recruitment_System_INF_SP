import { Link } from "react-router-dom";

type Props = {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
};

export function AccessDeniedPage({
  title = "Access denied",
  message = "Your account does not have permission to open this page.",
  backTo = "/home",
  backLabel = "Go back home",
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
          Restricted area
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={backTo}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            {backLabel}
          </Link>
          <Link
            to="/home"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
