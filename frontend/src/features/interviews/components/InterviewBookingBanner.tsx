import { Link } from "react-router-dom";

interface InterviewBookingBannerProps {
  hasApprovedApplication: boolean;
  count?: number;
}

export function InterviewBookingBanner({
  hasApprovedApplication,
  count = 0,
}: InterviewBookingBannerProps) {
  if (!hasApprovedApplication) return null;

  return (
    <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
            Interview booking available
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Your application has been approved.
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {count > 1
              ? `You currently have ${count} approved applications with interview booking access.`
              : "You can now choose an available interview slot from your account."}
          </p>
        </div>

        <Link
          to="/account/interview-booking"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Book interview
        </Link>
      </div>
    </div>
  );
}
