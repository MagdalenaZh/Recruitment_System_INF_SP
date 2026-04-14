import { Link } from "react-router-dom";
import { useAuth } from "../../auth/components/AuthContext";
import { useInterviewBooking } from "../../interviews/hooks/useInterviewBooking";
import { InterviewSlotsCalendar } from "../../interviews/components/InterviewSlotsCalendar";

export function AccountInterviewBookingPage() {
  const { user } = useAuth();

  const {
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
    submitBooking,
  } = useInterviewBooking(user?.userId);
  const shownApplications = approvedApplications;
  const shownSelectedApplication = selectedApplication;
  const shownSlots = slots;
  const shownLoadingApplications = loadingApplications;
  const shownLoadingSlots = loadingSlots;
  const shownError = error;
  const shownSuccessMessage = successMessage;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/account/applications"
          className="inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Back to my applications
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Interview Booking
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Choose one of the available interview slots for your approved
          application.
        </p>
      </div>

      {(shownError || shownSuccessMessage) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm shadow-sm ${
            shownError
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {shownError || shownSuccessMessage}
        </div>
      )}

      {shownLoadingApplications ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Loading interview booking details...
        </div>
      ) : shownApplications.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            No interview booking available yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            This page will become available once one of your applications is
            approved for the interview stage.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Approved application
                </p>

                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Select application
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  If you have more than one approved application, choose which
                  one you want to schedule an interview for.
                </p>

                <select
                  value={selectedApplicationId || selectedApplication?.applicationId || ""}
                  onChange={(e) => setSelectedApplicationId(e.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {shownApplications.map((app) => (
                    <option key={app.applicationId} value={app.applicationId}>
                      {app.clubName}
                      {app.departmentName ? ` — ${app.departmentName}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
                  Current selection
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {shownSelectedApplication?.clubName || "Selected club"}
                </h3>

                {shownSelectedApplication?.departmentName && (
                  <p className="mt-2 text-sm text-slate-600">
                    Department: {shownSelectedApplication.departmentName}
                  </p>
                )}

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Pick a time slot below to reserve your interview.
                </p>
              </div>
            </div>
          </section>

          <section>
            {shownLoadingSlots ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
                Loading available slots...
              </div>
            ) : (
              <InterviewSlotsCalendar
                slots={shownSlots}
                onBook={submitBooking}
                booking={booking}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
