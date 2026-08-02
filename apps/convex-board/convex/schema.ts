import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * One shared team board. Cards remember who created them — that value comes
 * from the verified JWT inside each mutation, never from the client.
 */
export default defineSchema({
  cards: defineTable({
    /** The AuthOwl user id: the `sub` claim Convex verified. */
    authorId: v.string(),
    authorName: v.string(),
    title: v.string(),
    column: v.union(v.literal('todo'), v.literal('doing'), v.literal('done')),
    /** Fractional rank, so a card can slide between two others without a rewrite. */
    order: v.number(),
  }).index('by_column', ['column', 'order']),
});
