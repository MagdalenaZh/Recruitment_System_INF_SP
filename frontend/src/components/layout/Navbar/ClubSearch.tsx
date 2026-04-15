import { Input } from "../../../components/ui/Input";

type Props = {
  value: string;
  onChange: (v: string) => void;
  tone?: "dark" | "light";
};

export function ClubSearch({ value, onChange, tone = "dark" }: Props) {
  return (
    <Input
      tone={tone}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by club name or description..."
    />
  );
}
