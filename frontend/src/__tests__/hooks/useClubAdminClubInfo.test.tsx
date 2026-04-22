import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useClubAdminClubInfo } from "../../features/clubAdmin/hooks/useClubAdminClubInfo";
import type { ClubAdminClubInfo } from "../../features/clubAdmin/types/clubAdminTypes";

//  Module mocks

vi.mock("../../services/clubAdmin/clubAdminApi", () => ({
  clubAdminApi: {
    getCurrentClubInfo: vi.fn(),
    getDepartmentHeads: vi.fn(),
    getAvailableRoles: vi.fn(),
    getAvailableInterviewSlots: vi.fn(),
    updateOpenPositions: vi.fn(),
    updateDepartment: vi.fn(),
    createDepartment: vi.fn(),
    updateClubInfo: vi.fn(),
    createInterviewSlot: vi.fn(),
    updateInterviewSlot: vi.fn(),
    assignBoardMember: vi.fn(),
  },
}));

import { clubAdminApi } from "../../services/clubAdmin/clubAdminApi";

//  Fixtures

const mockClubInfo: ClubAdminClubInfo = {
  clubId: "club-1",
  clubName: "Chess Club",
  description: "We play chess.",
  category: "Academic",
  requiredApprovals: 2,
  admissionQuestions: ["Why chess?"],
  departments: [
    {
      departmentId: "dept-1",
      departmentName: "Beginners",
      description: "For new players",
      openPositions: 5,
      headName: null,
      headUserId: null,
    },
    {
      departmentId: "dept-2",
      departmentName: "Advanced",
      description: "For experienced players",
      openPositions: 3,
      headName: null,
      headUserId: null,
    },
  ],
};

const mockSlots = [
  {
    slotId: "slot-1",
    startTime: "2024-06-01T10:00:00",
    endTime: "2024-06-01T10:30:00",
  },
  {
    slotId: "slot-2",
    startTime: "2024-06-01T11:00:00",
    endTime: "2024-06-01T11:30:00",
  },
];

function setupSuccessfulLoad() {
  vi.mocked(clubAdminApi.getCurrentClubInfo).mockResolvedValue(mockClubInfo);
  vi.mocked(clubAdminApi.getDepartmentHeads).mockResolvedValue([]);
  vi.mocked(clubAdminApi.getAvailableRoles).mockResolvedValue([
    { roleId: "role-1", roleName: "BoardMember" },
  ]);
  vi.mocked(clubAdminApi.getAvailableInterviewSlots).mockResolvedValue(
    mockSlots,
  );
}

//  Initial load

describe("initial load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
  });

  it("fetches club info, roles, and interview slots on mount", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(clubAdminApi.getCurrentClubInfo).toHaveBeenCalledOnce();
    expect(clubAdminApi.getAvailableRoles).toHaveBeenCalledOnce();
    expect(clubAdminApi.getAvailableInterviewSlots).toHaveBeenCalledWith(
      "club-1",
    );
  });

  it("populates data and interviewSlots after a successful load", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockClubInfo);
    expect(result.current.interviewSlots).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("keeps department head info returned by the club info payload", async () => {
    vi.mocked(clubAdminApi.getCurrentClubInfo).mockResolvedValue({
      ...mockClubInfo,
      departments: mockClubInfo.departments.map((department) =>
        department.departmentId === "dept-1"
          ? {
              ...department,
              headUserId: "user-99",
              headName: "Alice Wonderland",
            }
          : department,
      ),
    });

    const { result } = renderHook(() => useClubAdminClubInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = result.current.data!.departments.find(
      (d) => d.departmentId === "dept-1",
    );
    expect(updated!.headUserId).toBe("user-99");
    expect(updated!.headName).toBe("Alice Wonderland");
  });

  it("sets error when the API call throws", async () => {
    vi.mocked(clubAdminApi.getCurrentClubInfo).mockRejectedValue(
      new Error("Server error"),
    );

    const { result } = renderHook(() => useClubAdminClubInfo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Server error");
    expect(result.current.data).toBeNull();
  });
});

//  updateOpenPositions

describe("updateOpenPositions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(clubAdminApi.updateOpenPositions).mockResolvedValue({
      message: "Updated",
    });
  });

  it("calls the API with the correct arguments", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateOpenPositions("dept-1", 10);
    });

    expect(clubAdminApi.updateOpenPositions).toHaveBeenCalledWith("dept-1", 10);
  });

  it("updates the matching department's open positions in local state", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateOpenPositions("dept-1", 10);
    });

    const updated = result.current.data!.departments.find(
      (d) => d.departmentId === "dept-1",
    );
    expect(updated!.openPositions).toBe(10);
  });

  it("does not affect other departments", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateOpenPositions("dept-1", 10);
    });

    const untouched = result.current.data!.departments.find(
      (d) => d.departmentId === "dept-2",
    );
    expect(untouched!.openPositions).toBe(3);
  });
});

