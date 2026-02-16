type Variant = "info" | "muted";

export function Badge({
  variant = "muted",
  children,
  className = "",
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1";
  const styles: Record<Variant, string> = {
    info: "bg-blue-50 text-blue-700 ring-blue-100",
    muted: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
