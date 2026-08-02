import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { optionalViewer, requireViewer, viewerOf, type BlogEnv, type Viewer } from './auth.js';
import {
  createPost,
  deletePost,
  findPost,
  listByAuthor,
  listPublished,
  toggleLike,
  updatePost,
  type Post,
  type PostDraft,
} from './store.js';

/**
 * Load .env.local (gitignored) the way Vite does for the front end, so both
 * halves of the app read the same file. Node 20.12+ / 21.7+.
 */
try {
  process.loadEnvFile('.env.local');
} catch {
  // Missing file is fine — the check below produces the useful message.
}

if (!process.env.AUTHOWL_PUBLISHABLE_KEY || !process.env.AUTHOWL_API_URL) {
  console.error(
    '\n  Missing AuthOwl configuration.\n' +
      '  Copy .env.example to .env.local and fill in AUTHOWL_PUBLISHABLE_KEY and AUTHOWL_API_URL.\n',
  );
  process.exit(1);
}

const PORT = Number(process.env.API_PORT ?? 8787);
const MAX_TITLE = 120;
const MAX_BODY = 20_000;
const MAX_TAGS = 5;

const app = new Hono<BlogEnv>();

/** What the browser sees. `likedBy` stays server-side; only counts go out. */
function toWire(post: Post, viewer?: Viewer) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    tags: post.tags,
    published: post.published,
    authorName: post.authorName,
    likes: post.likedBy.length,
    likedByMe: viewer ? post.likedBy.includes(viewer.id) : false,
    isMine: viewer ? post.authorId === viewer.id : false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function readDraft(payload: unknown): PostDraft {
  const input = (payload ?? {}) as Record<string, unknown>;
  const title = typeof input.title === 'string' ? input.title.trim().slice(0, MAX_TITLE) : '';
  const body = typeof input.body === 'string' ? input.body.trim().slice(0, MAX_BODY) : '';
  if (!title) throw new HTTPException(422, { message: 'A post needs a title.' });
  if (!body) throw new HTTPException(422, { message: 'A post needs a body.' });

  const tags = Array.isArray(input.tags)
    ? Array.from(
        new Set(
          input.tags
            .filter((tag): tag is string => typeof tag === 'string')
            .map((tag) => tag.trim().toLowerCase().slice(0, 24))
            .filter(Boolean),
        ),
      ).slice(0, MAX_TAGS)
    : [];

  return { title, body, tags, published: input.published !== false };
}

/**
 * The `:id` path parameter. Hono types it as possibly-undefined once a route
 * has middleware, so narrow it once here instead of at four call sites.
 */
function postId(context: Context<BlogEnv>): string {
  const id = context.req.param('id');
  if (!id) throw new HTTPException(400, { message: 'Missing post id.' });
  return id;
}

/** Display name from the *verified* claims — never from the request body. */
function authorFrom(viewer: Viewer): { id: string; name: string } {
  const { name, email } = viewer.claims as { name?: unknown; email?: unknown };
  if (typeof name === 'string' && name.trim()) return { id: viewer.id, name: name.trim() };
  if (typeof email === 'string' && email.includes('@')) {
    return { id: viewer.id, name: email.split('@')[0]! };
  }
  return { id: viewer.id, name: 'Anonymous owl' };
}

/* --- public ------------------------------------------------------------- */

/** The feed. No token needed; a token only adds `likedByMe` / `isMine`. */
app.get('/api/posts', optionalViewer, async (context) => {
  const viewer = context.get('viewer');
  const posts = await listPublished();
  return context.json({ posts: posts.map((post) => toWire(post, viewer)) });
});

/* --- authenticated ------------------------------------------------------ */

/** Everything the API knows about you, straight from the verified token. */
app.get('/api/me', requireViewer, (context) => {
  const viewer = viewerOf(context);
  return context.json({ userId: viewer.id, claims: viewer.claims });
});

/** Your own posts, drafts included. */
app.get('/api/posts/mine', requireViewer, async (context) => {
  const viewer = viewerOf(context);
  const posts = await listByAuthor(viewer.id);
  return context.json({ posts: posts.map((post) => toWire(post, viewer)) });
});

app.post('/api/posts', requireViewer, async (context) => {
  const viewer = viewerOf(context);
  const post = await createPost(authorFrom(viewer), readDraft(await context.req.json()));
  return context.json({ post: toWire(post, viewer) }, 201);
});

app.patch('/api/posts/:id', requireViewer, async (context) => {
  const viewer = viewerOf(context);
  // Ownership is part of the query: another user's id simply never matches.
  const post = await updatePost(postId(context), viewer.id, readDraft(await context.req.json()));
  if (!post) throw new HTTPException(404, { message: 'No such post of yours.' });
  return context.json({ post: toWire(post, viewer) });
});

app.delete('/api/posts/:id', requireViewer, async (context) => {
  const viewer = viewerOf(context);
  const deleted = await deletePost(postId(context), viewer.id);
  if (!deleted) throw new HTTPException(404, { message: 'No such post of yours.' });
  return context.body(null, 204);
});

app.post('/api/posts/:id/like', requireViewer, async (context) => {
  const viewer = viewerOf(context);
  const post = await toggleLike(postId(context), viewer.id);
  if (!post) throw new HTTPException(404, { message: 'No such post.' });
  return context.json({ post: toWire(post, viewer) });
});

app.get('/api/posts/:id', optionalViewer, async (context) => {
  const viewer = context.get('viewer');
  const post = await findPost(postId(context));
  // Unpublished drafts exist only for their author.
  if (!post || (!post.published && post.authorId !== viewer?.id)) {
    throw new HTTPException(404, { message: 'No such post.' });
  }
  return context.json({ post: toWire(post, viewer) });
});

app.onError((error, context) => {
  if (error instanceof HTTPException) {
    return context.json({ error: error.message }, error.status);
  }
  console.error(error);
  return context.json({ error: 'Something went wrong.' }, 500);
});

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`  Owl Blog API listening on http://localhost:${info.port}`);
});
