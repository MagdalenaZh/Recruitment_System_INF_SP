import { Badge } from "../ui/Badge";

export function ClubStatusBadge({ isRecruiting }: { isRecruiting: boolean }) {
  return (
    <Badge variant={isRecruiting ? "info" : "muted"}>
      {isRecruiting ? "Recruiting" : "Not recruiting"}
    </Badge>
  );
}
