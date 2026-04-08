import type {
  ClubDepartment,
  ClubDetails,
  ClubListItem,
  ClubCategory,
} from "../../types/clubs/club";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

const RECRUITMENT_INFO_BASE = `${API_BASE}/api/recruitmentInfo/api`;

type RawClubListItem = {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: number | string | null;
};

function mapClubCategory(
  value: number | string | null | undefined,
): ClubCategory {
  if (typeof value === "string") {
    const normalized = value.trim();

    switch (normalized) {
      case "1":
      case "MathScience":
      case "MathSceince":
      case "Math & Science":
        return "Math & Science";
      case "2":
      case "Technology":
        return "Technology";
      case "3":
      case "Sports":
        return "Sports";
      case "4":
      case "Business":
        return "Business";
      case "5":
      case "Politics":
        return "Politics";
      case "6":
      case "Art":
        return "Art";
      case "7":
      case "MediaJournalism":
      case "Media & Journalism":
        return "Media & Journalism";
      case "8":
      case "Entrepreneurship":
        return "Entrepreneurship";
      case "9":
      case "Music":
        return "Music";
      case "10":
      default:
        return "Other";
    }
  }

  switch (value) {
    case 1:
      return "Math & Science";
    case 2:
      return "Technology";
    case 3:
      return "Sports";
    case 4:
      return "Business";
    case 5:
      return "Politics";
    case 6:
      return "Art";
    case 7:
      return "Media & Journalism";
    case 8:
      return "Entrepreneurship";
    case 9:
      return "Music";
    case 10:
    default:
      return "Other";
  }
}

function mapClubListItem(raw: RawClubListItem): ClubListItem {
  return {
    clubId: raw.clubId,
    clubName: raw.clubName,
    admissionQuestions: raw.admissionQuestions,
    description: raw.description,
    category: mapClubCategory(raw.category),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getClubs(): Promise<ClubListItem[]> {
  const response = await fetch(`${RECRUITMENT_INFO_BASE}/clubs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const rawClubs = await handleResponse<RawClubListItem[]>(response);
  return rawClubs.map(mapClubListItem);
}

export async function getClubById(clubId: string): Promise<ClubListItem | null> {
  const clubs = await getClubs();
  return clubs.find((c) => c.clubId === clubId) ?? null;
}

export async function getDepartmentsByClubId(
  clubId: string,
): Promise<ClubDepartment[]> {
  const response = await fetch(
    `${RECRUITMENT_INFO_BASE}/departments-club/${clubId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return handleResponse<ClubDepartment[]>(response);
}

export async function getClubDetailsById(
  clubId: string,
): Promise<ClubDetails | null> {
  const club = await getClubById(clubId);

  if (!club) return null;

  const departments = await getDepartmentsByClubId(clubId);

  return {
    clubId: club.clubId,
    clubName: club.clubName,
    description: club.description,
    admissionQuestions: club.admissionQuestions,
    departments,
    category: club.category,
  };
}