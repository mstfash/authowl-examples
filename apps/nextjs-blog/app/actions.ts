'use server';

import { revalidatePath } from 'next/cache';
import type { PostInput, WirePost } from '@/lib/post-types';
import {
  createPost,
  deletePost,
  toggleLike,
  toWire,
  updatePost,
  type PostDraft,
} from '@/lib/posts';
import { requireSession } from '@/lib/session';

function cleanInput(input: PostInput): PostDraft {
  const title = input.title.replace(/\s+/g, ' ').trim().slice(0, 120);
  const body = input.body.trim().slice(0, 20_000);
  if (!title || !body) throw new Error('A title and body are required.');
  const tags = [...new Set(input.tags.map((tag) => tag.trim().toLowerCase().slice(0, 24)).filter(Boolean))].slice(0, 5);
  return { title, body, tags, published: input.published !== false };
}

function author(session: Awaited<ReturnType<typeof requireSession>>) {
  const name = session.user.name?.trim();
  const email = session.user.email;
  return {
    id: session.user.id,
    name: name || (email?.includes('@') ? email.split('@')[0]! : 'Anonymous owl'),
  };
}

export async function createPostAction(input: PostInput): Promise<WirePost> {
  const session = await requireSession();
  const post = await createPost(author(session), cleanInput(input));
  revalidatePath('/');
  return toWire(post, session.user.id);
}

export async function updatePostAction(id: string, input: PostInput): Promise<WirePost> {
  const session = await requireSession();
  const post = await updatePost(id, session.user.id, cleanInput(input));
  if (!post) throw new Error('That post does not exist or is not yours.');
  revalidatePath('/');
  return toWire(post, session.user.id);
}

export async function deletePostAction(id: string): Promise<void> {
  const session = await requireSession();
  if (!await deletePost(id, session.user.id)) {
    throw new Error('That post does not exist or is not yours.');
  }
  revalidatePath('/');
}

export async function toggleLikeAction(id: string): Promise<WirePost> {
  const session = await requireSession();
  const post = await toggleLike(id, session.user.id);
  if (!post) throw new Error('That published post no longer exists.');
  revalidatePath('/');
  return toWire(post, session.user.id);
}
