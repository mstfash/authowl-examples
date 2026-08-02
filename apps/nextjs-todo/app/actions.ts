'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/session';
import {
  addTodo,
  clearCompleted,
  deleteTodo,
  normalizeTitle,
  renameTodo,
  setTodoDone,
} from '@/lib/todos';

/**
 * Server actions are public HTTP endpoints. Every one of them re-derives the
 * user from `auth()` — the client never gets to say who it is, so one signed-in
 * user can't touch another's rows even by replaying a request with a different id.
 */

export async function createTodoAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const title = normalizeTitle(formData.get('title'));
  if (!title) return;
  await addTodo(userId, title);
  revalidatePath('/');
}

export async function toggleTodoAction(id: string, done: boolean): Promise<void> {
  const userId = await requireUserId();
  await setTodoDone(userId, id, done);
  revalidatePath('/');
}

export async function renameTodoAction(id: string, rawTitle: string): Promise<void> {
  const userId = await requireUserId();
  const title = normalizeTitle(rawTitle);
  if (!title) return;
  await renameTodo(userId, id, title);
  revalidatePath('/');
}

export async function deleteTodoAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await deleteTodo(userId, id);
  revalidatePath('/');
}

export async function clearCompletedAction(): Promise<void> {
  const userId = await requireUserId();
  await clearCompleted(userId);
  revalidatePath('/');
}
