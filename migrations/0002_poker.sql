-- Planning-poker rooms. Unowned session nicknames (not accounts).
-- Rooms older than 24h are pruned by the app; members heartbeat every poll.

create table if not exists poker_rooms (
  code       text primary key,
  host_id    text not null,
  story      text not null default '',
  phase      text not null default 'voting',
  created_at timestamptz not null default now()
);

create table if not exists poker_members (
  id         text primary key,
  room_code  text not null references poker_rooms(code) on delete cascade,
  name       text not null,
  emoji      text not null,
  joined_at  timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);

create index if not exists poker_members_room_idx on poker_members (room_code);

create table if not exists poker_votes (
  member_id  text primary key references poker_members(id) on delete cascade,
  room_code  text not null references poker_rooms(code) on delete cascade,
  card       text not null
);

create index if not exists poker_votes_room_idx on poker_votes (room_code);
