import { InterviewSlotCard } from "./InterviewSlotCard";
import type { InterviewSlot } from "../types/interviewTypes";

interface InterviewSlotsCalendarProps {
  slots: InterviewSlot[];
  onBook: (slotId: string) => void;
  booking?: boolean;
}

function groupSlotsByDay(slots: InterviewSlot[]) {
  return slots.reduce<Record<string, InterviewSlot[]>>((acc, slot) => {
    const key = new Date(slot.startTime).toDateString();

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(slot);
    return acc;
  }, {});
}

export function InterviewSlotsCalendar({
  slots,
  onBook,
  booking = false,
}: InterviewSlotsCalendarProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          No open interview slots right now
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Check back later or wait for the club to publish more interview times.
        </p>
      </div>
    );
  }

  const grouped = groupSlotsByDay(slots);
  const entries = Object.entries(grouped).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return (
    <div className="space-y-5">
      {entries.map(([day, daySlots]) => {
        const date = new Date(day);

        return (
          <section
            key={day}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Interview day
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {date.toLocaleDateString([], {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
              </div>

              <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {daySlots.length} slot{daySlots.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {daySlots
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
                )
                .map((slot) => (
                  <InterviewSlotCard
                    key={slot.slotId}
                    slot={slot}
                    onBook={onBook}
                    disabled={booking}
                  />
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
