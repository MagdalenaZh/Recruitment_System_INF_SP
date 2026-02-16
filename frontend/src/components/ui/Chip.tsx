type Props = {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

export function Chip({ active, children, onClick }: Props) {
  const base = "rounded-full px-3 py-1 text-sm transition";
  const activeStyle = "bg-blue-600 text-white shadow-sm";
  const inactiveStyle = "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <button
      onClick={onClick}
      className={`${base} ${active ? activeStyle : inactiveStyle}`}
    >
      {children}
    </button>
  );
}
