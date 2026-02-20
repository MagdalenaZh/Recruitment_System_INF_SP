export function AccountInboxPage() {
  const mock = [
    {
      id: 1,
      title: "Application received",
      body: "We received your application.",
    },
    {
      id: 2,
      title: "Status updated",
      body: "Your application moved to Under review.",
    },
  ];

  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">Inbox</div>
      <div className="mt-6 space-y-3">
        {mock.map((m) => (
          <div
            key={m.id}
            className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100"
          >
            <div className="text-sm font-medium text-slate-900">{m.title}</div>
            <div className="mt-1 text-sm text-slate-600">{m.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
