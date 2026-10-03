import { getSql, type Sql } from "@/lib/db";
import {
  MAX_MEMBERS,
  MAX_NAME,
  MAX_STORY,
  ROOM_CODE_RE,
  computeStats,
  isAvatar,
  isCardId,
  type CardId,
  type MemberView,
  type RoomPhase,
  type RoomResult,
  type RoomState,
} from "./poker";

type RoomRow = {
  code: string;
  host_id: string;
  story: string;
  phase: string;
};

type MemberRow = {
  id: string;
  name: string;
  emoji: string;
  joined_at: string;
};

type VoteRow = {
  member_id: string;
  card: string;
};

function asPhase(value: string): RoomPhase {
  return value === "revealed" ? "revealed" : "voting";
}

function randomCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

async function pruneStale(sql: Sql, code: string): Promise<void> {
  await sql`
    delete from poker_members
    where room_code = ${code}
      and last_seen < now() - interval '45 seconds'
  `;
  await sql`
    delete from poker_rooms
    where created_at < now() - interval '24 hours'
  `;

  const room = (
    await sql<RoomRow>`select code, host_id, story, phase from poker_rooms where code = ${code}`
  )[0];
  if (!room) return;

  const hostAlive = (
    await sql<{ id: string }>`
      select id from poker_members where id = ${room.host_id} and room_code = ${code}
    `
  )[0];
  if (hostAlive) return;

  const nextHost = (
    await sql<{ id: string }>`
      select id from poker_members
      where room_code = ${code}
      order by joined_at asc
      limit 1
    `
  )[0];
  if (nextHost) {
    await sql`update poker_rooms set host_id = ${nextHost.id} where code = ${code}`;
  }
}

async function loadState(sql: Sql, code: string, memberId: string): Promise<RoomResult> {
  const room = (
    await sql<RoomRow>`select code, host_id, story, phase from poker_rooms where code = ${code}`
  )[0];
  if (!room) {
    return { ok: false, reason: "not-found", message: "Esa sala no existe o ya se cerró." };
  }

  const members = await sql<MemberRow>`
    select id, name, emoji, joined_at::text as joined_at
    from poker_members
    where room_code = ${code}
    order by joined_at asc
  `;

  const me = members.find((m) => m.id === memberId);
  if (!me) {
    return { ok: false, reason: "not-member", message: "No estás en esta sala." };
  }

  const votes = await sql<VoteRow>`
    select member_id, card from poker_votes where room_code = ${code}
  `;
  const voteByMember = new Map<string, CardId>();
  for (const vote of votes) {
    if (isCardId(vote.card)) voteByMember.set(vote.member_id, vote.card);
  }

  const phase = asPhase(room.phase);
  const revealed = phase === "revealed";
  const memberViews: MemberView[] = members.map((m) => {
    const vote = voteByMember.get(m.id) ?? null;
    return {
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      isHost: m.id === room.host_id,
      hasVoted: vote !== null,
      vote: revealed ? vote : null,
    };
  });

  const allVoted = members.length > 0 && members.every((m) => voteByMember.has(m.id));
  const stats = revealed ? computeStats([...voteByMember.values()]) : null;

  return {
    ok: true,
    room: {
      code: room.code,
      story: room.story,
      phase,
      members: memberViews,
      myVote: voteByMember.get(memberId) ?? null,
      isHost: memberId === room.host_id,
      allVoted,
      stats,
    },
  };
}

export async function createRoomRecord(input: {
  memberId: string;
  name: string;
  emoji: string;
}): Promise<RoomResult> {
  const name = input.name.trim();
  if (!name || name.length > MAX_NAME) {
    return { ok: false, reason: "invalid", message: "El nombre debe tener entre 1 y 50 caracteres." };
  }
  if (!isAvatar(input.emoji)) {
    return { ok: false, reason: "invalid", message: "Elige un avatar de la lista." };
  }

  const sql = await getSql();
  await sql`delete from poker_votes where member_id = ${input.memberId}`;
  await sql`delete from poker_members where id = ${input.memberId}`;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const code = randomCode();
    const clash = (await sql<{ code: string }>`select code from poker_rooms where code = ${code}`)[0];
    if (clash) continue;

    await sql`
      insert into poker_rooms (code, host_id, story, phase)
      values (${code}, ${input.memberId}, '', 'voting')
    `;
    await sql`
      insert into poker_members (id, room_code, name, emoji)
      values (${input.memberId}, ${code}, ${name}, ${input.emoji})
    `;
    return loadState(sql, code, input.memberId);
  }

  return { ok: false, reason: "invalid", message: "No se pudo crear la sala. Inténtalo de nuevo." };
}

export async function joinRoomRecord(input: {
  code: string;
  memberId: string;
  name: string;
  emoji: string;
}): Promise<RoomResult> {
  const code = input.code.trim();
  const name = input.name.trim();
  if (!ROOM_CODE_RE.test(code)) {
    return { ok: false, reason: "invalid", message: "El código debe ser un número de 6 cifras." };
  }
  if (!name || name.length > MAX_NAME) {
    return { ok: false, reason: "invalid", message: "El nombre debe tener entre 1 y 50 caracteres." };
  }
  if (!isAvatar(input.emoji)) {
    return { ok: false, reason: "invalid", message: "Elige un avatar de la lista." };
  }

  const sql = await getSql();
  await pruneStale(sql, code);

  const room = (await sql<RoomRow>`select code, host_id, story, phase from poker_rooms where code = ${code}`)[0];
  if (!room) {
    return { ok: false, reason: "not-found", message: "Esa sala no existe. Revisa el número." };
  }

  const alreadyHere = (
    await sql<{ id: string }>`
      select id from poker_members where id = ${input.memberId} and room_code = ${code}
    `
  )[0];

  if (alreadyHere) {
    await sql`
      update poker_members
      set name = ${name}, emoji = ${input.emoji}, last_seen = now()
      where id = ${input.memberId}
    `;
    return loadState(sql, code, input.memberId);
  }

  const countRow = (
    await sql<{ n: number }>`select count(*)::int as n from poker_members where room_code = ${code}`
  )[0];
  if ((countRow?.n ?? 0) >= MAX_MEMBERS) {
    return { ok: false, reason: "full", message: "La sala está llena (máximo 15 personas)." };
  }

  await sql`delete from poker_votes where member_id = ${input.memberId}`;
  await sql`delete from poker_members where id = ${input.memberId}`;
  await sql`
    insert into poker_members (id, room_code, name, emoji)
    values (${input.memberId}, ${code}, ${name}, ${input.emoji})
  `;
  return loadState(sql, code, input.memberId);
}

