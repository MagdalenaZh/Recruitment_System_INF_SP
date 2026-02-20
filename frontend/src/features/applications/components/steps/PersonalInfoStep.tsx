import { Input } from "../../../../components/ui/Input";
import type { PersonalInfo } from "../../../../types/application/application";
import { Field } from "../Fields";

export function PersonalInfoStep(props: {
  personal: PersonalInfo;
  setField: <K extends keyof PersonalInfo>(key: K, value: string) => void;
  errors: Partial<Record<keyof PersonalInfo, string>>;
  clearError: (key: keyof PersonalInfo) => void;
}) {
  const { personal, setField, errors, clearError } = props;

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
    </div>
  );
}
