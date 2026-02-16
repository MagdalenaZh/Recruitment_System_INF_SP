import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <Container>
        <div className="flex flex-col gap-2 py-10 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} AUBG Clubs</p>
          <p className="text-white/55">
            Built for student organizations at AUBG.
          </p>
        </div>
      </Container>
    </footer>
  );
}
