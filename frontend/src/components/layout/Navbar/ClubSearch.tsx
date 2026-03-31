import { Input } from "../../../components/ui/Input";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function ClubSearch({ value, onChange }: Props) {
  return (
    <Input
      tone="dark"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by club name or description..."
    />
  );
}
