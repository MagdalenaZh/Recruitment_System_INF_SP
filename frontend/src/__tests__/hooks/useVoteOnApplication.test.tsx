import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useVoteOnApplication } from "../../features/board/hooks/useVoteOnApplication";
import type { ApplicationDetail } from "../../features/board/types/boardTypes";

//  Module mocks 

vi.mock("../../services/board/boardApi", () => ({
  boardApi: {
    voteOnApplication: vi.fn(),
    approveApplication: vi.fn(),
    disapproveApplication: vi.fn(),
    afterInterviewApproveApplication: vi.fn(),
    afterInterviewDisapproveApplication: vi.fn(),
  },
}));

import { boardApi } from "../../services/board/boardApi";

//  Fixtures 

function makeApplication(
  status: ApplicationDetail["status"],
  overrides: Partial<ApplicationDetail> = {},
): ApplicationDetail {
  return {
    id: "app-1",
    applicantName: "John Smith",
    applicantEmail: "john@example.com",
    status,
    approvalsCount: 1,
    requiredApprovals: 2,
    totalVotes: 1,
    approveVotes: 1,
    rejectVotes: 0,
    myVote: null,
    submittedAt: "2024-01-01",
    departmentId: "dept-1",
    departmentName: "Engineering",
    userId: "user-1",
    answers: [],
    attachments: [],
    ...overrides,
  };
}

//  Route selection based on status 

describe("vote() – API endpoint routing by status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(boardApi.voteOnApplication).mockResolvedValue(undefined);
    vi.mocked(boardApi.afterInterviewApproveApplication).mockResolvedValue(undefined);
    vi.mocked(boardApi.afterInterviewDisapproveApplication).mockResolvedValue(undefined);
  });

  it("routes Pending status through voteOnApplication (Approve)", async () => {
    const { result } = renderHook(() => useVoteOnApplication());
    await act(async () => {
      await result.current.vote("app-1", "Approve", makeApplication("Pending"));
    });
    expect(boardApi.voteOnApplication).toHaveBeenCalledWith("app-1", "Approve");
  });

  it("routes Pending status through voteOnApplication (Reject)", async () => {
    const { result } = renderHook(() => useVoteOnApplication());
    await act(async () => {
      await result.current.vote("app-1", "Reject", makeApplication("Pending"));
    });
    expect(boardApi.voteOnApplication).toHaveBeenCalledWith("app-1", "Reject");
  });

  it("routes Submitted status through voteOnApplication", async () => {
    const { result } = renderHook(() => useVoteOnApplication());
    await act(async () => {
      await result.current.vote("app-1", "Approve", makeApplication("Submitted"));
    });
    expect(boardApi.voteOnApplication).toHaveBeenCalledWith("app-1", "Approve");
  });

  it("routes Interview + Approve through afterInterviewApproveApplication", async () => {
    const { result } = renderHook(() => useVoteOnApplication());
    await act(async () => {
      await result.current.vote("app-1", "Approve", makeApplication("Interview"));
    });
    expect(boardApi.afterInterviewApproveApplication).toHaveBeenCalledWith("app-1");
    expect(boardApi.afterInterviewDisapproveApplication).not.toHaveBeenCalled();
  });

  it("routes Interview + Reject through afterInterviewDisapproveApplication", async () => {
    const { result } = renderHook(() => useVoteOnApplication());
    await act(async () => {
      await result.current.vote("app-1", "Reject", makeApplication("Interview"));
    });
    expect(boardApi.afterInterviewDisapproveApplication).toHaveBeenCalledWith("app-1");
    expect(boardApi.afterInterviewApproveApplication).not.toHaveBeenCalled();
  });
});

//  Return value on success 

describe("vote() – return value on success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(boardApi.voteOnApplication).mockResolvedValue(undefined);
  });

  it("returns a VoteResult reflecting the submitted decision", async () => {
    const application = makeApplication("Pending", {
      approvalsCount: 1,
      requiredApprovals: 3,
      totalVotes: 2,
      approveVotes: 1,
      rejectVotes: 1,
    });

    const { result } = renderHook(() => useVoteOnApplication());

    let voteResult: Awaited<ReturnType<typeof result.current.vote>>;
    await act(async () => {
      voteResult = await result.current.vote("app-1", "Approve", application);
    });

    expect(voteResult!).toEqual({
      approvalsCount: 1,
      requiredApprovals: 3,
      totalVotes: 2,
      approveVotes: 1,
      rejectVotes: 1,
      status: "Pending",
      myVote: "Approve",
    });
  });
});

//  Error handling 

describe("vote() – error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null and sets an error message when the API call fails", async () => {
    vi.mocked(boardApi.voteOnApplication).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useVoteOnApplication());

    let voteResult: Awaited<ReturnType<typeof result.current.vote>>;
    await act(async () => {
      voteResult = await result.current.vote(
        "app-1",
        "Approve",
        makeApplication("Pending"),
      );
    });

    expect(voteResult!).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("sets error to fallback message when the thrown value is not an Error", async () => {
    vi.mocked(boardApi.voteOnApplication).mockRejectedValue("unexpected");

    const { result } = renderHook(() => useVoteOnApplication());

    await act(async () => {
      await result.current.vote("app-1", "Approve", makeApplication("Pending"));
    });

    expect(result.current.error).toBe("Unknown error");
  });

  it("returns null and sets error for an unvotable application status", async () => {
    const { result } = renderHook(() => useVoteOnApplication());

    let voteResult: Awaited<ReturnType<typeof result.current.vote>>;
    await act(async () => {
      voteResult = await result.current.vote(
        "app-1",
        "Approve",
        makeApplication("Approved"),
      );
    });

    expect(voteResult!).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});

//  Loading state 

describe("vote() – loading state", () => {
  it("exposes loading=true during the API call, then false after", async () => {
    let resolveVote!: () => void;
    vi.mocked(boardApi.voteOnApplication).mockReturnValue(
      new Promise<void>((res) => {
        resolveVote = res;
      }),
    );

    const { result } = renderHook(() => useVoteOnApplication());

    act(() => {
      void result.current.vote("app-1", "Approve", makeApplication("Pending"));
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveVote();
    });

    expect(result.current.loading).toBe(false);
  });

  it("starts with loading=false and error=null", () => {
    const { result } = renderHook(() => useVoteOnApplication());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
