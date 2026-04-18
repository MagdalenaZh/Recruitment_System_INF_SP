import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mapCvFileToAttachment,
  mapApplicationCvToAttachments,
  normalizeApplicationStatus,
} from "../../features/board/utils/boardMappers";
import type { ApiCvFile } from "../../utils/binaryFile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_OBJECT_URL = "blob:mock-cv-url";

beforeEach(() => {
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

// "hello" encoded as Base64
const HELLO_BASE64 = "aGVsbG8=";
const HELLO_BYTES = [104, 101, 108, 108, 111];

function makeCv(overrides: Partial<ApiCvFile> = {}): ApiCvFile {
  return {
    fileName: "resume.pdf",
    contentType: "application/pdf",
    content: HELLO_BASE64,
    ...overrides,
  };
}

// ─── mapCvFileToAttachment ────────────────────────────────────────────────────

describe("mapCvFileToAttachment", () => {
  it("returns an attachment with the correct fileName and object URL", () => {
    const attachments = mapCvFileToAttachment(makeCv(), "att-1");

    expect(attachments).toHaveLength(1);
    expect(attachments[0]).toMatchObject({
      id: "att-1",
      fileName: "resume.pdf",
      fileSizeLabel: "PDF CV",
      url: MOCK_OBJECT_URL,
    });
  });

  it("creates the object URL with the decoded byte content", () => {
    mapCvFileToAttachment(makeCv(), "att-1");

    const blobArg = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe("application/pdf");
  });

  it("falls back to 'Application CV.pdf' when fileName is missing", () => {
    const attachments = mapCvFileToAttachment(makeCv({ fileName: "" }), "att-1");

    expect(attachments[0].fileName).toBe("Application CV.pdf");
  });

  it("returns an empty array when the CV content is empty string", () => {
    const attachments = mapCvFileToAttachment(makeCv({ content: "" }), "att-1");
    expect(attachments).toHaveLength(0);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("returns an empty array when the CV is null", () => {
    const attachments = mapCvFileToAttachment(null, "att-1");
    expect(attachments).toHaveLength(0);
  });

  it("returns an empty array when the CV is undefined", () => {
    const attachments = mapCvFileToAttachment(undefined, "att-1");
    expect(attachments).toHaveLength(0);
  });

  it("returns an empty array when URL.createObjectURL returns null", () => {
    vi.mocked(URL.createObjectURL).mockReturnValueOnce(null as unknown as string);

    const attachments = mapCvFileToAttachment(makeCv(), "att-1");
    expect(attachments).toHaveLength(0);
  });
});

// ─── mapApplicationCvToAttachments ────────────────────────────────────────────

describe("mapApplicationCvToAttachments", () => {
  it("maps an application's CV to an attachment array", () => {
    const application = {
      applicationId: "app-1",
      userId: "user-1",
      departmentId: "dept-1",
      applicationStatus: 1,
      questionnaire: {},
      cv: makeCv({ fileName: "my_cv.pdf" }),
    };

    const attachments = mapApplicationCvToAttachments(application);

    expect(attachments).toHaveLength(1);
    expect(attachments[0].id).toBe("app-1-cv");
    expect(attachments[0].fileName).toBe("my_cv.pdf");
  });

  it("returns an empty array when the application has no CV", () => {
    const application = {
      applicationId: "app-2",
      userId: "user-1",
      departmentId: "dept-1",
      applicationStatus: 1,
      questionnaire: {},
      cv: null,
    };

    const attachments = mapApplicationCvToAttachments(application);
    expect(attachments).toHaveLength(0);
  });
});

// ─── normalizeApplicationStatus ──────────────────────────────────────────────

describe("normalizeApplicationStatus", () => {
  const cases: Array<[number, string]> = [
    [1, "Submitted"],
    [2, "Pending"],
    [3, "Interview"],
    [4, "Rejected"],
    [5, "Approved"],
    [6, "FinalReview"],
    [99, "Unknown"],
  ];

  it.each(cases)("maps status %i → %s", (raw, expected) => {
    expect(normalizeApplicationStatus(raw)).toBe(expected);
  });
});
