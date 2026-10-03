import type { ReactNode } from "react";
import { AVATARS, MAX_NAME, type Avatar } from "@/lib/poker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/profile";

export function IdentityForm({
  profile,
  onChange,
  onSubmit,
  submitLabel,
  pending,
  extra,
  disabled,
}: {
  profile: Profile;
  onChange: (next: Profile) => void;
  onSubmit: () => void;
  submitLabel: string;
  pending?: boolean;
  extra?: ReactNode;
  disabled?: boolean;
}) {
  const canSubmit = profile.name.trim().length > 0 && !pending && !disabled;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="player-name">Tu nombre</Label>
        <Input
          id="player-name"
          maxLength={MAX_NAME}
          autoComplete="nickname"
          placeholder="Hasta 50 caracteres"
          value={profile.name}
          onChange={(event) => onChange({ ...profile, name: event.target.value.slice(0, MAX_NAME) })}
        />
        <p className="text-xs text-muted-foreground tabular-nums">
          {profile.name.trim().length}/{MAX_NAME}
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Elige tu avatar</legend>
        <div className="grid grid-cols-7 gap-1.5">
          {AVATARS.map((emoji) => {
            const selected = profile.emoji === emoji;
            return (
              <button
                key={emoji}
                type="button"
                aria-label={`Avatar ${emoji}`}
                aria-pressed={selected}
                onClick={() => onChange({ ...profile, emoji: emoji as Avatar })}
                className={cn(
                  "flex size-11 items-center justify-center rounded-md text-xl transition-[background-color,box-shadow] duration-150",
                  selected
                    ? "bg-paper shadow-[var(--shadow-border-hover)]"
                    : "bg-secondary hover:bg-accent",
                )}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {extra}

      <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
        {pending ? "Un momento…" : submitLabel}
      </Button>
    </form>
  );
}
