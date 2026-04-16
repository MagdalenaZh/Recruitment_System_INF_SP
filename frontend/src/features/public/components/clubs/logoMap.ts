import olympicsLogo from "../../../../public/images/logos/aubg-olympics-logo-small.png";
import broadwayLogo from "../../../../public/images/logos/broadway_logo.jpg";
import busLogo from "../../../../public/images/logos/bus_logo.jpg";
import danceLogo from "../../../../public/images/logos/dance_logo.jpg";
import debateLogo from "../../../../public/images/logos/debate_logo.jpg";
import griffinsLogo from "../../../../public/images/logos/griffins_logo.png";
import hubLogo from "../../../../public/images/logos/hub-logo.png";
import imcLogo from "../../../../public/images/logos/imc_logo.jpg";
import polygonLogo from "../../../../public/images/logos/polygon_logo.jpg";
import tedxLogo from "../../../../public/images/logos/tedxaubg_logo.webp";

export const clubLogos: Record<string, string> = {
  olympics: olympicsLogo,
  broadway: broadwayLogo,
  bus: busLogo,
  dance: danceLogo,
  debate: debateLogo,
  griffins: griffinsLogo,
  hub: hubLogo,
  imc: imcLogo,
  polygon: polygonLogo,
  tedxaubg: tedxLogo,
  tedx: tedxLogo,
};

export function getClubLogo(clubName: string): string | undefined {
  const normalized = clubName.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized.includes("olympics")) return clubLogos.olympics;
  if (normalized.includes("broadway")) return clubLogos.broadway;
  if (normalized.includes("bus")) return clubLogos.bus;
  if (normalized.includes("dance")) return clubLogos.dance;
  if (normalized.includes("debate")) return clubLogos.debate;
  if (normalized.includes("griffins")) return clubLogos.griffins;
  if (normalized.includes("hub")) return clubLogos.hub;
  if (normalized.includes("investment")) return clubLogos.imc;
  if (normalized.includes("polygon")) return clubLogos.polygon;
  if (normalized.includes("tedx")) return clubLogos.tedxaubg;

  return undefined;
}