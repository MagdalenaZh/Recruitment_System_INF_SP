type Props = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  totalCount: number;
};

export function ClubFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  totalCount,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">Filter by category</p>
        <p className="text-xs text-slate-500">
          Showing {totalCount} result{totalCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
