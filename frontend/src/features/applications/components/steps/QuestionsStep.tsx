import { useEffect, useState } from "react";

import { getDepartmentsByClubId } from "../../../../services/clubs/clubs.api";
import type { ClubDepartment } from "../../../../types/clubs/club";
import type { ApplicationQuestion } from "../../../../types/application/application";
import { Field } from "../Fields";
import { Input } from "../../../../components/ui/Input";

export function QuestionsStep(props: {
  clubId: string;
  questions: ApplicationQuestion[];
  answers: Record<string, string>;
  setAnswer: (id: string, value: string) => void;
  departmentId: string;
  setDepartmentId: (id: string) => void;
  setDepartmentName: (name: string) => void;
  errors: Record<string, string>;
  departmentError: string;
  clearError: (id: string) => void;
}) {
  const {
    clubId,
    questions,
    answers,
    setAnswer,
    departmentId,
    setDepartmentId,
    setDepartmentName,
    errors,
    departmentError,
    clearError,
  } = props;

  const [departments, setDepartments] = useState<ClubDepartment[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    setLoadingDepts(true);
    getDepartmentsByClubId(clubId)
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setLoadingDepts(false));
  }, [clubId]);

  function handleDepartmentChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    const found = departments.find((d) => d.departmentId === id);
    setDepartmentId(id);
    setDepartmentName(found?.departmentName ?? "");
  }

  return (
    <div className="mt-8 grid gap-4">
      <Field label="Department" required error={departmentError}>
        <select
          value={departmentId}
          onChange={handleDepartmentChange}
          disabled={loadingDepts}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="" disabled>
            {loadingDepts ? "Loading departments..." : "Select a department..."}
          </option>
          {departments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.departmentName}
            </option>
          ))}
        </select>
      </Field>

      {questions.length === 0 ? (
        <div className="text-sm text-slate-600">No extra questions.</div>
      ) : (
        questions.map((q) => (
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
        ))
      )}
    </div>
  );
}
