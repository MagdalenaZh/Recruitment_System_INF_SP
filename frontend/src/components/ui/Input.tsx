import type { InputHTMLAttributes } from "react";

type Tone = "dark" | "light";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  tone?: Tone;
};

const base =
  "w-full rounded-xl px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-400";

const tones: Record<Tone, string> = {
  dark: "bg-white/10 text-white placeholder:text-white/60 ring-1 ring-white/15",
  light:
    "bg-white text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200",
};

export function Input({ tone = "light", className = "", ...props }: Props) {
  return <input className={`${base} ${tones[tone]} ${className}`} {...props} />;
}
