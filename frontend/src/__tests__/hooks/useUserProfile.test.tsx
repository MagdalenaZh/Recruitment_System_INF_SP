import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useUserProfile } from "../../features/account/hooks/useUserProfile";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../../services/account/accountApi", () => ({
  getCurrentUser: vi.fn(),
  getUserInformation: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("../../services/applications/applicationStatusApi", () => ({
  getAllClubs: vi.fn(() => Promise.resolve([])),
  getDepartmentsForClub: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../../services/auth/auth.api", () => ({
  getStoredUser: vi.fn(() => null),
  mergeStoredUser: vi.fn(() => null),
}));

vi.mock("../../features/auth/utils/routeAuthorization", () => ({
  getNormalizedUserRole: vi.fn((role: string) => role),
}));

import {
  getCurrentUser,
  getUserInformation,
  updateProfile,
} from "../../services/account/accountApi";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CV_BASE64 = "aGVsbG8="; // "hello" as base64
const CV_BYTES = [104, 101, 108, 108, 111];
const MOCK_OBJECT_URL = "blob:mock-cv-preview";

const mockCurrentUser = {
  userId: "user-1",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  role: "Applicant",
  cvUrl: null,
  cvFileName: null,
  departmentId: null,
  clubId: null,
  adminClubId: null,
};

const mockUserInfo = {
  userId: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  cv: {
    fileName: "jane_doe_CV.pdf",
    contentType: "application/pdf",
    content: CV_BASE64,
  },
};

function setupSuccessfulLoad() {
  vi.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser);
  vi.mocked(getUserInformation).mockResolvedValue(mockUserInfo);
}

// ─── CV load on mount ─────────────────────────────────────────────────────────

describe("CV load on mount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.stubGlobal(
      "URL",
      class {
        static createObjectURL = vi.fn(() => MOCK_OBJECT_URL);
        static revokeObjectURL = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches user information to retrieve the CV", async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getUserInformation).toHaveBeenCalledWith("user-1");
  });

  it("creates an object URL from the CV bytes and stores it on the profile", async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(result.current.profile?.cvUrl).toBe(MOCK_OBJECT_URL);
  });

  it("stores the decoded CV bytes on the profile", async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.cv?.content).toEqual(CV_BYTES);
  });

  it("stores the CV file name on the profile", async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.cvFileName).toBe("jane_doe_CV.pdf");
  });

  it("sets cv to null and cvUrl to null when the user has no CV", async () => {
    vi.mocked(getUserInformation).mockResolvedValue({
      ...mockUserInfo,
      cv: null,
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.cv).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("revokes the old object URL before creating a new one on reload", async () => {
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Trigger a second load
    await result.current.updateProfile({
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(MOCK_OBJECT_URL);
  });
});

// ─── updateProfile with CV ────────────────────────────────────────────────────

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulLoad();
    vi.mocked(updateProfile).mockResolvedValue(undefined);
    vi.stubGlobal(
      "URL",
      class {
        static createObjectURL = vi.fn(() => MOCK_OBJECT_URL);
        static revokeObjectURL = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the updateProfile API with the provided data", async () => {
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.updateProfile({
      firstName: "Jane",
      lastName: "Smith",
      cvContent: CV_BYTES,
    });

    expect(updateProfile).toHaveBeenCalledWith({
      firstName: "Jane",
      lastName: "Smith",
      cvContent: CV_BYTES,
    });
  });

  it("reloads the profile after a successful update", async () => {
    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // getUserInformation was called once on initial load
    expect(getUserInformation).toHaveBeenCalledTimes(1);

    await result.current.updateProfile({ firstName: "Jane", lastName: "Doe" });

    // Should be called again after reload
    expect(getUserInformation).toHaveBeenCalledTimes(2);
  });

  it("reflects the updated CV after a profile save", async () => {
    const updatedCv = {
      fileName: "updated_cv.pdf",
      contentType: "application/pdf",
      content: CV_BASE64,
    };
    vi.mocked(getUserInformation).mockResolvedValueOnce(mockUserInfo);
    vi.mocked(getUserInformation).mockResolvedValueOnce({
      ...mockUserInfo,
      cv: updatedCv,
    });

    const { result } = renderHook(() => useUserProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.updateProfile({ firstName: "Jane", lastName: "Doe", cvContent: CV_BYTES });

    await waitFor(() =>
      expect(result.current.profile?.cvFileName).toBe("updated_cv.pdf"),
    );
  });
});
