import { a as ROOM_CODE_RE, c as isCardId, o as computeStats, s as isAvatar } from "./poker-BRGI0D5v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/poker-store.server-BZdVPKLe.js
var _0002_poker_default = "-- Planning-poker rooms. Unowned session nicknames (not accounts).\n-- Rooms older than 24h are pruned by the app; members heartbeat every poll.\n\ncreate table if not exists poker_rooms (\n  code       text primary key,\n  host_id    text not null,\n  story      text not null default '',\n  phase      text not null default 'voting',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists poker_members (\n  id         text primary key,\n  room_code  text not null references poker_rooms(code) on delete cascade,\n  name       text not null,\n  emoji      text not null,\n  joined_at  timestamptz not null default now(),\n  last_seen  timestamptz not null default now()\n);\n\ncreate index if not exists poker_members_room_idx on poker_members (room_code);\n\ncreate table if not exists poker_votes (\n  member_id  text primary key references poker_members(id) on delete cascade,\n  room_code  text not null references poker_rooms(code) on delete cascade,\n  card       text not null\n);\n\ncreate index if not exists poker_votes_room_idx on poker_votes (room_code);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_poker.sql": _0002_poker_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function asPhase(value) {
	return value === "revealed" ? "revealed" : "voting";
}
function randomCode() {
	return String(1e5 + Math.floor(Math.random() * 9e5));
}
async function pruneStale(sql, code) {
	await sql`
    delete from poker_members
    where room_code = ${code}
      and last_seen < now() - interval '45 seconds'
  `;
	await sql`
    delete from poker_rooms
    where created_at < now() - interval '24 hours'
  `;
	const room = (await sql`select code, host_id, story, phase from poker_rooms where code = ${code}`)[0];
	if (!room) return;
	if ((await sql`
      select id from poker_members where id = ${room.host_id} and room_code = ${code}
    `)[0]) return;
	const nextHost = (await sql`
      select id from poker_members
      where room_code = ${code}
      order by joined_at asc
      limit 1
    `)[0];
	if (nextHost) await sql`update poker_rooms set host_id = ${nextHost.id} where code = ${code}`;
}
async function loadState(sql, code, memberId) {
	const room = (await sql`select code, host_id, story, phase from poker_rooms where code = ${code}`)[0];
	if (!room) return {
		ok: false,
		reason: "not-found",
		message: "Esa sala no existe o ya se cerró."
	};
	const members = await sql`
    select id, name, emoji, joined_at::text as joined_at
    from poker_members
    where room_code = ${code}
    order by joined_at asc
  `;
	if (!members.find((m) => m.id === memberId)) return {
		ok: false,
		reason: "not-member",
		message: "No estás en esta sala."
	};
	const votes = await sql`
    select member_id, card from poker_votes where room_code = ${code}
  `;
	const voteByMember = /* @__PURE__ */ new Map();
	for (const vote of votes) if (isCardId(vote.card)) voteByMember.set(vote.member_id, vote.card);
	const phase = asPhase(room.phase);
	const revealed = phase === "revealed";
	const memberViews = members.map((m) => {
		const vote = voteByMember.get(m.id) ?? null;
		return {
			id: m.id,
			name: m.name,
			emoji: m.emoji,
			isHost: m.id === room.host_id,
			hasVoted: vote !== null,
			vote: revealed ? vote : null
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
			stats
		}
	};
}
async function createRoomRecord(input) {
	const name = input.name.trim();
	if (!name || name.length > 50) return {
		ok: false,
		reason: "invalid",
		message: "El nombre debe tener entre 1 y 50 caracteres."
	};
	if (!isAvatar(input.emoji)) return {
		ok: false,
		reason: "invalid",
		message: "Elige un avatar de la lista."
	};
	const sql = await getSql();
	await sql`delete from poker_votes where member_id = ${input.memberId}`;
	await sql`delete from poker_members where id = ${input.memberId}`;
	for (let attempt = 0; attempt < 16; attempt += 1) {
		const code = randomCode();
		if ((await sql`select code from poker_rooms where code = ${code}`)[0]) continue;
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
	return {
		ok: false,
		reason: "invalid",
		message: "No se pudo crear la sala. Inténtalo de nuevo."
	};
}
async function joinRoomRecord(input) {
	const code = input.code.trim();
	const name = input.name.trim();
	if (!ROOM_CODE_RE.test(code)) return {
		ok: false,
		reason: "invalid",
		message: "El código debe ser un número de 6 cifras."
	};
	if (!name || name.length > 50) return {
		ok: false,
		reason: "invalid",
		message: "El nombre debe tener entre 1 y 50 caracteres."
	};
	if (!isAvatar(input.emoji)) return {
		ok: false,
		reason: "invalid",
		message: "Elige un avatar de la lista."
	};
	const sql = await getSql();
	await pruneStale(sql, code);
	if (!(await sql`select code, host_id, story, phase from poker_rooms where code = ${code}`)[0]) return {
		ok: false,
		reason: "not-found",
		message: "Esa sala no existe. Revisa el número."
	};
	if ((await sql`
      select id from poker_members where id = ${input.memberId} and room_code = ${code}
    `)[0]) {
		await sql`
      update poker_members
      set name = ${name}, emoji = ${input.emoji}, last_seen = now()
      where id = ${input.memberId}
    `;
		return loadState(sql, code, input.memberId);
	}
	if (((await sql`select count(*)::int as n from poker_members where room_code = ${code}`)[0]?.n ?? 0) >= 15) return {
		ok: false,
		reason: "full",
		message: "La sala está llena (máximo 15 personas)."
	};
	await sql`delete from poker_votes where member_id = ${input.memberId}`;
	await sql`delete from poker_members where id = ${input.memberId}`;
	await sql`
    insert into poker_members (id, room_code, name, emoji)
    values (${input.memberId}, ${code}, ${name}, ${input.emoji})
  `;
	return loadState(sql, code, input.memberId);
}
async function heartbeatRoom(input) {
	const { code, memberId } = input;
	if (!ROOM_CODE_RE.test(code)) return {
		ok: false,
		reason: "invalid",
		message: "Código de sala no válido."
	};
	const sql = await getSql();
	await pruneStale(sql, code);
	if (!(await sql`
    update poker_members
    set last_seen = now()
    where id = ${memberId} and room_code = ${code}
    returning id
  `)[0]) {
		if (!(await sql`select code from poker_rooms where code = ${code}`)[0]) return {
			ok: false,
			reason: "not-found",
			message: "Esa sala no existe o ya se cerró."
		};
		return {
			ok: false,
			reason: "not-member",
			message: "No estás en esta sala."
		};
	}
	return loadState(sql, code, memberId);
}
async function leaveRoomRecord(input) {
	const sql = await getSql();
	await sql`delete from poker_members where id = ${input.memberId} and room_code = ${input.code}`;
	await pruneStale(sql, input.code);
	if (((await sql`select count(*)::int as n from poker_members where room_code = ${input.code}`)[0]?.n ?? 0) === 0) await sql`delete from poker_rooms where code = ${input.code}`;
	return { ok: true };
}
async function setStoryRecord(input) {
	const story = input.story.trim().slice(0, 200);
	const sql = await getSql();
	await pruneStale(sql, input.code);
	const room = (await sql`select code, host_id, story, phase from poker_rooms where code = ${input.code}`)[0];
	if (!room) return {
		ok: false,
		reason: "not-found",
		message: "Esa sala no existe."
	};
	if (room.host_id !== input.memberId) return {
		ok: false,
		reason: "forbidden",
		message: "Solo el anfitrión puede cambiar la historia."
	};
	await sql`update poker_rooms set story = ${story} where code = ${input.code}`;
	await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
	return loadState(sql, input.code, input.memberId);
}
async function castVoteRecord(input) {
	if (!isCardId(input.card)) return {
		ok: false,
		reason: "invalid",
		message: "Esa carta no existe."
	};
	const sql = await getSql();
	await pruneStale(sql, input.code);
	const room = (await sql`select code, host_id, story, phase from poker_rooms where code = ${input.code}`)[0];
	if (!room) return {
		ok: false,
		reason: "not-found",
		message: "Esa sala no existe."
	};
	if (asPhase(room.phase) === "revealed") return {
		ok: false,
		reason: "forbidden",
		message: "La ronda ya se reveló. Espera a la siguiente."
	};
	if (!(await sql`
      select id from poker_members where id = ${input.memberId} and room_code = ${input.code}
    `)[0]) return {
		ok: false,
		reason: "not-member",
		message: "No estás en esta sala."
	};
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
async function revealRoomRecord(input) {
	const sql = await getSql();
	await pruneStale(sql, input.code);
	const state = await loadState(sql, input.code, input.memberId);
	if (!state.ok) return state;
	if (!state.room.isHost && !state.room.allVoted) return {
		ok: false,
		reason: "forbidden",
		message: "Espera a que voten todos, o a que el anfitrión revele."
	};
	await sql`update poker_rooms set phase = 'revealed' where code = ${input.code}`;
	await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
	return loadState(sql, input.code, input.memberId);
}
async function nextRoundRecord(input) {
	const sql = await getSql();
	await pruneStale(sql, input.code);
	const room = (await sql`select code, host_id, story, phase from poker_rooms where code = ${input.code}`)[0];
	if (!room) return {
		ok: false,
		reason: "not-found",
		message: "Esa sala no existe."
	};
	if (room.host_id !== input.memberId) return {
		ok: false,
		reason: "forbidden",
		message: "Solo el anfitrión puede abrir una ronda nueva."
	};
	const story = typeof input.story === "string" ? input.story.trim().slice(0, 200) : room.story;
	await sql`delete from poker_votes where room_code = ${input.code}`;
	await sql`update poker_rooms set phase = 'voting', story = ${story} where code = ${input.code}`;
	await sql`
    update poker_members set last_seen = now()
    where id = ${input.memberId} and room_code = ${input.code}
  `;
	return loadState(sql, input.code, input.memberId);
}
//#endregion
export { castVoteRecord, createRoomRecord, heartbeatRoom, joinRoomRecord, leaveRoomRecord, nextRoundRecord, revealRoomRecord, setStoryRecord };
