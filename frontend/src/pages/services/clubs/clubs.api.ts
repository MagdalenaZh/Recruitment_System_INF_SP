import type { Club } from "../../../types/club";
import { clubsMock } from "./clubs.mock.ts";

export async function getClubs(): Promise<Club[]> {
  return Promise.resolve(clubsMock);
}

export async function getClubById(clubId: string): Promise<Club | null> {
  return Promise.resolve(clubsMock.find((c) => c.clubId === clubId) ?? null);
}
