import { Container } from "../../../../../components/layout/Container";
import { Button } from "../../../../../components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute -top-24 left-1/2 z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] z-0 h-[380px] w-[380px] rounded-full bg-sky-400/10 blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <Container>
        <div className="relative z-10 flex min-h-screen items-center pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Browse clubs • See recruiting • Apply faster
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
              Discover AUBG clubs.
              <span className="block text-blue-300">Join what fits you.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base text-white/75 md:text-lg">
              One place to explore student organizations, filter by category,
              and check who’s actively recruiting right now.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#clubs" className="inline-flex">
                <Button type="button">Browse clubs</Button>
              </a>

              <a href="/register" className="inline-flex">
                <Button variant="secondary" type="button">
                  Create account
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
