import { useEffect, useState } from "react";
import { getApplicationsForCurrentUser, getAllClubs, getDepartmentsForClub } from "../../../services/account/accountApplications.api";
import type { DepartmentDto, ClubDto, AccountApplicationCard, UserApplicationDto } from "../../../types/account/accountApplications";
import type { ApplicationStage } from "../../../types/account/applicationStage";



function mapApplicationStatusToStage(status: number): ApplicationStage {
  switch (status) {
    case 1:
      return "Submitted";
    case 2:
      return "UnderReview";
    case 3:
      return "Interview";
    case 4:
      return "Rejected";
    case 5:
      return "Accepted";
    default:
      return "Submitted";
  }
}

function buildDepartmentMap(
  departments: DepartmentDto[],
  clubs: ClubDto[],
): Map<string, { departmentName: string; clubName: string }> {
  const clubMap = new Map(
    clubs.map((club: ClubDto) => [club.clubId, club.clubName]),
  );

  const result = new Map<string, { departmentName: string; clubName: string }>();

  for (const dept of departments) {
    result.set(dept.departmentId, {
      departmentName: dept.departmentName,
      clubName: clubMap.get(dept.clubId) ?? "Unknown Club",
    });
  }

  return result;
}

export function useAccountApplications() {
  const [applications, setApplications] = useState<AccountApplicationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [userApplications, clubs] = await Promise.all([
          getApplicationsForCurrentUser(),
          getAllClubs(),
        ]);

        const departmentLists = await Promise.all(
          clubs.map((club: ClubDto) => getDepartmentsForClub(club.clubId)),
        );

        const allDepartments = departmentLists.flat();
        const departmentMap = buildDepartmentMap(allDepartments, clubs);

        const mapped: AccountApplicationCard[] = userApplications.map(
          (application: UserApplicationDto) => {
            const departmentInfo = departmentMap.get(application.departmentId);

            return {
              id: application.applicationId,
              clubName: departmentInfo?.clubName ?? "Unknown Club",
              departmentName:
                departmentInfo?.departmentName ?? "Unknown Department",
              stage: mapApplicationStatusToStage(application.applicationStatus),
              updatedAt: new Date().toISOString(),
            };
          },
        );

        setApplications(mapped);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load applications.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    applications,
    loading,
    error,
  };
}