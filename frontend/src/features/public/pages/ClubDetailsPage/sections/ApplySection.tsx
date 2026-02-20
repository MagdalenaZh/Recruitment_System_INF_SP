import { Link } from "react-router-dom";
import { Container } from "../../../../../components/layout/Container";
import { Button } from "../../../../../components/ui/Button";

export function ApplySection({
  clubId,
  isRecruiting,
}: {
  clubId: string;
  isRecruiting: boolean;
}) {
  return (
    <section className="bg-slate-50 pb-16 text-slate-900">
      <Container>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">Want to join?</div>
              <p className="mt-1 text-sm text-slate-600">
                Fill out the application form for this club.
              </p>
            </div>

            <Link to={`/clubs/${clubId}/apply`} className="inline-flex">
              <Button disabled={!isRecruiting} type="button">
                {isRecruiting ? "Apply now" : "Applications closed"}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
