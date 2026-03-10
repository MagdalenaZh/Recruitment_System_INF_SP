import { Link } from "react-router-dom";

type Props = {
  title: string;
  description: string;
  to: string;
};

export function ClubAdminHomeCard({ title, description, to }: Props) {
  return (
    <Link
      to={to}
      className="group block rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md shadow-lg transition hover:-translate-y-1 hover:bg-white/15"
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        </div>

        <div className="text-sm font-semibold text-blue-200 transition group-hover:text-white">
          Open →
        </div>
      </div>
    </Link>
  );
}
