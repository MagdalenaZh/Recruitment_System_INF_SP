import type { BoardDepartment } from "../types/boardTypes";
import { DepartmentCard } from "./DepartmentCard";

export function DepartmentCardGrid({
  departments,
}: {
  departments: BoardDepartment[];
}) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <DepartmentCard key={d.departmentId} d={d} />
      ))}
    </div>
  );
}
