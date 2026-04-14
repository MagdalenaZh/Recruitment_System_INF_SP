import type {
  ClubDepartment,
  ClubDetails,
  ClubListItem,
} from "../../types/clubs/club";
import { mapClubCategory } from "../../features/public/utils/clubCategory";

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
