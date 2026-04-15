import { useEffect, useMemo, useState } from "react";

type Props = {
  initialQuestions: string[];
  onSave: (questions: string[]) => Promise<void>;
};

export function ApplicationQuestionsManager({
  initialQuestions,
  onSave,
}: Props) {
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedNewQuestion = useMemo(() => newQuestion.trim(), [newQuestion]);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  function addQuestion() {
    if (!trimmedNewQuestion) return;

    setQuestions((prev) => [...prev, trimmedNewQuestion]);
    setNewQuestion("");
    setMessage(null);
    setError(null);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setMessage(null);
    setError(null);
  }

  function updateQuestion(index: number, value: string) {
    setQuestions((prev) =>
      prev.map((question, i) => (i === index ? value : question)),
    );
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const cleaned = questions
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      await onSave(cleaned);
      setQuestions(cleaned);
      setMessage("Application questions updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save questions.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Text-based application questions
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Add, remove, and edit the questions shown to applicants.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <label className="block text-sm font-medium text-slate-200">
            Add new question
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Example: Why do you want to join this club?"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400"
            />

            <button
              onClick={addQuestion}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Add question
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No questions added yet.
            </div>
          ) : (
            questions.map((question, index) => (
              <div
                key={`${question}-${index}`}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
                    {index + 1}
                  </div>

                  <input
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />

                  <button
                    onClick={() => removeQuestion(index)}
                    className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/25"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            Total questions:{" "}
            <span className="font-semibold text-white">{questions.length}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save all changes"}
          </button>
        </div>

        {message ? (
          <div className="text-sm text-emerald-300">{message}</div>
        ) : null}

        {error ? <div className="text-sm text-rose-300">{error}</div> : null}
      </div>
    </div>
  );
}
