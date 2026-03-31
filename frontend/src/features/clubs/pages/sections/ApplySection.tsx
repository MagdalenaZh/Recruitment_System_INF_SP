import { Link } from "react-router-dom";

type Props = {
  clubId: string;
  clubName: string;
  clubDescription: string;
  admissionQuestions: string[];
};

export function ApplySection({
  clubId,
  clubName,
  clubDescription,
  admissionQuestions,
}: Props) {
  return (
    <section className="bg-slate-50 pb-14 text-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Apply</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ready to apply to {clubName}?
            </p>
          </div>

          <Link
            to={`/clubs/${clubId}/apply`}
            state={{
              club: {
                clubId,
                clubName,
                description: clubDescription,
                admissionQuestions,
              },
            }}
            className="shrink-0 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply now
          </Link>
        </div>
      </div>
    </section>
  );
}
