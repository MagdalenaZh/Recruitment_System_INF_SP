import { Container } from "../../../../components/layout/Container";

export function AboutSection({ about }: { about?: string }) {
  return (
    <section className="bg-slate-50 py-14 text-slate-900">
      <Container>
        <p className="text-2xl mb-6 font-semibold uppercase tracking-[0.24em] text-blue-700">
          About
        </p>
        <div className=" rounded-[10px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] lg:grid-cols-[0.35fr_1fr]">
          <p className="max-w-auto text-base leading-8 text-slate-700">
            {about ?? "No description yet."}
          </p>
        </div>
      </Container>
    </section>
  );
}
