import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ─── Shared base styles ─────────────────────────────────── */
const base =
  "inline-flex items-center justify-center gap-2 font-body text-sm font-medium tracking-widest uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60 disabled:opacity-50 disabled:pointer-events-none";

/* ─── Variant map ────────────────────────────────────────── */
const variants = {
  primary:
    "bg-deep-rose text-pearl rounded-full px-10 py-4 shadow-lg shadow-deep-rose/30 hover:bg-rose hover:shadow-rose/30",
  secondary:
    "bg-transparent border border-deep-rose text-deep-rose rounded-full px-10 py-4 hover:bg-deep-rose hover:text-pearl",
  ghost:
    "bg-transparent text-plum rounded-full px-6 py-3 hover:bg-blush/40",
};

type Variant = keyof typeof variants;

/* ─── <Button> ───────────────────────────────────────────── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

/* ─── <LinkButton> (anchor) ──────────────────────────────── */
interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  children: ReactNode;
}

export function LinkButton({ variant = "primary", className, children, ...props }: LinkButtonProps) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      {children}
    </a>
  );
}
