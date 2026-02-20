import type { ApplicationDraft } from "../../types/application/application";


export async function submitApplication(draft: ApplicationDraft) {
  console.log("SUBMIT APPLICATION (placeholder):", draft);
  return Promise.resolve({ ok: true });
}
