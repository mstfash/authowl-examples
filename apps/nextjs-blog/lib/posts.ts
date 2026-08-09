import 'server-only';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SEED_POSTS } from './seed-posts';
import type { WirePost } from './post-types';

/**
 * A JSON file standing in for your database. Everything user-owned is keyed by
 * `authorId`, which only ever comes from a verified token — never from the
 * request body.
 */

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  tags: string[];
  published: boolean;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
};

export function toWire(post: Post, viewerId: string | null): WirePost {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    tags: post.tags,
    published: post.published,
    authorName: post.authorName,
    likes: post.likedBy.length,
    likedByMe: viewerId ? post.likedBy.includes(viewerId) : false,
    isMine: viewerId === post.authorId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');

let tail: Promise<unknown> = Promise.resolve();
function exclusive<T>(job: () => Promise<T>): Promise<T> {
  const run = tail.then(job, job);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readAll(): Promise<Post[]> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    return Array.isArray(parsed) ? (parsed as Post[]) : [];
  } catch {
    // No file yet: hand back the sample posts so a fresh clone has a feed. The
    // first write persists them and they become ordinary rows.
    return [...SEED_POSTS];
  }
}

async function writeAll(posts: Post[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
}

async function mutate<T>(apply: (posts: Post[]) => { posts: Post[]; result: T }): Promise<T> {
  return exclusive(async () => {
    const { posts, result } = apply(await readAll());
    await writeAll(posts);
    return result;
  });
}

const newest = (a: Post, b: Post) => b.createdAt.localeCompare(a.createdAt);

export async function listPublished(): Promise<Post[]> {
  return (await readAll()).filter((post) => post.published).sort(newest);
}

export async function listByAuthor(authorId: string): Promise<Post[]> {
  return (await readAll()).filter((post) => post.authorId === authorId).sort(newest);
}

export async function findPost(id: string): Promise<Post | null> {
  return (await readAll()).find((post) => post.id === id) ?? null;
}

export type PostDraft = {
  title: string;
  body: string;
  tags: string[];
  published: boolean;
};

export async function createPost(
  author: { id: string; name: string },
  draft: PostDraft,
): Promise<Post> {
  const now = new Date().toISOString();
  const post: Post = {
    id: randomUUID(),
    authorId: author.id,
    authorName: author.name,
    ...draft,
    likedBy: [],
    createdAt: now,
    updatedAt: now,
  };
  return mutate((posts) => ({ posts: [post, ...posts], result: post }));
}

/** Returns null when the post is missing *or* owned by someone else. */
export async function updatePost(
  id: string,
  authorId: string,
  draft: PostDraft,
): Promise<Post | null> {
  return mutate((posts) => {
    const index = posts.findIndex((post) => post.id === id && post.authorId === authorId);
    if (index === -1) return { posts, result: null };
    const updated: Post = { ...posts[index]!, ...draft, updatedAt: new Date().toISOString() };
    const next = [...posts];
    next[index] = updated;
    return { posts: next, result: updated };
  });
}

export async function deletePost(id: string, authorId: string): Promise<boolean> {
  return mutate((posts) => {
    const next = posts.filter((post) => !(post.id === id && post.authorId === authorId));
    return { posts: next, result: next.length !== posts.length };
  });
}

export async function toggleLike(id: string, userId: string): Promise<Post | null> {
  return mutate((posts) => {
    const index = posts.findIndex((post) => post.id === id && post.published);
    if (index === -1) return { posts, result: null };
    const post = posts[index]!;
    const likedBy = post.likedBy.includes(userId)
      ? post.likedBy.filter((liker) => liker !== userId)
      : [...post.likedBy, userId];
    const updated: Post = { ...post, likedBy };
    const next = [...posts];
    next[index] = updated;
    return { posts: next, result: updated };
  });
}
