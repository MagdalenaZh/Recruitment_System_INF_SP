import type { ApplicationAttachment } from "../types/boardTypes";

export function ApplicationAttachmentsSection({
  attachments,
}: {
  attachments: ApplicationAttachment[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Attachments</h2>

      {attachments.length === 0 ? (
        <div className="mt-3 text-sm text-slate-600">
          No attachments available from this API.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {attachments.map((f) => (
            <a
              key={f.id}
              href={f.url}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:bg-slate-100"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {f.fileName}
                </div>
                <div className="text-xs text-slate-600">{f.fileSizeLabel}</div>
              </div>
              <div className="text-sm font-semibold text-slate-700">
                Download
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
