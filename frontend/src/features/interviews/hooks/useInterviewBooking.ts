import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bookInterviewSlot,
  getApplicationsForUser,
  getAvailableInterviewSlotsForClub,
} from "../api/interviewApi";
import type {
  ApprovedInterviewApplication,
  InterviewSlot,
  UserApplication,
} from "../types/interviewTypes";

function normalizeStatus(status: string | number | null | undefined): string {
  if (status === null || status === undefined) return "";

  if (typeof status === "number") {
    switch (status) {
      case 3:
        return "interviewscheduled";
      case 5:
        return "accepted";
      case 4:
        return "rejected";
      case 2:
        return "inprogress";
      case 6:
        return "inreview";
      case 1:
        return "applicationsubmited";
      default:
        return String(status).toLowerCase();
    }
  }

  return status.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function isApprovedApplication(app: UserApplication): boolean {
  const normalized = normalizeStatus(app.status);

  return (
    normalized === "interviewscheduled" ||
    normalized === "applicationapproved" ||
    normalized === "approvedstate" ||
    normalized === "approved"
  );
}

function toApprovedInterviewApplications(
  apps: UserApplication[]
): ApprovedInterviewApplication[] {
  return apps
    .filter(isApprovedApplication)
    .filter((app) => !!app.applicationId && !!app.clubId)
    .map((app) => ({
      applicationId: app.applicationId,
      clubId: app.clubId!,
      clubName: app.clubName || "Club interview",
      departmentName: app.departmentName,
    }));
}

export function useInterviewBooking(userId?: string) {
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const approvedApplications = useMemo(
    () => toApprovedInterviewApplications(applications),
    [applications]
  );

  const selectedApplication = useMemo(
    () =>
      approvedApplications.find(
        (app) => app.applicationId === selectedApplicationId
      ) || approvedApplications[0] || null,
    [approvedApplications, selectedApplicationId]
  );

  const loadApplications = useCallback(async () => {
    if (!userId) return;

    setLoadingApplications(true);
    setError("");

    try {
      const data = await getApplicationsForUser(userId);
      setApplications(data);

      const approved = toApprovedInterviewApplications(data);
      if (approved.length > 0) {
        setSelectedApplicationId((current) =>
          current || approved[0].applicationId
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  }, [userId]);

  const loadSlots = useCallback(async () => {
    if (!selectedApplication?.clubId) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setError("");

    try {
      const data = await getAvailableInterviewSlotsForClub(
        selectedApplication.clubId
      );
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview slots");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedApplication?.clubId]);

  const submitBooking = useCallback(
    async (slotId: string) => {
      if (!selectedApplication) {
        throw new Error("No approved application selected.");
      }

      setBooking(true);
      setError("");
      setSuccessMessage("");

      try {
        const result = await bookInterviewSlot({
          slotId,
          applicationId: selectedApplication.applicationId,
        });

        setSuccessMessage(result.message || "Interview slot booked successfully.");
        await loadSlots();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to book interview slot");
        throw err;
      } finally {
        setBooking(false);
      }
    },
    [selectedApplication, loadSlots]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (selectedApplication?.clubId) {
      loadSlots();
    } else {
      setSlots([]);
    }
  }, [selectedApplication?.clubId, loadSlots]);

  return {
    applications,
    approvedApplications,
    selectedApplication,
    selectedApplicationId,
    setSelectedApplicationId,
    slots,
    loadingApplications,
    loadingSlots,
    booking,
    error,
    successMessage,
    refresh: async () => {
      await loadApplications();
      await loadSlots();
    },
    submitBooking,
  };
}
