import { useCallback, useEffect, useState } from "react";
import type {
  ClubAdminClubInfo,
  ClubAdminInterviewSlot,
} from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";

export function useClubAdminClubInfo() {
  const [data, setData] = useState<ClubAdminClubInfo | null>(null);
  const [interviewSlots, setInterviewSlots] = useState<
    ClubAdminInterviewSlot[]
  >([]);
  const [boardMemberRoleId, setBoardMemberRoleId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await clubAdminApi.getCurrentClubInfo();
      setData(result);

      const roles = await clubAdminApi.getAvailableRoles();
      setBoardMemberRoleId(
        roles.find((role) => role.roleName === "BoardMember")?.roleId ?? null,
      );

      const slots = await clubAdminApi.getAvailableInterviewSlots(
        result.clubId,
      );
      setInterviewSlots(
        slots.map((slot) => ({
          slotId: slot.slotId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load club info.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateOpenPositions = useCallback(
    async (departmentId: string, openPositions: number) => {
      await clubAdminApi.updateOpenPositions(departmentId, openPositions);

      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          departments: prev.departments.map((department) =>
            department.departmentId === departmentId
              ? { ...department, openPositions }
              : department,
          ),
        };
      });
    },
    [],
  );

  const updateDepartment = useCallback(
    async (
      departmentId: string,
      departmentName: string,
      numberOfOpenPositions: number,
      description: string,
    ) => {
      await clubAdminApi.updateDepartment(departmentId, {
        departmentName,
        numberOfOpenPositions,
        description,
      });

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          departments: prev.departments.map((department) =>
            department.departmentId === departmentId
              ? {
                  ...department,
                  departmentName,
                  description,
                  openPositions: numberOfOpenPositions,
                }
              : department,
          ),
        };
      });
    },
    [],
  );

  const createDepartment = useCallback(
    async (
      departmentName: string,
      numberOfOpenPositions: number,
      description: string,
    ) => {
      if (!data) {
        throw new Error("Club data not loaded.");
      }

      await clubAdminApi.createDepartment({
        clubId: data.clubId,
        departmentName,
        numberOfOpenPositions,
        description,
      });

      await load();
    },
    [data, load],
  );

  const updateClubInfo = useCallback(
    async (next: {
      clubName: string;
      description: string;
      category: string;
      requiredApprovals: number;
      applicationQuestions: string[];
    }) => {
      if (!data) {
        throw new Error("Club data not loaded.");
      }

      await clubAdminApi.updateClubInfo({
        clubId: data.clubId,
        clubName: next.clubName,
        description: next.description,
        category: next.category,
        requiredApprovals: next.requiredApprovals,
        applicationQuestions: next.applicationQuestions,
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              clubName: next.clubName,
              description: next.description,
              category: next.category,
              requiredApprovals: next.requiredApprovals,
              admissionQuestions: next.applicationQuestions,
            }
          : prev,
      );
    },
    [data],
  );

  const createInterviewSlot = useCallback(
    async (startTime: string, endTime: string) => {
      if (!data) {
        throw new Error("Club data not loaded.");
      }
      await clubAdminApi.createInterviewSlot(data.clubId, startTime, endTime);
      await load();
    },
    [data, load],
  );

  const updateInterviewSlot = useCallback(
    async (slotId: string, startTime: string, endTime: string) => {
      await clubAdminApi.updateInterviewSlot(slotId, startTime, endTime);
      setInterviewSlots((prev) =>
        prev.map((slot) =>
          slot.slotId === slotId ? { ...slot, startTime, endTime } : slot,
        ),
      );
    },
    [],
  );

  const assignBoardMember = useCallback(
    async (userId: string, departmentId: string) => {
      if (!boardMemberRoleId) {
        throw new Error('Role "BoardMember" is not available.');
      }

      if (!data) {
        throw new Error("Club data not loaded.");
      }

      await clubAdminApi.assignBoardMember(
        userId,
        departmentId,
        boardMemberRoleId,
      );

      const departmentHeads = await clubAdminApi.getDepartmentHeads(data.clubId);
      const assignedHead = departmentHeads.find(
        (head) => head.departmentId === departmentId,
      );
      const assignedName =
        assignedHead &&
        (`${assignedHead.firstName} ${assignedHead.lastName}`.trim() ||
          assignedHead.userId);

      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          departments: prev.departments.map((department) =>
            department.departmentId === departmentId
              ? {
                  ...department,
                  headUserId: assignedHead?.userId ?? userId,
                  headName: assignedName ?? userId,
                }
              : department,
          ),
        };
      });

      return assignedName;
    },
    [boardMemberRoleId, data],
  );

  return {
    data,
    interviewSlots,
    loading,
    error,
    refetch: load,
    updateOpenPositions,
    updateDepartment,
    createDepartment,
    updateClubInfo,
    createInterviewSlot,
    updateInterviewSlot,
    assignBoardMember,
  };
}
