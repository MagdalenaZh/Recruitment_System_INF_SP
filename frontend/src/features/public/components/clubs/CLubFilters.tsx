type Props = {
  totalCount: number;
};

export function ClubFilters({ totalCount }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-600">
        {totalCount} club{totalCount === 1 ? "" : "s"} found
      </p>
    </div>
  );
}
