import { Link, useParams } from "react-router-dom";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { BoardSectionNav } from "../components/BoardSectionNav";

const mockSchedule = [
  {
    date: "12.09.2026",
    slots: [
      {
        id: "1",
        time: "19:30",
        candidateName: "Alexander B.",
        status: "Completed",
      },
      {
        id: "2",
        time: "19:45",
        candidateName: "Maria A.",
        status: "Live now",
      },
      {
        id: "3",
        time: "20:00",
        candidateName: "Ivan P.",
        status: "Upcoming",
      },
    ],
  },
  {
    date: "13.09.2026",
    slots: [
      {
        id: "4",
        time: "19:30",
        candidateName: "Elena D.",
        status: "Upcoming",
      },
      {
        id: "5",
        time: "19:45",
        candidateName: "Nikolay S.",
        status: "Upcoming",
      },
    ],
  },
  {
    date: "14.09.2026",
    slots: [
      {
        id: "6",
        time: "20:15",
        candidateName: "Petar K.",
        status: "Upcoming",
      },
    ],
  },
];

export function BoardDepartmentInterviewsPage() {
  const { departmentId } = useParams<{ departmentId: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950">
      <Navbar />

      <div className="pt-28">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <Link
            to="/board/interviews"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            ← Back to interview departments
          </Link>

          <div className="mt-4">
            <h1 className="text-3xl font-semibold text-white">
              Interview Schedule
            </h1>
            <p className="mt-2 text-slate-300">
              Department:{" "}
              <span className="font-semibold text-white">{departmentId}</span>
            </p>
          </div>

          <BoardSectionNav />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-slate-300">Approved so far</div>
              <div className="mt-2 text-2xl font-semibold">8</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-slate-300">Rejected so far</div>
              <div className="mt-2 text-2xl font-semibold">5</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-slate-300">Pending decision</div>
              <div className="mt-2 text-2xl font-semibold">3</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-slate-300">Recommended limit</div>
              <div className="mt-2 text-2xl font-semibold">12</div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {mockSchedule.map((group) => (
              <section
                key={group.date}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
              >
                <h2 className="text-xl font-semibold text-white">
                  {group.date}
                </h2>

                <div className="mt-4 space-y-3">
                  {group.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {slot.time} — {slot.candidateName}
                        </div>
                        <div className="mt-1 text-sm text-slate-300">
                          Status: {slot.status}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
                      >
                        Open details
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
