import type { InterviewSlot } from "../types/interviewTypes";

interface InterviewSlotCardProps {
  slot: InterviewSlot;
  onBook: (slotId: string) => void;
  disabled?: boolean;
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function InterviewSlotCard({
  slot,
  onBook,
  disabled = false,
}: InterviewSlotCardProps) {
  const start = new Date(slot.startTime);

  return (
    <button
      type="button"
      onClick={() => onBook(slot.slotId)}
      disabled={disabled}
      className="group flex w-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
        Available slot
      </span>

      <span className="mt-3 text-lg font-semibold text-slate-900">
        {formatTimeRange(slot.startTime, slot.endTime)}
      </span>

      <span className="mt-1 text-sm text-slate-600">
        {start.toLocaleDateString([], {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>

      <span className="mt-4 inline-flex w-fit rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-600 ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
        {disabled ? "Booking..." : "Book this slot"}
      </span>
    </button>
  );
}
