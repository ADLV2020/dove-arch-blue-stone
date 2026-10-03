import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MAX_NAME, MAX_STORY, ROOM_CODE_RE, type RoomResult } from "./poker";

const identityFields = {
  memberId: z.string().min(8).max(80),
  name: z.string().trim().min(1).max(MAX_NAME),
  emoji: z.string().min(1).max(16),
};

const identitySchema = z.object(identityFields);
const roomIdentitySchema = z.object({
  ...identityFields,
  code: z.string().regex(ROOM_CODE_RE),
});
const heartbeatSchema = z.object({
  code: z.string().regex(ROOM_CODE_RE),
  memberId: z.string().min(8).max(80),
});
const storySchema = heartbeatSchema.extend({
  story: z.string().max(MAX_STORY),
});
const voteSchema = heartbeatSchema.extend({
  card: z.string().min(1).max(16),
});
const nextRoundSchema = heartbeatSchema.extend({
  story: z.string().max(MAX_STORY).optional(),
});

export const createRoom = createServerFn({ method: "POST" })
  .validator((data: unknown) => identitySchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { createRoomRecord } = await import("./poker-store.server");
    return createRoomRecord(data);
  });

export const joinRoom = createServerFn({ method: "POST" })
  .validator((data: unknown) => roomIdentitySchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { joinRoomRecord } = await import("./poker-store.server");
    return joinRoomRecord(data);
  });

export const getRoom = createServerFn({ method: "POST" })
  .validator((data: unknown) => heartbeatSchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { heartbeatRoom } = await import("./poker-store.server");
    return heartbeatRoom(data);
  });

export const leaveRoom = createServerFn({ method: "POST" })
  .validator((data: unknown) => heartbeatSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { leaveRoomRecord } = await import("./poker-store.server");
    return leaveRoomRecord(data);
  });

export const setStory = createServerFn({ method: "POST" })
  .validator((data: unknown) => storySchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { setStoryRecord } = await import("./poker-store.server");
    return setStoryRecord(data);
  });

export const castVote = createServerFn({ method: "POST" })
  .validator((data: unknown) => voteSchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { castVoteRecord } = await import("./poker-store.server");
    return castVoteRecord(data);
  });

export const revealVotes = createServerFn({ method: "POST" })
  .validator((data: unknown) => heartbeatSchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { revealRoomRecord } = await import("./poker-store.server");
    return revealRoomRecord(data);
  });

export const nextRound = createServerFn({ method: "POST" })
  .validator((data: unknown) => nextRoundSchema.parse(data))
  .handler(async ({ data }): Promise<RoomResult> => {
    const { nextRoundRecord } = await import("./poker-store.server");
    return nextRoundRecord(data);
  });
