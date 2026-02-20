import type { ReactNode } from "react";

export function Field(props: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  const { label, required, error, children } = props;

  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        {required ? <span className="text-xs text-blue-700">*</span> : null}
      </div>

      <div className="mt-1">{children}</div>

      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
