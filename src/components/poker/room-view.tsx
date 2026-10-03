import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Copy, DoorOpen, Eye, RotateCcw, Share2 } from "lucide-react";
import {
  ALL_CARDS,
  CARD_LABEL,
  MAX_MEMBERS,
  MAX_STORY,
  type CardId,
  type RoomState,
} from "@/lib/poker";
import { loadProfile, type Profile } from "@/lib/profile";
import {
  castVote,
  getRoom,
  leaveRoom,
  nextRound,
  revealVotes,
  setStory,
} from "@/lib/poker-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLockup } from "./logo";
import { JoinOnly } from "./lobby";
import { SeatCard, VoteCard } from "./vote-card";

function inviteUrl(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/sala/${code}`;
}

function StatsPanel({ room }: { room: RoomState }) {
  if (room.phase !== "revealed" || !room.stats) return null;
  const { stats } = room;
  return (
    <section className="rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Resultado
          </p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums leading-none">
            {stats.average === null ? "—" : stats.average}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Media de las cartas numéricas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.consensus ? <Badge variant="paper">Consenso</Badge> : <Badge>Hay dispersión</Badge>}
          {stats.min !== null && stats.max !== null ? (
            <Badge variant="outline">
              Rango {stats.min}–{stats.max}
            </Badge>
          ) : null}
        </div>
      </div>
      {stats.tally.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {stats.tally.map((item) => (
            <li
              key={item.card}
              className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1.5 text-sm"
            >
              <span className="font-display font-semibold">{CARD_LABEL[item.card]}</span>
              <span className="tabular-nums text-muted-foreground">×{item.count}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function RoomTable({
  room,
  profile,
  onRoom,
}: {
  room: RoomState;
  profile: Profile;
  onRoom: (next: RoomState) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const castVoteFn = useServerFn(castVote);
  const revealFn = useServerFn(revealVotes);
  const nextRoundFn = useServerFn(nextRound);
  const setStoryFn = useServerFn(setStory);
  const leaveFn = useServerFn(leaveRoom);
  const [storyDraft, setStoryDraft] = useState(room.story);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStoryDraft(room.story);
  }, [room.story]);

  const voting = room.phase === "voting";
  const votedCount = room.members.filter((m) => m.hasVoted).length;

  const voteMut = useMutation({
    mutationFn: (card: CardId) =>
      castVoteFn({ data: { code: room.code, memberId: profile.memberId, card } }),
    onSuccess: (result) => {
      if (!result.ok) toast.error(result.message);
      else onRoom(result.room);
    },
    onError: () => toast.error("No se pudo registrar el voto."),
  });

  const revealMut = useMutation({
    mutationFn: () => revealFn({ data: { code: room.code, memberId: profile.memberId } }),
    onSuccess: (result) => {
      if (!result.ok) toast.error(result.message);
      else onRoom(result.room);
    },
    onError: () => toast.error("No se pudieron revelar los votos."),
  });

  const nextMut = useMutation({
    mutationFn: () =>
      nextRoundFn({ data: { code: room.code, memberId: profile.memberId, story: storyDraft } }),
    onSuccess: (result) => {
      if (!result.ok) toast.error(result.message);
      else onRoom(result.room);
    },
    onError: () => toast.error("No se pudo abrir la ronda."),
  });

  async function saveStory() {
    const result = await setStoryFn({
      data: { code: room.code, memberId: profile.memberId, story: storyDraft },
    });
    if (!result.ok) toast.error(result.message);
    else onRoom(result.room);
  }

  async function copyInvite() {
    const url = inviteUrl(room.code);
    const text = `Únete a mi sala de Mesa Fibo: ${room.code}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Invitación copiada");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("No se pudo copiar. El número de sala es " + room.code);
    }
  }

  async function shareInvite() {
    const url = inviteUrl(room.code);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Mesa Fibo",
          text: `Únete a la sala ${room.code}`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }
    await copyInvite();
  }

  async function handleLeave() {
    await leaveFn({ data: { code: room.code, memberId: profile.memberId } });
    queryClient.removeQueries({ queryKey: ["room", room.code] });
    await navigate({ to: "/" });
  }

  const canReveal = voting && (room.isHost || room.allVoted) && votedCount > 0;

  return (
    <main className="felt-bg flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <BrandLockup />
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {room.members.length}/{MAX_MEMBERS}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-1.5">
            <DoorOpen className="size-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4 sm:px-6">
        <section className="flex flex-col gap-3 rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Código de sala
            </p>
            <p className="font-display text-3xl font-semibold tracking-widest tabular-nums">
              {room.code}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyInvite} className="flex-1 sm:flex-none">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copiar invitación
            </Button>
            <Button variant="outline" onClick={shareInvite} className="flex-1 sm:flex-none">
              <Share2 className="size-4" />
              Compartir
            </Button>
          </div>
        </section>

        <section className="rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Historia a estimar
          </p>
          {room.isHost ? (
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void saveStory();
              }}
            >
              <Input
                id="story-input"
                value={storyDraft}
                maxLength={MAX_STORY}
                placeholder="Ej. Como usuario, quiero filtrar el listado…"
                onChange={(event) => setStoryDraft(event.target.value.slice(0, MAX_STORY))}
              />
              <Button type="submit" variant="secondary" className="sm:w-auto">
                Guardar
              </Button>
            </form>
          ) : (
            <h2 className="mt-2 font-display text-2xl font-semibold leading-snug">
              {room.story.trim() ? room.story : "El anfitrión aún no ha escrito la historia."}
            </h2>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium text-foreground">Mesa</h2>
            <p className="text-sm tabular-nums text-muted-foreground">
              {votedCount}/{room.members.length} votos
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {room.members.map((member) => (
              <li key={member.id} className="flex flex-col items-center gap-2 rounded-lg bg-card/70 px-2 py-3">
                <SeatCard
                  card={member.vote}
                  hasVoted={member.hasVoted}
                  revealed={room.phase === "revealed"}
                  name={member.name}
                />
                <div className="flex flex-col items-center text-center">
                  <span className="text-lg leading-none" aria-hidden="true">
                    {member.emoji}
                  </span>
                  <span className="mt-1 max-w-full truncate text-xs font-medium">
                    {member.name}
                    {member.id === profile.memberId ? " (tú)" : ""}
                  </span>
                  {member.isHost ? (
                    <span className="text-2xs uppercase tracking-wide text-muted-foreground">
                      Anfitrión
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <StatsPanel room={room} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {voting
                ? room.myVote
                  ? `Tu voto: ${CARD_LABEL[room.myVote]}. Puedes cambiarlo hasta revelar.`
                  : "Elige una carta. Nadie la verá todavía."
                : "Ronda revelada. El anfitrión abre la siguiente."}
            </p>
            <div className="flex gap-2">
              {voting ? (
                <Button
                  onClick={() => revealMut.mutate()}
                  disabled={!canReveal || revealMut.isPending}
                  variant={room.allVoted ? "default" : "secondary"}
                >
                  <Eye className="size-4" />
                  Revelar
                </Button>
              ) : room.isHost ? (
                <Button onClick={() => nextMut.mutate()} disabled={nextMut.isPending}>
                  <RotateCcw className="size-4" />
                  Nueva ronda
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {ALL_CARDS.map((card) => (
              <VoteCard
                key={card}
                card={card}
                size="md"
                face="front"
                selected={room.myVote === card}
                disabled={!voting || voteMut.isPending}
                onSelect={() => voteMut.mutate(card)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function RoomGate({ code }: { code: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const getRoomFn = useServerFn(getRoom);
  const queryClient = useQueryClient();

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const query = useQuery({
    queryKey: ["room", code, profile?.memberId],
    enabled: Boolean(profile?.memberId),
    queryFn: () => getRoomFn({ data: { code, memberId: profile!.memberId } }),
    refetchInterval: 1400,
  });

  function applyRoom(next: RoomState) {
    if (!profile) return;
    queryClient.setQueryData(["room", code, profile.memberId], {
      ok: true as const,
      room: next,
    });
  }

  if (!profile) {
    return (
      <main className="felt-bg min-h-dvh">
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="h-40 animate-pulse rounded-xl bg-card" />
        </div>
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="felt-bg mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-16">
        <BrandLockup />
        <p className="text-muted-foreground">No se pudo conectar con la sala. Recarga e inténtalo.</p>
      </main>
    );
  }

  if (query.data && !query.data.ok && query.data.reason === "not-found") {
    return (
      <main className="felt-bg mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-16">
        <BrandLockup />
        <h1 className="font-display text-3xl font-semibold">Sala no encontrada</h1>
        <p className="text-muted-foreground">{query.data.message}</p>
        <Button onClick={() => window.history.back()}>Volver</Button>
      </main>
    );
  }

  if (query.data?.ok) {
    return <RoomTable room={query.data.room} profile={profile} onRoom={applyRoom} />;
  }

  if (query.data?.reason === "not-member") {
    return (
      <JoinOnly
        code={code}
        onJoined={(room) => {
          setProfile(loadProfile());
          applyRoom(room);
        }}
      />
    );
  }

  return (
    <main className="felt-bg min-h-dvh">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="h-40 animate-pulse rounded-xl bg-card" />
      </div>
    </main>
  );
}

