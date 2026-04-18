import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useInterviewBooking } from "../../features/interviews/hooks/useInterviewBooking";

//  Module mocks 

vi.mock("../../features/interviews/api/interviewApi", () => ({
  bookInterviewSlot: vi.fn(),
  getAvailableInterviewSlotsForClub: vi.fn(),
}));

vi.mock("../../services/applications/applicationStatusApi", () => ({
  getApplicationsForCurrentUser: vi.fn(),
  getAllClubs: vi.fn(),
  getDepartmentsForClub: vi.fn(),
  getCachedLatestApplicationStates: vi.fn(() => []),
  getLatestApplicationStates: vi.fn(),
}));

vi.mock("../../services/applications/applicationStateStream", () => ({
  createRealtimeClientId: vi.fn(() => "client-test-id"),
  subscribeToApplicationStates: vi.fn(() => () => {}), // returns a no-op cleanup
}));

import { bookInterviewSlot, getAvailableInterviewSlotsForClub } from "../../features/interviews/api/interviewApi";
import {
  getApplicationsForCurrentUser,
  getAllClubs,
  getDepartmentsForClub,
} from "../../services/applications/applicationStatusApi";

//  Fixtures 

const mockApplication = {
  applicationId: "app-1",
  departmentId: "dept-1",
  applicationStatus: 3, // interviewscheduled / approved
  clubId: "club-1",
  questionnaire: {},
  userId: "user-1",
  status: "interviewscheduled",
  interviewSlot: undefined,
};

const mockClub = {
  clubId: "club-1",
  clubName: "Chess Club",
  admissionQuestions: [] as string[],
  description: "",
  category: "Academic",
};

const mockDepartment = {
  departmentId: "dept-1",
  clubId: "club-1",
  departmentName: "Beginners",
  numberOfOpenPositions: 5,
  description: "",
};

const mockSlot = {
  slotId: "slot-1",
  startTime: "2024-07-01T10:00:00",
  endTime: "2024-07-01T10:30:00",
};

function setupSuccessfulLoad() {
  vi.mocked(getApplicationsForCurrentUser).mockResolvedValue([mockApplication]);
  vi.mocked(getAllClubs).mockResolvedValue([mockClub]);
  vi.mocked(getDepartmentsForClub).mockResolvedValue([mockDepartment]);
  vi.mocked(getAvailableInterviewSlotsForClub).mockResolvedValue([mockSlot]);
}

//  Initial load 

describe("initial data load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
  });

  it("loads applications on mount when userId is provided", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.loadingApplications).toBe(false));

    expect(getApplicationsForCurrentUser).toHaveBeenCalledOnce();
    expect(getAllClubs).toHaveBeenCalledOnce();
  });

  it("does not fetch when no userId is provided", async () => {
    const { result } = renderHook(() => useInterviewBooking(undefined));

    await waitFor(() => expect(result.current.loadingApplications).toBe(false));

    expect(getApplicationsForCurrentUser).not.toHaveBeenCalled();
  });

  it("loads interview slots for the selected application's club", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    // Wait for the full chain: applications load → selected app resolves → slots load.
    await waitFor(() => expect(result.current.slots).toHaveLength(1), {
      timeout: 3000,
    });

    expect(getAvailableInterviewSlotsForClub).toHaveBeenCalledWith("club-1");
    expect(result.current.slots[0].slotId).toBe("slot-1");
  });

  it("sets error when application fetch fails", async () => {
    vi.mocked(getApplicationsForCurrentUser).mockRejectedValue(
      new Error("Network failure"),
    );

    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.loadingApplications).toBe(false));

    expect(result.current.error).toBe("Network failure");
  });
});

//  submitBooking 

describe("submitBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(bookInterviewSlot).mockResolvedValue({
      message: "Slot booked successfully.",
    });
  });

  it("calls bookInterviewSlot with the applicationId and matching slot", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.slots).toHaveLength(1));

    await act(async () => {
      await result.current.submitBooking("slot-1");
    });

    expect(bookInterviewSlot).toHaveBeenCalledWith({
      applicationId: "app-1",
      slot: mockSlot,
    });
  });

  it("sets successMessage after a successful booking", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.slots).toHaveLength(1));

    await act(async () => {
      await result.current.submitBooking("slot-1");
    });

    expect(result.current.successMessage).toBe("Slot booked successfully.");
  });

  it("clears the slot list after a successful booking", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    // Wait for slots to appear from the initial load.
    await waitFor(() => expect(result.current.slots).toHaveLength(1), {
      timeout: 3000,
    });

    // After booking, loadApplications reloads – simulate no approved apps left
    vi.mocked(getApplicationsForCurrentUser).mockResolvedValue([]);

    await act(async () => {
      await result.current.submitBooking("slot-1");
    });

    await waitFor(() => expect(result.current.slots).toHaveLength(0));
  });

  it("throws and sets error when the API call fails", async () => {
    vi.mocked(bookInterviewSlot).mockRejectedValue(new Error("Slot unavailable"));

    const { result } = renderHook(() => useInterviewBooking("user-1"));

    // Wait for the initial slot load to complete before attempting the booking
    await waitFor(() => expect(result.current.slots).toHaveLength(1), {
      timeout: 3000,
    });

    // Catch the rethrow inside act so React can flush setError before act resolves.
    let thrownMessage = "";
    await act(async () => {
      try {
        await result.current.submitBooking("slot-1");
      } catch (err) {
        thrownMessage = err instanceof Error ? err.message : String(err);
      }
    });

    expect(thrownMessage).toBe("Slot unavailable");
    expect(result.current.error).toBe("Slot unavailable");
  });

  it("throws when the requested slotId is not in the loaded slots", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.slots).toHaveLength(1));

    await expect(
      act(async () => {
        await result.current.submitBooking("non-existent-slot");
      }),
    ).rejects.toThrow();

    expect(bookInterviewSlot).not.toHaveBeenCalled();
  });
});

//  booking loading state 

describe("booking loading state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
  });

  it("sets booking=true while the API call is in flight, then false after", async () => {
    let resolveBooking!: (v: { message: string }) => void;
    vi.mocked(bookInterviewSlot).mockReturnValue(
      new Promise<{ message: string }>((res) => {
        resolveBooking = res;
      }),
    );

    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.slots).toHaveLength(1));

    act(() => {
      void result.current.submitBooking("slot-1");
    });

    expect(result.current.booking).toBe(true);

    await act(async () => {
      resolveBooking({ message: "Done" });
    });

    expect(result.current.booking).toBe(false);
  });
});

//  selectedApplicationId 

describe("setSelectedApplicationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
  });

  it("defaults to the first approved application after loading", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.loadingApplications).toBe(false));

    expect(result.current.selectedApplication?.applicationId).toBe("app-1");
  });

  it("exposes setSelectedApplicationId to switch the selection", async () => {
    const { result } = renderHook(() => useInterviewBooking("user-1"));

    await waitFor(() => expect(result.current.loadingApplications).toBe(false));

    act(() => {
      result.current.setSelectedApplicationId("some-other-id");
    });

    expect(result.current.selectedApplicationId).toBe("some-other-id");
  });
});
