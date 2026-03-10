import type { ClubAdminDepartment } from "../types/clubAdminTypes";
import { ClubAdminDepartmentCard } from "./ClubAdminDepartmentCard";

export function ClubAdminDepartmentCardGrid({
  departments,
}: {
  departments: ClubAdminDepartment[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <ClubAdminDepartmentCard key={d.id} d={d} />
      ))}
    </div>
  );
}
