import type { ApplicationQuestion } from "../../../../types/application/application";
import { Input } from "../../../../components/ui/Input";
import { Field } from "../Fields";

export function QuestionsStep(props: {
  questions: ApplicationQuestion[];
  answers: Record<string, string>;
  setAnswer: (id: string, value: string) => void;
  errors: Record<string, string>;
  clearError: (id: string) => void;
}) {
  const { questions, answers, setAnswer, errors, clearError } = props;

  if (questions.length === 0) {
    return (
      <div className="mt-8 text-sm text-slate-600">No extra questions.</div>
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {questions.map((q) => (
        <Field
          key={q.id}
          label={q.label}
          required={!!q.required}
          error={errors[q.id]}
        >
          {q.type === "text" && (
            <Input
              value={answers[q.id] ?? ""}
              onChange={(e) => {
                setAnswer(q.id, e.target.value);
                clearError(q.id);
              }}
            />
          )}

          {q.type === "textarea" && (
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => {
                setAnswer(q.id, e.target.value);
                clearError(q.id);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-400"
              rows={5}
            />
          )}

          {q.type === "select" && (
            <select
              value={answers[q.id] ?? ""}
              onChange={(e) => {
                setAnswer(q.id, e.target.value);
                clearError(q.id);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select...
              </option>
              {(q.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </Field>
      ))}
    </div>
  );
}
