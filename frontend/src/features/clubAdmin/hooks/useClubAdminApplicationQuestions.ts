import { useCallback, useEffect, useState } from "react";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";

export function useClubAdminApplicationQuestions() {
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await clubAdminApi.getCurrentClubInfo();
      setClubId(result.clubId);
      setClubName(result.clubName);
      setQuestions(result.admissionQuestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveQuestions = useCallback(
    async (nextQuestions: string[]) => {
      if (!clubId) {
        throw new Error("Club id is missing.");
      }

      await clubAdminApi.updateAdmissionQuestions(clubId, nextQuestions);
      setQuestions(nextQuestions);
    },
    [clubId]
  );

  return {
    clubId,
    clubName,
    questions,
    loading,
    error,
    refetch: load,
    saveQuestions,
  };
}