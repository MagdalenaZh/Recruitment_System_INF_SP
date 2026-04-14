import type { ClubCategory } from "../../../types/clubs/club";

export type ClubCategoryApiValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function mapClubCategory(
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
      case "Other":
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

export function toClubCategoryApiValue(
  value: string | number | null | undefined,
): ClubCategoryApiValue {
  if (typeof value === "number" && value >= 1 && value <= 10) {
    return value as ClubCategoryApiValue;
  }

  const normalized = typeof value === "string" ? value.trim() : "";
  switch (normalized) {
    case "1":
    case "MathScience":
    case "MathSceince":
    case "Math & Science":
      return 1;
    case "2":
    case "Technology":
      return 2;
    case "3":
    case "Sports":
      return 3;
    case "4":
    case "Business":
      return 4;
    case "5":
    case "Politics":
      return 5;
    case "6":
    case "Art":
      return 6;
    case "7":
    case "MediaJournalism":
    case "Media & Journalism":
      return 7;
    case "8":
    case "Entrepreneurship":
      return 8;
    case "9":
    case "Music":
      return 9;
    case "10":
    case "Other":
    default:
      return 10;
  }
}
