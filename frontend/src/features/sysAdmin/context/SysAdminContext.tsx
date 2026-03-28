import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ClubAdminAssignment,
  CreateClubInput,
  SysAdminClub,
  SysAdminUser,
} from "../types/sysAdminTypes";
import {
  mockClubAdminAssignments,
  mockSysAdminClubs,
  mockSysAdminUsers,
} from "../../../mocks/sysAdminMock";

type SysAdminContextType = {
  clubs: SysAdminClub[];
  users: SysAdminUser[];
  assignments: ClubAdminAssignment[];
  adminCandidates: SysAdminUser[];
  promotableUsers: SysAdminUser[];
  addClub: (input: CreateClubInput) => void;
  assignClubAdmin: (clubId: string, adminId: string) => void;
  promoteToClubAdmin: (userId: string) => void;
  getAssignedAdmin: (clubId: string) => SysAdminUser | undefined;
};

const SysAdminContext = createContext<SysAdminContextType | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function SysAdminProvider({ children }: { children: ReactNode }) {
  const [clubs, setClubs] = useState<SysAdminClub[]>(mockSysAdminClubs);
  const [users, setUsers] = useState<SysAdminUser[]>(mockSysAdminUsers);
  const [assignments, setAssignments] = useState<ClubAdminAssignment[]>(
    mockClubAdminAssignments,
  );

  const adminCandidates = useMemo(
    () => users.filter((user) => user.role === "clubAdmin"),
    [users],
  );

  const promotableUsers = useMemo(
    () => users.filter((user) => user.role === "applicant"),
    [users],
  );

  function addClub(input: CreateClubInput) {
    const newClub: SysAdminClub = {
      id: makeId("club"),
      name: input.name.trim(),
      shortName: input.shortName.trim().toUpperCase(),
      category: input.category.trim(),
      description: input.description.trim(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setClubs((prev) => [newClub, ...prev]);
  }

  function assignClubAdmin(clubId: string, adminId: string) {
    setAssignments((prev) => {
      const existing = prev.find((item) => item.clubId === clubId);

      if (existing) {
        return prev.map((item) =>
          item.clubId === clubId
            ? { ...item, adminId, assignedAt: new Date().toISOString() }
            : item,
        );
      }

      return [
        ...prev,
        {
          clubId,
          adminId,
          assignedAt: new Date().toISOString(),
        },
      ];
    });
  }

  function promoteToClubAdmin(userId: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: "clubAdmin" } : user,
      ),
    );
  }

  function getAssignedAdmin(clubId: string) {
    const assignment = assignments.find((item) => item.clubId === clubId);
    if (!assignment) return undefined;
    return users.find((user) => user.id === assignment.adminId);
  }

  return (
    <SysAdminContext.Provider
      value={{
        clubs,
        users,
        assignments,
        adminCandidates,
        promotableUsers,
        addClub,
        assignClubAdmin,
        promoteToClubAdmin,
        getAssignedAdmin,
      }}
    >
      {children}
    </SysAdminContext.Provider>
  );
}

export function useSysAdmin() {
  const context = useContext(SysAdminContext);

  if (!context) {
    throw new Error("useSysAdmin must be used inside SysAdminProvider");
  }

  return context;
}
