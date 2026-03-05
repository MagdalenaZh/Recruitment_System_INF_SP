import type { ApplicationAnswer } from "../types/boardTypes";

export function ApplicationAnswersSection({
  answers,
}: {
  answers: ApplicationAnswer[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Application answers
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        {answers.map((a, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="text-sm font-semibold text-slate-900">
              {a.question}
            </div>
            <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
              {a.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