export async function heartbeatRoom(input: { code: string; memberId: string }): Promise<RoomResult> {
  const { code, memberId } = input;
  if (!ROOM_CODE_RE.test(code)) {
    return { ok: false, reason: "invalid", message: "Código de sala no válido." };
  }
  const sql = await getSql();
  await pruneStale(sql, code);
  const touched = await sql<{ id: string }>`
    update poker_members
    set last_seen = now()
    where id = ${memberId} and room_code = ${code}
    returning id
  `;
  if (!touched[0]) {
    const room = (await sql<{ code: string }>`select code from poker_rooms where code = ${code}`)[0];
    if (!room) {
      return { ok: false, reason: "not-found", message: "Esa sala no existe o ya se cerró." };
    }
    return { ok: false, reason: "not-member", message: "No estás en esta sala." };
  }
  return loadState(sql, code, memberId);
}

export async function leaveRoomRecord(input: { code: string; memberId: string }): Promise<{ ok: true }> {
  const sql = await getSql();
  await sql`delete from poker_members where id = ${input.memberId} and room_code = ${input.code}`;
  await pruneStale(sql, input.code);
  const remaining = (
    await sql<{ n: number }>`select count(*)::int as n from poker_members where room_code = ${input.code}`
  )[0];
  if ((remaining?.n ?? 0) === 0) {
    await sql`delete from poker_rooms where code = ${input.code}`;
  }
  return { ok: true };
}

export async function setStoryRecord(input: {
  code: string;
  memberId: string;
  story: string;
}): Promise<RoomResult> {
  const story = input.story.trim().slice(0, MAX_STORY);
  const sql = await getSql();
  await pruneStale(sql, input.code);
  const room = (await sql<RoomRow>`select code, host_id, story, phase from poker_rooms where code = ${input.code}`)[0];
  if (!room) return { ok: false, reason: "not-found", message: "Esa sala no existe." };
  if (room.host_id !== input.memberId) {
    return { ok: false, reason: "forbidden", message: "Solo el anfitrión puede cambiar la historia." };
  }
  await sql`update poker_rooms set story = ${story} where code = ${input.code}`;
  await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
  return loadState(sql, input.code, input.memberId);
}

export async function castVoteRecord(input: {
  code: string;
  memberId: string;
  card: string;
}): Promise<RoomResult> {
  if (!isCardId(input.card)) {
    return { ok: false, reason: "invalid", message: "Esa carta no existe." };
  }
  const sql = await getSql();
  await pruneStale(sql, input.code);
  const room = (await sql<RoomRow>`select code, host_id, story, phase from poker_rooms where code = ${input.code}`)[0];
  if (!room) return { ok: false, reason: "not-found", message: "Esa sala no existe." };
  if (asPhase(room.phase) === "revealed") {
    return { ok: false, reason: "forbidden", message: "La ronda ya se reveló. Espera a la siguiente." };
  }
  const member = (
    await sql<{ id: string }>`
      select id from poker_members where id = ${input.memberId} and room_code = ${input.code}
    `
  )[0];
  if (!member) return { ok: false, reason: "not-member", message: "No estás en esta sala." };

  await sql`
    insert into poker_votes (member_id, room_code, card)
    values (${input.memberId}, ${input.code}, ${input.card})
    on conflict (member_id) do update set card = excluded.card, room_code = excluded.room_code
  `;
  await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
  return loadState(sql, input.code, input.memberId);
}

export async function revealRoomRecord(input: { code: string; memberId: string }): Promise<RoomResult> {
  const sql = await getSql();
  await pruneStale(sql, input.code);
  const state = await loadState(sql, input.code, input.memberId);
  if (!state.ok) return state;
  if (!state.room.isHost && !state.room.allVoted) {
    return { ok: false, reason: "forbidden", message: "Espera a que voten todos, o a que el anfitrión revele." };
  }
  await sql`update poker_rooms set phase = 'revealed' where code = ${input.code}`;
  await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
  return loadState(sql, input.code, input.memberId);
}

export async function nextRoundRecord(input: {
  code: string;
  memberId: string;
  story?: string;
}): Promise<RoomResult> {
  const sql = await getSql();
  await pruneStale(sql, input.code);
  const room = (await sql<RoomRow>`select code, host_id, story, phase from poker_rooms where code = ${input.code}`)[0];
  if (!room) return { ok: false, reason: "not-found", message: "Esa sala no existe." };
  if (room.host_id !== input.memberId) {
    return { ok: false, reason: "forbidden", message: "Solo el anfitrión puede abrir una ronda nueva." };
  }
  const story = typeof input.story === "string" ? input.story.trim().slice(0, MAX_STORY) : room.story;
  await sql`delete from poker_votes where room_code = ${input.code}`;
  await sql`update poker_rooms set phase = 'voting', story = ${story} where code = ${input.code}`;
  await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
  return loadState(sql, input.code, input.memberId);
}