//  updateDepartment

describe("updateDepartment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(clubAdminApi.updateDepartment).mockResolvedValue({
      message: "Updated",
    });
  });

  it("updates the department's name, positions, and description in state", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateDepartment(
        "dept-1",
        "Novices",
        8,
        "Revised desc",
      );
    });

    const updated = result.current.data!.departments.find(
      (d) => d.departmentId === "dept-1",
    );
    expect(updated!.departmentName).toBe("Novices");
    expect(updated!.openPositions).toBe(8);
    expect(updated!.description).toBe("Revised desc");
  });
});

//  updateClubInfo

describe("updateClubInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(clubAdminApi.updateClubInfo).mockResolvedValue({ message: "OK" });
  });

  it("calls the API and updates club metadata in state", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const next = {
      clubName: "Chess Masters",
      description: "Elite players.",
      category: "Sports",
      requiredApprovals: 3,
      applicationQuestions: ["Why chess?", "Your rating?"],
    };

    await act(async () => {
      await result.current.updateClubInfo(next);
    });

    expect(result.current.data!.clubName).toBe("Chess Masters");
    expect(result.current.data!.description).toBe("Elite players.");
    expect(result.current.data!.requiredApprovals).toBe(3);
    expect(result.current.data!.admissionQuestions).toEqual([
      "Why chess?",
      "Your rating?",
    ]);
  });
});

//  createInterviewSlot

describe("createInterviewSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(clubAdminApi.createInterviewSlot).mockResolvedValue({
      message: "Created",
    });
  });

  it("calls the API with clubId, startTime, endTime, then reloads data", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createInterviewSlot(
        "2024-07-01T09:00:00",
        "2024-07-01T09:30:00",
      );
    });

    expect(clubAdminApi.createInterviewSlot).toHaveBeenCalledWith(
      "club-1",
      "2024-07-01T09:00:00",
      "2024-07-01T09:30:00",
    );
    // A reload fetches slots again
    expect(clubAdminApi.getAvailableInterviewSlots).toHaveBeenCalledTimes(2);
  });
});

//  updateInterviewSlot

describe("updateInterviewSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(clubAdminApi.updateInterviewSlot).mockResolvedValue({
      message: "Updated",
    });
  });

  it("updates the matching slot's times in local state", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateInterviewSlot(
        "slot-1",
        "2024-06-01T12:00:00",
        "2024-06-01T12:30:00",
      );
    });

    const updated = result.current.interviewSlots.find(
      (s) => s.slotId === "slot-1",
    );
    expect(updated!.startTime).toBe("2024-06-01T12:00:00");
    expect(updated!.endTime).toBe("2024-06-01T12:30:00");
  });

  it("does not affect other slots", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateInterviewSlot(
        "slot-1",
        "2024-06-01T12:00:00",
        "2024-06-01T12:30:00",
      );
    });

    const untouched = result.current.interviewSlots.find(
      (s) => s.slotId === "slot-2",
    );
    expect(untouched!.startTime).toBe(mockSlots[1].startTime);
  });
});

//  assignBoardMember

describe("assignBoardMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(clubAdminApi.assignBoardMember).mockResolvedValue({
      message: "Assigned",
    });
    vi.mocked(clubAdminApi.getDepartmentHeads).mockResolvedValue([
      {
        userId: "user-99",
        departmentId: "dept-1",
        firstName: "Alice",
        lastName: "Wonderland",
      },
    ]);
  });

  it("updates the department headUserId and headName in state", async () => {
    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.assignBoardMember("user-99", "dept-1");
    });

    const dept = result.current.data!.departments.find(
      (d) => d.departmentId === "dept-1",
    );
    expect(dept!.headUserId).toBe("user-99");
    expect(dept!.headName).toBe("Alice Wonderland");
  });

  it("falls back to the assigned user id if the lookup does not return the department", async () => {
    vi.mocked(clubAdminApi.getDepartmentHeads).mockResolvedValue([
      {
        userId: "user-99",
        departmentId: "dept-2",
        firstName: "Alice",
        lastName: "Wonderland",
      },
    ]);

    const { result } = renderHook(() => useClubAdminClubInfo());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.assignBoardMember("user-99", "dept-1");
    });

    const dept = result.current.data!.departments.find(
      (d) => d.departmentId === "dept-1",
    );
    expect(dept!.headUserId).toBe("user-99");
    expect(dept!.headName).toBe("user-99");
  });
});
