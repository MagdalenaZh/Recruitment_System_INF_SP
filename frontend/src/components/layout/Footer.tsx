import { Container } from "./Container";

type FooterProps = {
  tone?: "dark" | "light";
};

export function Footer({ tone = "dark" }: FooterProps) {
  const footerClassName =
    tone === "light"
      ? "border-t border-slate-200/80 bg-white/75 text-slate-700 backdrop-blur-md"
      : "bg-slate-950 text-white";
  const dividerClassName =
    tone === "light"
      ? "bg-gradient-to-r from-transparent via-slate-300/80 to-transparent"
      : "bg-gradient-to-r from-transparent via-white/15 to-transparent";
  const bodyTextClassName =
    tone === "light" ? "text-slate-600" : "text-white/70";
  const metaTextClassName =
    tone === "light" ? "text-slate-500" : "text-white/55";

  return (
    <footer className={footerClassName}>
      <div className={`h-px w-full ${dividerClassName}`} />
      <Container>
        <div
          className={`flex flex-col gap-2 py-8 text-sm md:flex-row md:items-center md:justify-between ${bodyTextClassName}`}
        >
          <p>&copy; {new Date().getFullYear()} AUBG Clubs</p>
          <p className={metaTextClassName}>
            Built for student organizations at AUBG.
          </p>
        </div>
      </Container>
    </footer>
  );
}
