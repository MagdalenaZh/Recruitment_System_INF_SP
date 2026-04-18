import type { Dispatch, SetStateAction } from "react";
import { Input } from "../../../../components/ui/Input";
import { Field } from "../Fields";

import type { PersonalInfo } from "../../../../types/application/application";

export function PersonalInfoStep(props: {
  personal: PersonalInfo;
  setField: <K extends keyof PersonalInfo>(key: K, value: string) => void;
  setPersonal: Dispatch<SetStateAction<PersonalInfo>>;
  errors: Partial<Record<keyof PersonalInfo, string>>;
  clearError: (key: keyof PersonalInfo) => void;
}) {
  const { personal, setField, setPersonal, errors, clearError } = props;

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <Field label="First name" required error={errors.firstName}>
        <Input
          value={personal.firstName}
          onChange={(e) => {
            setField("firstName", e.target.value);
            clearError("firstName");
          }}
        />
      </Field>

      <Field label="Last name" required error={errors.lastName}>
        <Input
          value={personal.lastName}
          onChange={(e) => {
            setField("lastName", e.target.value);
            clearError("lastName");
          }}
        />
      </Field>

      <Field label="Email" required error={errors.email}>
        <Input
          value={personal.email}
          onChange={(e) => {
            setField("email", e.target.value);
            clearError("email");
          }}
        />
      </Field>

      <Field label="Phone (optional)" error={errors.phone}>
        <Input
          value={personal.phone}
          onChange={(e) => {
            setField("phone", e.target.value);
            clearError("phone");
          }}
        />
      </Field>

      <Field label="CV (PDF)" required error={errors.cvFileName}>
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const isPdf =
              file.type === "application/pdf" ||
              file.name.toLowerCase().endsWith(".pdf");

            if (!isPdf) {
              setPersonal((previous) => ({
                ...previous,
                cvFileName: "",
                cvFileContent: [],
              }));
              e.target.value = "";
              return;
            }

            const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
            setPersonal((previous) => ({
              ...previous,
              cvFileName: file.name,
              cvFileContent: bytes,
            }));
            clearError("cvFileName");
            e.target.value = "";
          }}
        />
        <div className="mt-2 text-sm text-slate-600">
          {personal.cvFileName?.trim() || "No file selected"}
        </div>
      </Field>
    </div>
  );
}
