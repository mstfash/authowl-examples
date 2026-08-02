'use client';

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import type { Todo } from '@/lib/todos';
import {
  clearCompletedAction,
  createTodoAction,
  deleteTodoAction,
  renameTodoAction,
  toggleTodoAction,
} from './actions';

type Filter = 'all' | 'active' | 'done';

type Patch =
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string; done: boolean }
  | { type: 'rename'; id: string; title: string }
  | { type: 'delete'; id: string }
  | { type: 'clear-completed' };

/** Applied instantly in the browser, then replaced by the server's truth. */
function reduce(todos: Todo[], patch: Patch): Todo[] {
  switch (patch.type) {
    case 'add':
      return [patch.todo, ...todos];
    case 'toggle':
      return todos.map((t) => (t.id === patch.id ? { ...t, done: patch.done } : t));
    case 'rename':
      return todos.map((t) => (t.id === patch.id ? { ...t, title: patch.title } : t));
    case 'delete':
      return todos.filter((t) => t.id !== patch.id);
    case 'clear-completed':
      return todos.filter((t) => !t.done);
  }
}

const SUGGESTIONS = [
  'Create an AuthOwl project',
  'Enable passkeys',
  'Ship the thing',
  'Water the plants',
];

export function TodoApp({
  initialTodos,
  greeting,
  name,
  today,
}: {
  initialTodos: Todo[];
  greeting: string;
  name: string;
  today: string;
}) {
  const [todos, applyOptimistic] = useOptimistic(initialTodos, reduce);
  const [filter, setFilter] = useState<Filter>('all');
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const completed = todos.filter((t) => t.done).length;
  const remaining = todos.length - completed;
  const percent = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100);
  const visible = todos.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done,
  );

  // ⌘K / Ctrl+K jumps to the composer from anywhere.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function addTodo(title: string) {
    const clean = title.replace(/\s+/g, ' ').trim();
    if (!clean) return;
    startTransition(async () => {
      applyOptimistic({
        type: 'add',
        todo: {
          id: `pending-${crypto.randomUUID()}`,
          title: clean,
          done: false,
          createdAt: new Date().toISOString(),
        },
      });
      const formData = new FormData();
      formData.set('title', clean);
      await createTodoAction(formData);
    });
  }

  function toggle(todo: Todo) {
    startTransition(async () => {
      applyOptimistic({ type: 'toggle', id: todo.id, done: !todo.done });
      await toggleTodoAction(todo.id, !todo.done);
    });
  }

  function rename(todo: Todo, title: string) {
    const clean = title.replace(/\s+/g, ' ').trim();
    if (!clean || clean === todo.title) return;
    startTransition(async () => {
      applyOptimistic({ type: 'rename', id: todo.id, title: clean });
      await renameTodoAction(todo.id, clean);
    });
  }

  function remove(todo: Todo) {
    startTransition(async () => {
      applyOptimistic({ type: 'delete', id: todo.id });
      await deleteTodoAction(todo.id);
    });
  }

  function clearDone() {
    startTransition(async () => {
      applyOptimistic({ type: 'clear-completed' });
      await clearCompletedAction();
    });
  }

  return (
    <>
      <section className="hero">
        <div>
          <h1>
            {greeting}, <em>{name}</em>
          </h1>
          <p>
            {today} · {remaining === 0 ? 'nothing left to do' : `${remaining} left to do`}
          </p>
        </div>
        <ProgressRing percent={percent} />
      </section>

      <form
        ref={formRef}
        className="composer"
        action={(formData: FormData) => {
          formRef.current?.reset();
          addTodo(String(formData.get('title') ?? ''));
        }}
      >
        <input
          ref={inputRef}
          name="title"
          placeholder="What needs doing?"
          autoComplete="off"
          maxLength={180}
          aria-label="New todo"
        />
        <kbd>⌘K</kbd>
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </form>

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter todos">
          {(
            [
              ['all', 'All', todos.length],
              ['active', 'Active', remaining],
              ['done', 'Done', completed],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>

        {completed > 0 && (
          <button type="button" className="btn btn--ghost" onClick={clearDone}>
            Clear completed
          </button>
        )}
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <EmptyState filter={filter} hasTodos={todos.length > 0} onPick={addTodo} />
        ) : (
          <ul className="list">
            {visible.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={() => toggle(todo)}
                onRename={(title) => rename(todo, title)}
                onDelete={() => remove(todo)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function TodoRow({
  todo,
  onToggle,
  onRename,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const isPending = todo.id.startsWith('pending-');

  return (
    <li className="row" data-done={todo.done} data-pending={isPending}>
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        aria-label={todo.done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`}
        className="check"
        onClick={onToggle}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8.5 6.4 12 13 4.5" />
        </svg>
      </button>

      {editing ? (
        <input
          className="row__edit"
          defaultValue={todo.title}
          autoFocus
          maxLength={180}
          aria-label="Edit todo"
          onBlur={(event) => {
            onRename(event.currentTarget.value);
            setEditing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <span
          className="row__title"
          onDoubleClick={() => !isPending && setEditing(true)}
          title="Double-click to edit"
        >
          {todo.title}
        </span>
      )}

      <button
        type="button"
        className="icon-btn row__delete"
        onClick={onDelete}
        aria-label={`Delete "${todo.title}"`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </li>
  );
}

function EmptyState({
  filter,
  hasTodos,
  onPick,
}: {
  filter: Filter;
  hasTodos: boolean;
  onPick: (title: string) => void;
}) {
  if (hasTodos) {
    return (
      <div className="empty">
        <h2>{filter === 'done' ? 'Nothing finished yet' : 'All clear'}</h2>
        <p>
          {filter === 'done'
            ? 'Complete something and it will show up here.'
            : 'Every todo is done. The owl approves.'}
        </p>
      </div>
    );
  }

  return (
    <div className="empty">
      <svg className="empty__owl" width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyOwl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFDD97" />
            <stop offset=".55" stopColor="#F5B84C" />
            <stop offset="1" stopColor="#C9852A" />
          </linearGradient>
        </defs>
        <path
          d="M32 3c-5 0-9 2.5-11.5 6C17 7 12 7.5 9 11c2 .5 3.4 1.6 4.2 3C8.5 16.6 5 21.7 5 28c0 12.7 12 24 27 24s27-11.3 27-24c0-6.3-3.5-11.4-8.2-14 .8-1.4 2.2-2.5 4.2-3-3-3.5-8-4-11.5-2C41 5.5 37 3 32 3Z"
          fill="url(#emptyOwl)"
        />
        <circle cx="23" cy="28" r="10" fill="#0b0906" />
        <circle cx="41" cy="28" r="10" fill="#0b0906" />
        <circle cx="23" cy="28" r="4.6" fill="url(#emptyOwl)" />
        <circle cx="41" cy="28" r="4.6" fill="url(#emptyOwl)" />
        <path d="M32 34l3.2 5.4h-6.4Z" fill="#C9852A" />
      </svg>
      <h2>Your list is empty</h2>
      <p>Add the first thing above, or start from one of these.</p>
      <div className="chips">
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" className="chip" onClick={() => onPick(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="ring" title={`${percent}% complete`}>
      <svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
        <defs>
          <linearGradient id="owlRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFDD97" />
            <stop offset=".55" stopColor="#F5B84C" />
            <stop offset="1" stopColor="#C9852A" />
          </linearGradient>
        </defs>
        <circle className="ring__track" cx="31" cy="31" r={radius} fill="none" strokeWidth="5" />
        <circle
          className="ring__value"
          cx="31"
          cy="31"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <span className="ring__label">{percent}%</span>
    </div>
  );
}
