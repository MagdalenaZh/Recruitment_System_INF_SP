import type { ApplicationQuestion } from "../../../../types/application/application";
import type { PersonalInfo } from "../../../../types/application/application";

import { SummaryCard } from "../SummaryCard";

export function ReviewStep(props: {
  personal: PersonalInfo;
  questions: ApplicationQuestion[];
  answers: Record<string, string>;
}) {
  const { personal, questions, answers } = props;

  return (
    <div className="mt-8 grid gap-6">
      <SummaryCard title="Personal info">
        <div className="text-sm text-slate-700">
          {personal.firstName} {personal.lastName} • {personal.email}
          {personal.phone?.trim() ? ` • ${personal.phone}` : null}
        </div>
      </SummaryCard>

      <SummaryCard title="Your answers">
        {questions.length === 0 ? (
          <div className="text-sm text-slate-600">No extra answers.</div>
        ) : (
          <div className="grid gap-3">
            {questions.map((q) => (
              <div key={q.id} className="text-sm">
                <div className="font-medium text-slate-800">{q.label}</div>
                <div className="mt-1 text-slate-600">
                  {String(answers[q.id] ?? "").trim() || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </SummaryCard>
    </div>
  );
}
