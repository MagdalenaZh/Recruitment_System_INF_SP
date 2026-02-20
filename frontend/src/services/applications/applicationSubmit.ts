import type { ApplicationDraft } from "../../types/application/application";
import { submitApplication } from "../../services/applications/applications.api";

export async function submitApplicationDraft(draft: ApplicationDraft) {
  return submitApplication(draft);
}
