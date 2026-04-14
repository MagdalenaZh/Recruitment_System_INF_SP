export type {
  AdminDecision,
  BoardMember,
  ClubAdminApplicationDetail,
  ClubAdminApplicationListItem,
  ClubAdminClubDepartmentInfo,
  ClubAdminClubInfo,
  ClubAdminDepartment,
} from "../../../types/clubAdmin/clubAdmin";

export interface ClubAdminInterviewSlot {
  slotId: string;
  startTime: string;
  endTime: string;
}
