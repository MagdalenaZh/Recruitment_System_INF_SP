import { Container } from "../../../../components/layout/Container";
import type { ClubDetails } from "../../../../types/clubs/club";

import hubLogo from "../../../../public/images/logos/hub-logo.png";
import hackImage from "../../../../public/images/hubPics/hack.jpg";
import hubconfImage from "../../../../public/images/hubPics/hubconf.jpg";
import teamImage from "../../../../public/images/hubPics/team.png";

export function HeaderSection({ club }: { club: ClubDetails }) {
  const galleryCards = [
    {
      label: "Club Events",
      image: hackImage,
    },
    {
      label: "Events and teamwork",
      image: hubconfImage,
    },
    {
      label: "The team",
      image: teamImage,
    },
  ];

  return (
    <section className="mt-6 pb-12">
      <Container>
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_32px_70px_-45px_rgba(15,23,42,0.8)] ring-1 ring-white/10 backdrop-blur md:p-8">
          <div className="grid gap-8 lg:grid-cols-[40%_60%] lg:items-stretch">
            <div className="flex h-full flex-col items-center justify-center p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.75)]">
              <div className="flex h-30 w-30 items-center justify-center sm:h-70 sm:w-70">
                <img
                  src={hubLogo}
                  alt={`${club.clubName} logo`}
                  className="h-full w-full object-contain"
                />
              </div>

              <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl xl:text-7xl">
                {club.clubName}
              </h1>

              <span className="mt-5 inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                {club.category}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:grid-rows-[1fr_1fr]">
              {galleryCards.map((card, index) => (
                <div
                  key={card.label}
                  className={[
                    "group relative overflow-hidden rounded-[28px] border border-white/10 ring-1 ring-white/5 transition-transform duration-300 hover:-translate-y-1",
                    index === 2
                      ? "md:col-span-2 min-h-[220px]"
                      : "min-h-[210px]",
                  ].join(" ")}
                >
                  <img
                    src={card.image}
                    alt={card.label}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/25 to-transparent" />

                  <div className="relative flex h-full flex-col justify-between p-5">
                    <div>
                      <div className="text-xl font-semibold text-white">
                        {card.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
