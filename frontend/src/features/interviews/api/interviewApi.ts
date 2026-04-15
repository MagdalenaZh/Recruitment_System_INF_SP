import type {
  BookInterviewSlotRequest,
  InterviewSlot,
} from "../types/interviewTypes";
import { apiGet, apiPut } from "../../../services/api";

export async function getAvailableInterviewSlotsForClub(
  clubId: string
): Promise<InterviewSlot[]> {
  return apiGet<InterviewSlot[]>(
    `/api/recruitmentInfo/api/available-interview-slots/${clubId}`,
  );
}

export async function bookInterviewSlot(
  payload: BookInterviewSlotRequest
): Promise<{ message: string }> {
  return apiPut<typeof payload.slot, { message: string }>(
    `/api/book-interview-slot/${payload.applicationId}`,
    payload.slot,
  );
}
