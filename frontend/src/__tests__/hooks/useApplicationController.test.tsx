import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useApplicationController } from "../../features/applications/hooks/useApplicationController";
import type { ApplicationQuestion } from "../../types/application/application";

//  Module mocks 

vi.mock("../../services/applications/applications.api", () => ({
  submitApplication: vi.fn(),
}));

vi.mock("../../services/auth/auth.api", () => ({
  getStoredUserId: vi.fn(() => "user-123"),
}));

vi.mock("../../services/account/accountApi", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    userId: "user-123",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
  }),
  getUserInformation: vi.fn().mockResolvedValue({
    userId: "user-123",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    cv: {
      fileName: "jane_cv.pdf",
      contentType: "application/pdf",
      content: "aGVsbG8=", // "hello" base64
    },
  }),
}));

import { submitApplication } from "../../services/applications/applications.api";
import { getStoredUserId } from "../../services/auth/auth.api";

//  Fixtures 

const validPersonal = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  cvFileContent: [37, 80, 68, 70], // minimal %PDF bytes — required by validatePersonal
};

const requiredQuestion: ApplicationQuestion = {
  id: "q1",
  label: "Why join?",
  required: true,
  type: "textarea",
};

function buildArgs(
  overrides: Partial<Parameters<typeof useApplicationController>[0]> = {},
): Parameters<typeof useApplicationController>[0] {
  return {
    clubId: "club-1",
    hasActiveClubApplication: false,
    questions: [requiredQuestion],
    step: 0,
    setStep: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    personal: validPersonal,
    setPersonal: vi.fn(),
    answers: { q1: "Because I love it." },
    departmentId: "dept-1",
    ...overrides,
  };
}

//  goNext (step 0 – personal info) 

describe("goNext at step 0", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("advances to step 1 when personal info is valid", () => {
    const args = buildArgs({ step: 0 });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });

    expect(args.nextStep).toHaveBeenCalledOnce();
  });

  it("does not advance and sets errors when personal info is invalid", () => {
    const args = buildArgs({
      step: 0,
      personal: { firstName: "", lastName: "", email: "" },
    });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });

    expect(args.nextStep).not.toHaveBeenCalled();
    expect(result.current.errors.personal.firstName).toBeDefined();
    expect(result.current.errors.personal.lastName).toBeDefined();
    expect(result.current.errors.personal.email).toBeDefined();
  });

  it("does not advance when email is missing the @ symbol", () => {
    const args = buildArgs({
      step: 0,
      personal: { ...validPersonal, email: "notanemail" },
    });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });

    expect(args.nextStep).not.toHaveBeenCalled();
    expect(result.current.errors.personal.email).toBeDefined();
  });
});

//  goNext (step 1 – answers + department) 

describe("goNext at step 1", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("advances to step 2 when all answers are filled and a department is selected", () => {
    const args = buildArgs({ step: 1 });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });

    expect(args.nextStep).toHaveBeenCalledOnce();
  });

  it("does not advance when no department is selected", () => {
    const args = buildArgs({ step: 1, departmentId: "" });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });

    expect(args.nextStep).not.toHaveBeenCalled();
    expect(result.current.errors.department).toBeTruthy();
  });

  it("does not advance when a required answer is missing", () => {
    const args = buildArgs({ step: 1, answers: {} });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });

    expect(args.nextStep).not.toHaveBeenCalled();
    expect(result.current.errors.answers["q1"]).toBeDefined();
  });
});

//  submit 

