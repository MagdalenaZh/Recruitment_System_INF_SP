import { Container } from "../../../../../components/layout/Container";

export function AboutSection({ about }: { about?: string }) {
  return (
    <section className="bg-slate-50 py-10 text-slate-900">
      <Container>
        <h2 className="text-xl font-semibold">About</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">
          {about ?? "No description yet."}
        </p>
      </Container>
    </section>
  );
}
