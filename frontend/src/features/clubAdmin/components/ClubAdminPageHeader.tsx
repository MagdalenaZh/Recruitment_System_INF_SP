import { Link } from "react-router-dom";

type Props = {
  backTo: string;
  backLabel: string;
  title: string;
  description: string;
  onRefresh?: () => void;
  refreshLabel?: string;
};

export function ClubAdminPageHeader({
  backTo,
  backLabel,
  title,
  description,
  onRefresh,
  refreshLabel = "Refresh",
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          to={backTo}
          className="text-sm font-semibold text-slate-300 hover:text-white hover:underline"
        >
          ← {backLabel}
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 max-w-3xl text-slate-300">{description}</p>
      </div>

      {onRefresh ? (
        <button
          onClick={onRefresh}
          className="w-fit rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          {refreshLabel}
        </button>
      ) : null}
    </div>
  );
}
