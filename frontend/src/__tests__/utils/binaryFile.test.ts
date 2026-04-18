import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  encodeBytesToBase64,
  decodeBase64ToBytes,
  createObjectUrlFromBytes,
} from "../../utils/binaryFile";

// ─── encodeBytesToBase64 ──────────────────────────────────────────────────────

describe("encodeBytesToBase64", () => {
  it("encodes a byte array to a Base64 string", () => {
    // "hello" → [104, 101, 108, 108, 111] → "aGVsbG8="
    const bytes = [104, 101, 108, 108, 111];
    expect(encodeBytesToBase64(bytes)).toBe("aGVsbG8=");
  });

  it("returns an empty string for an empty array", () => {
    expect(encodeBytesToBase64([])).toBe("");
  });

  it("returns an empty string for null", () => {
    expect(encodeBytesToBase64(null)).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(encodeBytesToBase64(undefined)).toBe("");
  });

  it("handles a single byte", () => {
    // 0 → "AA=="
    expect(encodeBytesToBase64([0])).toBe("AA==");
  });

  it("round-trips correctly with decodeBase64ToBytes", () => {
    const original = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100];
    const encoded = encodeBytesToBase64(original);
    const decoded = decodeBase64ToBytes(encoded);
    expect(decoded).toEqual(original);
  });
});

// ─── decodeBase64ToBytes ──────────────────────────────────────────────────────

describe("decodeBase64ToBytes", () => {
  it("decodes a Base64 string to a byte array", () => {
    // "aGVsbG8=" → "hello" → [104, 101, 108, 108, 111]
    expect(decodeBase64ToBytes("aGVsbG8=")).toEqual([104, 101, 108, 108, 111]);
  });

  it("returns an empty array for an empty string", () => {
    expect(decodeBase64ToBytes("")).toEqual([]);
  });

  it("returns an empty array for null", () => {
    expect(decodeBase64ToBytes(null)).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(decodeBase64ToBytes(undefined)).toEqual([]);
  });

  it("round-trips correctly with encodeBytesToBase64", () => {
    const original = "SGVsbG8sIFdvcmxkIQ==";
    const decoded = decodeBase64ToBytes(original);
    const reencoded = encodeBytesToBase64(decoded);
    expect(reencoded).toBe(original);
  });
});

// ─── createObjectUrlFromBytes ─────────────────────────────────────────────────

describe("createObjectUrlFromBytes", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "URL",
      class {
        static createObjectURL = vi.fn(() => "blob:mock-url");
        static revokeObjectURL = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls URL.createObjectURL and returns the resulting URL", () => {
    const bytes = [37, 80, 68, 70]; // %PDF magic bytes
    const url = createObjectUrlFromBytes(bytes, "application/pdf");

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(url).toBe("blob:mock-url");
  });

  it("passes the correct content type to the Blob", () => {
    createObjectUrlFromBytes([1, 2, 3], "application/pdf");

    const blobArg = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe("application/pdf");
  });

  it("returns null for an empty byte array", () => {
    const url = createObjectUrlFromBytes([], "application/pdf");
    expect(url).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("returns null for null content", () => {
    const url = createObjectUrlFromBytes(null, "application/pdf");
    expect(url).toBeNull();
  });

  it("falls back to application/octet-stream when no content type is given", () => {
    createObjectUrlFromBytes([1, 2, 3], null);

    const blobArg = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe("application/octet-stream");
  });
});
