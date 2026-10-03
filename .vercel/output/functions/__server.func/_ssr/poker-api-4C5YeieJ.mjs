import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as ROOM_CODE_RE } from "./poker-BRGI0D5v.mjs";
import { i as string, r as object } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/poker-api-4C5YeieJ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var identityFields = {
	memberId: string().min(8).max(80),
	name: string().trim().min(1).max(50),
	emoji: string().min(1).max(16)
};
var identitySchema = object(identityFields);
var roomIdentitySchema = object({
	...identityFields,
	code: string().regex(ROOM_CODE_RE)
});
var heartbeatSchema = object({
	code: string().regex(ROOM_CODE_RE),
	memberId: string().min(8).max(80)
});
var storySchema = heartbeatSchema.extend({ story: string().max(200) });
var voteSchema = heartbeatSchema.extend({ card: string().min(1).max(16) });
var nextRoundSchema = heartbeatSchema.extend({ story: string().max(200).optional() });
var createRoom_createServerFn_handler = createServerRpc({
	id: "25bff56d3ab39c0ea842e207bd91f4976c52f9a7bb441a8fe3590e3fec4460e9",
	name: "createRoom",
	filename: "src/lib/poker-api.ts"
}, (opts) => createRoom.__executeServer(opts));
var createRoom = createServerFn({ method: "POST" }).validator((data) => identitySchema.parse(data)).handler(createRoom_createServerFn_handler, async ({ data }) => {
	const { createRoomRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return createRoomRecord(data);
});
var joinRoom_createServerFn_handler = createServerRpc({
	id: "fb7d9aedc321f17bdff61b3dcee87b244419708c904f20739c9b5f8b911743c6",
	name: "joinRoom",
	filename: "src/lib/poker-api.ts"
}, (opts) => joinRoom.__executeServer(opts));
var joinRoom = createServerFn({ method: "POST" }).validator((data) => roomIdentitySchema.parse(data)).handler(joinRoom_createServerFn_handler, async ({ data }) => {
	const { joinRoomRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return joinRoomRecord(data);
});
var getRoom_createServerFn_handler = createServerRpc({
	id: "111e592024735c6e6565d15afe2f34107ca026ba7b34b294522d2e9b7562484c",
	name: "getRoom",
	filename: "src/lib/poker-api.ts"
}, (opts) => getRoom.__executeServer(opts));
var getRoom = createServerFn({ method: "POST" }).validator((data) => heartbeatSchema.parse(data)).handler(getRoom_createServerFn_handler, async ({ data }) => {
	const { heartbeatRoom } = await import("./poker-store.server-BZdVPKLe.mjs");
	return heartbeatRoom(data);
});
var leaveRoom_createServerFn_handler = createServerRpc({
	id: "dd5f2ddd64492531f62e4035db6987eb070e44caf07a100b18fe1b1e0235660e",
	name: "leaveRoom",
	filename: "src/lib/poker-api.ts"
}, (opts) => leaveRoom.__executeServer(opts));
var leaveRoom = createServerFn({ method: "POST" }).validator((data) => heartbeatSchema.parse(data)).handler(leaveRoom_createServerFn_handler, async ({ data }) => {
	const { leaveRoomRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return leaveRoomRecord(data);
});
var setStory_createServerFn_handler = createServerRpc({
	id: "88b2fdfdd38e51b386c9197c5bb0c130409113578c4b52de919bbbfb2e2eeeb0",
	name: "setStory",
	filename: "src/lib/poker-api.ts"
}, (opts) => setStory.__executeServer(opts));
var setStory = createServerFn({ method: "POST" }).validator((data) => storySchema.parse(data)).handler(setStory_createServerFn_handler, async ({ data }) => {
	const { setStoryRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return setStoryRecord(data);
});
var castVote_createServerFn_handler = createServerRpc({
	id: "2bbd6b1bdda510def209a693e7ae247ba133a8c9e6afab392c0f94b0c90a9252",
	name: "castVote",
	filename: "src/lib/poker-api.ts"
}, (opts) => castVote.__executeServer(opts));
var castVote = createServerFn({ method: "POST" }).validator((data) => voteSchema.parse(data)).handler(castVote_createServerFn_handler, async ({ data }) => {
	const { castVoteRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return castVoteRecord(data);
});
var revealVotes_createServerFn_handler = createServerRpc({
	id: "6b462f1bbcc897ce0100e7fce03697dc40527d530295ed15b185a4702041d524",
	name: "revealVotes",
	filename: "src/lib/poker-api.ts"
}, (opts) => revealVotes.__executeServer(opts));
var revealVotes = createServerFn({ method: "POST" }).validator((data) => heartbeatSchema.parse(data)).handler(revealVotes_createServerFn_handler, async ({ data }) => {
	const { revealRoomRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return revealRoomRecord(data);
});
var nextRound_createServerFn_handler = createServerRpc({
	id: "3e2e66a89bf84f19627b4b82264758fec0fab84581bad77ca32ee932ca965f6b",
	name: "nextRound",
	filename: "src/lib/poker-api.ts"
}, (opts) => nextRound.__executeServer(opts));
var nextRound = createServerFn({ method: "POST" }).validator((data) => nextRoundSchema.parse(data)).handler(nextRound_createServerFn_handler, async ({ data }) => {
	const { nextRoundRecord } = await import("./poker-store.server-BZdVPKLe.mjs");
	return nextRoundRecord(data);
});
//#endregion
export { castVote_createServerFn_handler, createRoom_createServerFn_handler, getRoom_createServerFn_handler, joinRoom_createServerFn_handler, leaveRoom_createServerFn_handler, nextRound_createServerFn_handler, revealVotes_createServerFn_handler, setStory_createServerFn_handler };
