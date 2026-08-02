import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * A deliberately boring store: one JSON file under `.data/` (gitignored).
 *
 * It exists so the example has zero infrastructure to set up — swap it for
 * Postgres, Drizzle, Prisma, or whatever you already run. The only thing that
 * matters for the AuthOwl demo is that every read and write is keyed by the
 * `userId` that came from a verified session, never from client input.
 */

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

type Database = Record<string, Todo[]>;

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

/**
 * Serialize every mutation through one promise chain. A JSON file has no
 * transactions, so two concurrent read-modify-writes would lose an update.
 */
let tail: Promise<unknown> = Promise.resolve();
function exclusive<T>(job: () => Promise<T>): Promise<T> {
  const run = tail.then(job, job);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readDatabase(): Promise<Database> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Database;
  } catch {
    // Missing or unreadable file: start empty rather than crash the demo.
    return {};
  }
}

async function writeDatabase(database: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
}

async function mutate(userId: string, apply: (todos: Todo[]) => Todo[]): Promise<void> {
  await exclusive(async () => {
    const database = await readDatabase();
    database[userId] = apply(database[userId] ?? []);
    await writeDatabase(database);
  });
}

const MAX_TITLE_LENGTH = 180;

/** Trim, collapse whitespace, and cap length. Returns null when nothing is left. */
export function normalizeTitle(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const title = input.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE_LENGTH);
  return title.length > 0 ? title : null;
}

export async function listTodos(userId: string): Promise<Todo[]> {
  const database = await readDatabase();
  return database[userId] ?? [];
}

export async function addTodo(userId: string, title: string): Promise<void> {
  const todo: Todo = {
    id: randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  await mutate(userId, (todos) => [todo, ...todos]);
}

export async function setTodoDone(userId: string, id: string, done: boolean): Promise<void> {
  await mutate(userId, (todos) => todos.map((todo) => (todo.id === id ? { ...todo, done } : todo)));
}

export async function renameTodo(userId: string, id: string, title: string): Promise<void> {
  await mutate(userId, (todos) => todos.map((todo) => (todo.id === id ? { ...todo, title } : todo)));
}

export async function deleteTodo(userId: string, id: string): Promise<void> {
  await mutate(userId, (todos) => todos.filter((todo) => todo.id !== id));
}

export async function clearCompleted(userId: string): Promise<void> {
  await mutate(userId, (todos) => todos.filter((todo) => !todo.done));
}
