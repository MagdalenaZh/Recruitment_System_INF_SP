import { Badge } from "../../../../components/ui/Badge";

export function ClubStatusBadge({ isRecruiting }: { isRecruiting: boolean }) {
  return (
    <Badge variant={isRecruiting ? "info" : "muted"}>
      {isRecruiting ? "Recruiting" : "Not recruiting"}
    </Badge>
  );
}
