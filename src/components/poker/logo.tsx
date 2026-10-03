import { cn } from "@/lib/utils";

export function FiboMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-ring", className)}
      aria-hidden="true"
    >
      <path
        d="M16 28c-6.627 0-12-5.373-12-12S9.373 4 16 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 4c4.418 0 8 3.582 8 8s-3.582 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 20c-2.209 0-4-1.791-4-4s1.791-4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <FiboMark className="size-7" />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Mesa Fibo
      </span>
    </div>
  );
}
