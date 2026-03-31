import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Container } from "../../../components/layout/Container";
import { Footer } from "../../../components/layout/Footer";

export function ApplicationFormShell(props: {
  search: string;
  setSearch: (s: string) => void;
  clubId?: string;
  clubName?: string;
  children: ReactNode;
}) {
  const { search, setSearch, clubId, clubName, children } = props;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar search={search} setSearch={setSearch} />

      {clubId && clubName ? (
        <FormHeaderSection clubId={clubId} clubName={clubName} />
      ) : null}

      <main className="flex-1">
        <Container>
          <div className="pb-16 pt-10">{children}</div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

function FormHeaderSection({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName: string;
}) {
  return (
    <section className="bg-slate-950 text-white">
      <Container>
        <div className="pb-8 pt-24">
          <Link
            to={`/clubs/${clubId}`}
            className="inline-flex text-sm text-white/70 hover:text-white"
          >
            ← Back to {clubName}
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Application Form
          </h1>

          <p className="mt-2 text-white/70">
            You’re applying for{" "}
            <span className="font-semibold text-white">{clubName}</span>.
          </p>
        </div>
      </Container>
    </section>
  );
}
