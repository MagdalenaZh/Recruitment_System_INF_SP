import type { CvFile } from "../types/account/profile";

export function encodeBytesToBase64(bytes: number[] | null | undefined) {
  if (!bytes || bytes.length === 0) {
    return "";
  }

  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.slice(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export function decodeBase64ToBytes(base64: string | null | undefined) {
  if (!base64) {
    return [];
  }

  const binary = atob(base64);
  return Array.from(binary, (char) => char.charCodeAt(0));
}

export function createObjectUrlFromBytes(
  content: number[] | null | undefined,
  contentType: string | null | undefined,
) {
  if (!content || content.length === 0) {
    return null;
  }

  return URL.createObjectURL(
    new Blob([new Uint8Array(content)], {
      type: contentType || "application/octet-stream",
    }),
  );
}

export type ApiCvFile = Omit<CvFile, "content"> & {
  content: string;
};
