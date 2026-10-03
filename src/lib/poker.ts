export const MAX_MEMBERS = 15;
export const MAX_NAME = 50;
export const MAX_STORY = 200;
export const ROOM_CODE_RE = /^\d{6}$/;

export const FIB_CARDS = ["1", "2", "3", "5", "8", "13", "21", "100"] as const;
export const SPECIAL_CARDS = ["wildcard", "question", "coffee", "infinity"] as const;
export const ALL_CARDS = [...FIB_CARDS, ...SPECIAL_CARDS] as const;

export type FibCard = (typeof FIB_CARDS)[number];
export type SpecialCard = (typeof SPECIAL_CARDS)[number];
export type CardId = (typeof ALL_CARDS)[number];

export const CARD_NUMERIC: Record<string, number> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "5": 5,
  "8": 8,
  "13": 13,
  "21": 21,
  "100": 100,
};

export const CARD_LABEL: Record<CardId, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "5": "5",
  "8": "8",
  "13": "13",
  "21": "21",
  "100": "100",
  wildcard: "Comodín",
  question: "?",
  coffee: "Café",
  infinity: "∞",
};

export const AVATARS = [
  "🦊",
  "🐺",
  "🐱",
  "🐯",
  "🦁",
  "🐻",
  "🐼",
  "🐨",
  "🐸",
  "🦉",
  "🐧",
  "🐤",
  "🐙",
  "🦄",
  "🐲",
  "🦋",
  "🐢",
  "🐝",
  "🐳",
  "🌸",
  "🍀",
  "🌙",
  "🔥",
  "⚡",
  "🎩",
  "🎲",
  "🧭",
  "🎯",
] as const;

export type Avatar = (typeof AVATARS)[number];

export function isCardId(value: string): value is CardId {
  return (ALL_CARDS as readonly string[]).includes(value);
}

export function isAvatar(value: string): value is Avatar {
  return (AVATARS as readonly string[]).includes(value);
}

export type RoomPhase = "voting" | "revealed";

export type MemberView = {
  id: string;
  name: string;
  emoji: string;
  isHost: boolean;
  hasVoted: boolean;
  vote: CardId | null;
};

export type VoteStats = {
  average: number | null;
  min: number | null;
  max: number | null;
  consensus: boolean;
  tally: { card: CardId; count: number }[];
};

export type RoomState = {
  code: string;
  story: string;
  phase: RoomPhase;
  members: MemberView[];
  myVote: CardId | null;
  isHost: boolean;
  allVoted: boolean;
  stats: VoteStats | null;
};

export type RoomResult =
  | { ok: true; room: RoomState }
  | {
      ok: false;
      reason: "not-found" | "not-member" | "full" | "invalid" | "forbidden";
      message: string;
    };

export function computeStats(votes: CardId[]): VoteStats {
  const counts = new Map<CardId, number>();
  for (const card of votes) {
    counts.set(card, (counts.get(card) ?? 0) + 1);
  }
  const tally = ALL_CARDS.filter((card) => counts.has(card)).map((card) => ({
    card,
    count: counts.get(card) ?? 0,
  }));

  const nums = votes
    .map((card) => CARD_NUMERIC[card])
    .filter((n): n is number => typeof n === "number");

  if (nums.length === 0) {
    return { average: null, min: null, max: null, consensus: false, tally };
  }

  const sum = nums.reduce((a, b) => a + b, 0);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const average = Math.round((sum / nums.length) * 10) / 10;
  const consensus = nums.every((n) => n === nums[0]);

  return { average, min, max, consensus, tally };
}
