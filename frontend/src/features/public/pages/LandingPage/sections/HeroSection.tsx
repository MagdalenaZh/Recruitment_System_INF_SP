import { useEffect, useState } from "react";
import { Container } from "../../../../../components/layout/Container";
import { Button } from "../../../../../components/ui/Button";

import olympicsLogo from "../../../../../public/images/logos/aubg-olympics-logo-small.png";
import broadwayLogo from "../../../../../public/images/logos/broadway_logo.jpg";
import busLogo from "../../../../../public/images/logos/bus_logo.jpg";
import danceLogo from "../../../../../public/images/logos/dance_logo.jpg";
import debateLogo from "../../../../../public/images/logos/debate_logo.jpg";
import griffinsLogo from "../../../../../public/images/logos/griffins_logo.png";
import hubLogo from "../../../../../public/images/logos/hub-logo.png";
import imcLogo from "../../../../../public/images/logos/imc_logo.jpg";
import polygonLogo from "../../../../../public/images/logos/polygon_logo.jpg";
import tedxLogo from "../../../../../public/images/logos/tedxaubg_logo.webp";

const logos = [
  { name: "Olympics", src: olympicsLogo },
  { name: "Broadway", src: broadwayLogo },
  { name: "BUS", src: busLogo },
  { name: "Dance", src: danceLogo },
  { name: "Debate", src: debateLogo },
  { name: "Griffins", src: griffinsLogo },
  { name: "The Hub", src: hubLogo },
  { name: "Investment Management Club", src: imcLogo },
  { name: "Polygon", src: polygonLogo },
  { name: "TEDxAUBG", src: tedxLogo },
];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % logos.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute -top-24 left-1/2 z-0 h-[420px] w-[420px] -translate-x-1/2 " />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] z-0 h-[380px] w-[380px] " />

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <Container>
        <div className="relative z-10 grid min-h-screen items-center gap-10 pt-24 pb-16 lg:grid-cols-[60%_40%]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Browse clubs • See recruiting • Apply faster
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
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

          <div className="relative hidden h-[520px] items-center justify-center lg:flex">
            <div className="relative h-full w-full overflow-hidden">
              {logos.map((logo, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={logo.name}
                    className={[
                      "absolute inset-0 flex items-center justify-center px-10 transition-all duration-700 ease-in-out",
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "translate-x-12 opacity-0 pointer-events-none",
                    ].join(" ")}
                  >
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="max-h-[260px] w-auto object-contain xl:max-h-[300px]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
              {logos.map((_, index) => (
                <span
                  key={index}
                  className={[
                    "h-2.5 rounded-full transition-all duration-300",
                    index === activeIndex
                      ? "w-8 bg-blue-400"
                      : "w-2.5 bg-white/30",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
