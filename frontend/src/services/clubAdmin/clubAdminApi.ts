import type { AdminDecision, ClubAdminApi } from "../../features/clubAdmin/types/clubAdminTypes";
import { createClubAdminMockStore } from "../../mocks/clubAdminMockData";


const store = createClubAdminMockStore();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const clubAdminApi: ClubAdminApi = {
  async getDepartments() {
    await sleep(200);
    return store.getDepartments();
  },

  async getApplicationsByDepartment(departmentId: string) {
    await sleep(220);
    return store.getApplicationsByDepartment(departmentId);
  },

  async getApplicationDetail(applicationId: string) {
    await sleep(220);
    return store.getApplicationDetail(applicationId);
  },

  async finalizeApplication(applicationId: string, decision: AdminDecision) {
    await sleep(220);
    return store.finalizeApplication(applicationId, decision);
  },

  async getBoardMembers() {
    await sleep(220);
    return store.getBoardMembers();
  },
};