describe("submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submitApplication).mockResolvedValue(undefined);
  });

  it("calls submitApplication with the correct payload", async () => {
    const args = buildArgs();
    const { result } = renderHook(() => useApplicationController(args));

    await act(async () => {
      await result.current.submit();
    });

    expect(submitApplication).toHaveBeenCalledWith({
      departmentId: "dept-1",
      questionnaire: { "Why join?": "Because I love it." },
      cvFile: [37, 80, 68, 70],
    });
    expect(result.current.isSubmitted).toBe(true);
  });

  it("sets isSubmitting to true while in flight, then false after", async () => {
    let resolveSubmit!: () => void;
    vi.mocked(submitApplication).mockReturnValue(
      new Promise<void>((res) => {
        resolveSubmit = res;
      }),
    );

    const args = buildArgs();
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      void result.current.submit();
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSubmit();
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("redirects to step 0 when personal info is invalid", async () => {
    const setStep = vi.fn();
    const args = buildArgs({
      personal: { firstName: "", lastName: "", email: "" },
      setStep,
    });
    const { result } = renderHook(() => useApplicationController(args));

    await act(async () => {
      await result.current.submit();
    });

    expect(submitApplication).not.toHaveBeenCalled();
    expect(setStep).toHaveBeenCalledWith(0);
  });

  it("redirects to step 1 when a required answer is missing", async () => {
    const setStep = vi.fn();
    const args = buildArgs({ answers: {}, setStep });
    const { result } = renderHook(() => useApplicationController(args));

    await act(async () => {
      await result.current.submit();
    });

    expect(submitApplication).not.toHaveBeenCalled();
    expect(setStep).toHaveBeenCalledWith(1);
  });

  it("does nothing when the user already has an active application", async () => {
    const args = buildArgs({ hasActiveClubApplication: true });
    const { result } = renderHook(() => useApplicationController(args));

    await act(async () => {
      await result.current.submit();
    });

    expect(submitApplication).not.toHaveBeenCalled();
  });
});

//  canSubmit 

describe("canSubmit", () => {
  it("is true when the form is fully valid and no duplicate application exists", () => {
    const { result } = renderHook(() => useApplicationController(buildArgs()));
    expect(result.current.canSubmit).toBe(true);
  });

  it("is false when the user already has an active application", () => {
    const { result } = renderHook(() =>
      useApplicationController(buildArgs({ hasActiveClubApplication: true })),
    );
    expect(result.current.canSubmit).toBe(false);
  });

  it("is false when no department is selected", () => {
    const { result } = renderHook(() =>
      useApplicationController(buildArgs({ departmentId: "" })),
    );
    expect(result.current.canSubmit).toBe(false);
  });
});

//  auto-fill on mount 

describe("auto-fill personal info on mount", () => {
  it("calls setPersonal with user data and decoded CV from getUserInformation", async () => {
    const setPersonal = vi.fn();
    renderHook(() =>
      useApplicationController(buildArgs({ setPersonal })),
    );

    await waitFor(() => {
      expect(setPersonal).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          cvFileName: "jane_cv.pdf",
          cvFileContent: [104, 101, 108, 108, 111], // decoded "hello" base64
        }),
      );
    });
  });
});

//  clearError helpers 

describe("clearPersonalError / clearAnswerError", () => {
  it("clears a specific personal field error", () => {
    const args = buildArgs({
      step: 0,
      personal: { firstName: "", lastName: "Doe", email: "x@y.com" },
    });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });
    expect(result.current.errors.personal.firstName).toBeDefined();

    act(() => {
      result.current.clearPersonalError("firstName");
    });
    expect(result.current.errors.personal.firstName).toBeFalsy();
  });

  it("clears a specific answer error", () => {
    const args = buildArgs({ step: 1, answers: {} });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goNext();
    });
    expect(result.current.errors.answers["q1"]).toBeDefined();

    act(() => {
      result.current.clearAnswerError("q1");
    });
    expect(result.current.errors.answers["q1"]).toBeFalsy();
  });
});

//  goBack 

describe("goBack", () => {
  it("calls prevStep", () => {
    const args = buildArgs({ step: 1 });
    const { result } = renderHook(() => useApplicationController(args));

    act(() => {
      result.current.goBack();
    });

    expect(args.prevStep).toHaveBeenCalledOnce();
  });
});

//  getStoredUserId guard 

describe("submit without authenticated user", () => {
  it("does not call submitApplication when no userId is stored", async () => {
    vi.mocked(getStoredUserId).mockReturnValueOnce(null);

    vi.stubGlobal("alert", vi.fn());
    const args = buildArgs();
    const { result } = renderHook(() => useApplicationController(args));

    await act(async () => {
      await result.current.submit();
    });

    expect(submitApplication).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
