import { AVATARS, type Avatar } from "./poker";

const KEY = "mesa-fibo-profile";

export type Profile = {
  memberId: string;
  name: string;
  emoji: Avatar;
};

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emptyProfile(): Profile {
  return { memberId: newId(), name: "", emoji: AVATARS[0] };
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<Profile>;
    const emoji = typeof parsed.emoji === "string" && (AVATARS as readonly string[]).includes(parsed.emoji)
      ? (parsed.emoji as Avatar)
      : AVATARS[0];
    return {
      memberId: typeof parsed.memberId === "string" && parsed.memberId.length >= 8
        ? parsed.memberId
        : newId(),
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 50) : "",
      emoji,
    };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}
