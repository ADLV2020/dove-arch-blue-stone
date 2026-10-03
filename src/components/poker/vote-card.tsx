import { Coffee, HelpCircle, Infinity as InfinityIcon, Sparkles } from "lucide-react";
import { CARD_LABEL, type CardId } from "@/lib/poker";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "w-14 h-20",
  md: "w-16 h-24",
  lg: "w-20 h-32",
} as const;

function FaceArt({ card, size }: { card: CardId; size: keyof typeof SIZE }) {
  const iconClass = size === "lg" ? "size-8" : size === "md" ? "size-6" : "size-5";
  const numberClass =
    size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-xl";

  if (card === "coffee") {
    return (
      <div className="flex flex-col items-center gap-1">
        <Coffee className={iconClass} strokeWidth={1.6} />
        <span className="text-2xs font-medium uppercase tracking-wide">Café</span>
      </div>
    );
  }
  if (card === "question") {
    return (
      <div className="flex flex-col items-center gap-1">
        <HelpCircle className={iconClass} strokeWidth={1.6} />
        <span className="text-2xs font-medium uppercase tracking-wide">Duda</span>
      </div>
    );
  }
  if (card === "infinity") {
    return (
      <div className="flex flex-col items-center gap-1">
        <InfinityIcon className={iconClass} strokeWidth={1.6} />
        <span className="text-2xs font-medium uppercase tracking-wide">Infinito</span>
      </div>
    );
  }
  if (card === "wildcard") {
    return (
      <div className="flex flex-col items-center gap-1">
        <Sparkles className={iconClass} strokeWidth={1.6} />
        <span className="text-2xs font-medium uppercase tracking-wide">Comodín</span>
      </div>
    );
  }

  return <span className={cn("font-display font-semibold leading-none", numberClass)}>{card}</span>;
}

function PaperFace({ card, size }: { card: CardId; size: keyof typeof SIZE }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-paper p-1.5 text-paper-ink">
      <span className="self-start font-display text-2xs font-semibold leading-none text-paper-muted">
        {CARD_LABEL[card]}
      </span>
      <FaceArt card={card} size={size} />
      <span className="self-end font-display text-2xs font-semibold leading-none text-paper-muted">
        {CARD_LABEL[card]}
      </span>
    </div>
  );
}

function CardBack() {
  return (
    <div className="card-back-pattern flex h-full w-full items-center justify-center">
      <span className="size-5 rounded-full border border-ring/40" />
    </div>
  );
}

export function VoteCard({
  card,
  size = "md",
  selected = false,
  face = "front",
  onSelect,
  disabled = false,
  label,
}: {
  card?: CardId;
  size?: keyof typeof SIZE;
  selected?: boolean;
  face?: "front" | "back" | "empty";
  onSelect?: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const interactive = Boolean(onSelect) && !disabled;
  const className = cn(
    SIZE[size],
    "relative overflow-hidden rounded-md shadow-[var(--shadow-border)]",
    selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
    face === "empty" && "border border-dashed border-border bg-transparent shadow-none",
    interactive && "transition-transform duration-150 ease-out hover:-translate-y-0.5",
  );

  const inner =
    face === "empty" ? null : face === "back" || !card ? (
      <CardBack />
    ) : (
      <PaperFace card={card} size={size} />
    );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={label ?? (card ? `Votar ${CARD_LABEL[card]}` : "Carta")}
        className={className}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={className} aria-hidden={!label} aria-label={label}>
      {inner}
    </div>
  );
}

export function SeatCard({
  card,
  hasVoted,
  revealed,
  name,
}: {
  card: CardId | null;
  hasVoted: boolean;
  revealed: boolean;
  name: string;
}) {
  if (!hasVoted) {
    return <VoteCard face="empty" size="sm" label={`${name} aún no vota`} />;
  }
  if (revealed && card) {
    return <VoteCard card={card} face="front" size="sm" label={`${name} votó ${CARD_LABEL[card]}`} />;
  }
  return <VoteCard face="back" size="sm" label={`${name} ya votó`} />;
}
