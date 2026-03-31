import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-500",
  secondary: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
  ghost: "bg-transparent text-white/80 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-10 rounded-xl px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
