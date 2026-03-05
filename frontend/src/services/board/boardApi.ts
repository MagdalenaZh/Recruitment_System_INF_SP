import { buildDepartments, createMockStore, toListItem } from "../../mocks/boardMockData";
import type { BoardApi, BoardVote, VoteResult } from "../../features/board/types/boardTypes";

const store = createMockStore();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const boardApi: BoardApi = {
  async getDepartments() {
    await sleep(200);
    const apps = store.getAll();
    return buildDepartments(apps);
  },

  async getApplicationsByDepartment(departmentId: string) {
    await sleep(250);
    return store.findByDepartment(departmentId).map(toListItem);
  },

  async getApplicationDetail(applicationId: string) {
    await sleep(250);
    return store.findById(applicationId);
  },

  async voteOnApplication(applicationId: string, vote: BoardVote): Promise<VoteResult> {
    await sleep(250);
    const updated = store.vote(applicationId, vote);

    return {
      applicationId: updated.id,
      approvalsCount: updated.approvalsCount,
      requiredApprovals: updated.requiredApprovals,
      status: updated.status,
      myVote: updated.myVote ?? null,
    };
  },
};