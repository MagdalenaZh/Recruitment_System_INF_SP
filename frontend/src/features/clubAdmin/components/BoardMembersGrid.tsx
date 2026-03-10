// src/features/clubAdmin/components/BoardMembersGrid.tsx
import type { BoardMember } from "../types/clubAdminTypes";
import { BoardMemberCard } from "./BoardMemberCard";

export function BoardMembersGrid({ members }: { members: BoardMember[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <BoardMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
