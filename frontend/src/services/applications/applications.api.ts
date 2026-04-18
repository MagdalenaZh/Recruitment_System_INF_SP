import type { SubmitApplicationRequest } from "../../types/application/application";
import { getAuthToken } from "../auth/auth.api";
import { encodeBytesToBase64 } from "../../utils/binaryFile";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

export async function submitApplication(
  payload: SubmitApplicationRequest,
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("You must be logged in to submit an application.");

  const response = await fetch(`${API_BASE}/api/submit-application`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      departmentId: payload.departmentId,
      questionnaire: payload.questionnaire,
      cvFile: encodeBytesToBase64(payload.cvFile),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to submit application.");
  }
}
