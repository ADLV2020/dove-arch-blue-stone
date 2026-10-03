import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, Hash, Plus } from "lucide-react";
import { FIB_CARDS, ROOM_CODE_RE, type RoomState } from "@/lib/poker";
import { emptyProfile, loadProfile, saveProfile, type Profile } from "@/lib/profile";
import { createRoom, joinRoom } from "@/lib/poker-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLockup } from "./logo";
import { IdentityForm } from "./identity-form";
import { VoteCard } from "./vote-card";

export function Lobby({ presetCode = "" }: { presetCode?: string }) {
  const navigate = useNavigate();
  const createRoomFn = useServerFn(createRoom);
  const joinRoomFn = useServerFn(joinRoom);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"create" | "join">(presetCode ? "join" : "create");
  const [code, setCode] = useState(presetCode);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  useEffect(() => {
    if (presetCode) {
      setCode(presetCode);
      setMode("join");
    }
  }, [presetCode]);

  const fan = useMemo(() => FIB_CARDS.slice(0, 5), []);

  async function handleCreate() {
    setPending(true);
    saveProfile(profile);
    try {
      const result = await createRoomFn({
        data: { memberId: profile.memberId, name: profile.name, emoji: profile.emoji },
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      await navigate({ to: "/sala/$code", params: { code: result.room.code } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la sala.");
    } finally {
      setPending(false);
    }
  }

  async function handleJoin() {
    const trimmed = code.replace(/\D/g, "").slice(0, 6);
    if (!ROOM_CODE_RE.test(trimmed)) {
      toast.error("El código es un número de 6 cifras.");
      return;
    }
    setPending(true);
    saveProfile(profile);
    try {
      const result = await joinRoomFn({
        data: {
          code: trimmed,
          memberId: profile.memberId,
          name: profile.name,
          emoji: profile.emoji,
        },
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      await navigate({ to: "/sala/$code", params: { code: result.room.code } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo entrar a la sala.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="felt-bg mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-8 sm:py-12">
      <BrandLockup />

      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="stagger-in flex flex-col gap-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Planning poker
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Vota historias con cartas Fibonacci.
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            Crea una sala, comparte el número con tu equipo (hasta 15 personas) y estimad en
            silencio. Nadie ve el voto del otro hasta que reveláis juntos.
          </p>

          <div className="relative mt-2 mb-6 flex h-44 items-end justify-center sm:h-52">
            {fan.map((card, index) => (
              <div
                key={card}
                className="absolute origin-bottom"
                style={{
                  transform: `translateX(${(index - 2) * 28}px) rotate(${(index - 2) * 8}deg)`,
                }}
              >
                <VoteCard card={card} size="lg" face="front" />
              </div>
            ))}
          </div>

          <ol className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
              <span className="font-medium text-foreground">1. Entra</span>
              <p className="mt-1">Nombre corto y un avatar. Luego crea o únete con el código.</p>
            </li>
            <li className="rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
              <span className="font-medium text-foreground">2. Invita</span>
              <p className="mt-1">Comparte el número de 6 cifras. El resto entra a la misma mesa.</p>
            </li>
            <li className="rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
              <span className="font-medium text-foreground">3. Vota</span>
              <p className="mt-1">1, 2, 3, 5, 8, 13, 21, 100, más comodín, duda, café e infinito.</p>
            </li>
            <li className="rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
              <span className="font-medium text-foreground">4. Revelad</span>
              <p className="mt-1">Cuando todos hayan elegido, se dan la vuelta las cartas.</p>
            </li>
          </ol>
        </section>

        <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                mode === "create" ? "bg-paper text-paper-ink" : "text-muted-foreground"
              }`}
            >
              <Plus className="size-4" />
              Crear sala
            </button>
            <button
              type="button"
              onClick={() => setMode("join")}
              className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                mode === "join" ? "bg-paper text-paper-ink" : "text-muted-foreground"
              }`}
            >
              <Hash className="size-4" />
              Unirme
            </button>
          </div>

          {ready ? (
            <IdentityForm
              profile={profile}
              onChange={setProfile}
              pending={pending}
              submitLabel={mode === "create" ? "Abrir una sala" : "Entrar a la sala"}
              onSubmit={mode === "create" ? handleCreate : handleJoin}
              extra={
                mode === "join" ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="room-code">Número de sala</Label>
                    <Input
                      id="room-code"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="font-display text-center text-xl tracking-widest"
                    />
                  </div>
                ) : null
              }
            />
          ) : (
            <div className="h-64 animate-pulse rounded-lg bg-secondary" />
          )}

          {mode === "create" ? (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRight className="size-3.5" />
              Tú serás el anfitrión: escribes la historia y abres cada ronda.
            </p>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Pide el número de 6 cifras a quien creó la sala.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export function JoinOnly({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (room: RoomState) => void;
}) {
  const navigate = useNavigate();
  const joinRoomFn = useServerFn(joinRoom);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  async function handleJoin() {
    setPending(true);
    saveProfile(profile);
    try {
      const result = await joinRoomFn({
        data: {
          code,
          memberId: profile.memberId,
          name: profile.name,
          emoji: profile.emoji,
        },
      });
      if (!result.ok) {
        toast.error(result.message);
        if (result.reason === "not-found") {
          await navigate({ to: "/" });
        }
        return;
      }
      onJoined(result.room);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo entrar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="felt-bg mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-4 py-10">
      <BrandLockup />
      <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Invitación
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Sala {code}</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Entra con tu nombre y avatar para sentarte a votar.
        </p>
        {ready ? (
          <IdentityForm
            profile={profile}
            onChange={setProfile}
            pending={pending}
            submitLabel="Sentarme en la mesa"
            onSubmit={handleJoin}
          />
        ) : (
          <div className="h-64 animate-pulse rounded-lg bg-secondary" />
        )}
        <Button variant="ghost" className="mt-3 w-full" onClick={() => navigate({ to: "/" })}>
          Ir al inicio
        </Button>
      </div>
    </main>
  );
}
