import { useEffect, useRef, useState } from 'react';

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

type Filter = 'all' | 'active' | 'done';

const SUGGESTIONS = [
  'Create an AuthOwl project',
  'Enable passkeys',
  'Ship the thing',
  'Water the plants',
];

function storageKey(userId: string): string {
  return `authowl-example:todos:${userId}`;
}

function readTodos(userId: string): Todo[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Todo => {
      if (!item || typeof item !== 'object') return false;
      const todo = item as Partial<Todo>;
      return typeof todo.id === 'string'
        && typeof todo.title === 'string'
        && typeof todo.done === 'boolean'
        && typeof todo.createdAt === 'string';
    });
  } catch {
    return [];
  }
}

export function TodoApp({ userId, name }: { userId: string; name: string }) {
  const [todos, setTodos] = useState<Todo[]>(() => readTodos(userId));
  const [filter, setFilter] = useState<Filter>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(todos));
    } catch {
      // Storage can be unavailable in private browsing. The in-memory list still works.
    }
  }, [todos, userId]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey(userId)) setTodos(readTodos(userId));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [userId]);

  const completed = todos.filter((todo) => todo.done).length;
  const remaining = todos.length - completed;
  const percent = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100);
  const visible = todos.filter((todo) => (
    filter === 'all' ? true : filter === 'active' ? !todo.done : todo.done
  ));
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  function update(apply: (current: Todo[]) => Todo[]) {
    setTodos((current) => apply(current));
  }

  function addTodo(rawTitle: string) {
    const title = rawTitle.replace(/\s+/g, ' ').trim().slice(0, 180);
    if (!title) return;
    update((current) => [{ id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString() }, ...current]);
  }

  return (
    <>
      <section className="hero">
        <div>
          <h1>Good to see you, <em>{name}</em></h1>
          <p>{today} · {remaining === 0 ? 'nothing left to do' : `${remaining} left to do`}</p>
        </div>
        <ProgressRing percent={percent} />
      </section>

      <form
        ref={formRef}
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          addTodo(String(data.get('title') ?? ''));
          formRef.current?.reset();
        }}
      >
        <input ref={inputRef} name="title" placeholder="What needs doing?" autoComplete="off" maxLength={180} aria-label="New todo" />
        <kbd>⌘K</kbd>
        <button type="submit" className="btn btn--primary">Add</button>
      </form>

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter todos">
          {([
            ['all', 'All', todos.length],
            ['active', 'Active', remaining],
            ['done', 'Done', completed],
          ] as const).map(([value, label, count]) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}<span>{count}</span>
            </button>
          ))}
        </div>
        {completed > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => update((current) => current.filter((todo) => !todo.done))}>
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
                onToggle={() => update((current) => current.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))}
                onRename={(title) => update((current) => current.map((item) => item.id === todo.id ? { ...item, title } : item))}
                onDelete={() => update((current) => current.filter((item) => item.id !== todo.id))}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function TodoRow({ todo, onToggle, onRename, onDelete }: {
  todo: Todo;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="row" data-done={todo.done}>
      <button type="button" role="checkbox" aria-checked={todo.done} aria-label={todo.done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`} className="check" onClick={onToggle}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.4 12 13 4.5" /></svg>
      </button>
      {editing ? (
        <input
          className="row__edit"
          defaultValue={todo.title}
          autoFocus
          maxLength={180}
          aria-label="Edit todo"
          onBlur={(event) => {
            const title = event.currentTarget.value.replace(/\s+/g, ' ').trim().slice(0, 180);
            if (title) onRename(title);
            setEditing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <span className="row__title" onDoubleClick={() => setEditing(true)} title="Double-click to edit">{todo.title}</span>
      )}
      <button type="button" className="icon-btn row__delete" onClick={onDelete} aria-label={`Delete "${todo.title}"`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </li>
  );
}

function EmptyState({ filter, hasTodos, onPick }: { filter: Filter; hasTodos: boolean; onPick: (title: string) => void }) {
  if (hasTodos) {
    return (
      <div className="empty">
        <h2>{filter === 'done' ? 'Nothing finished yet' : 'All clear'}</h2>
        <p>{filter === 'done' ? 'Complete something and it will show up here.' : 'Every todo is done. The owl approves.'}</p>
      </div>
    );
  }
  return (
    <div className="empty">
      <span className="empty__owl" aria-hidden="true">🦉</span>
      <h2>Your list is empty</h2>
      <p>Add the first thing above, or start from one of these.</p>
      <div className="chips">
        {SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" className="chip" onClick={() => onPick(suggestion)}>{suggestion}</button>)}
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
        <defs><linearGradient id="owlRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFDD97" /><stop offset=".55" stopColor="#F5B84C" /><stop offset="1" stopColor="#C9852A" /></linearGradient></defs>
        <circle className="ring__track" cx="31" cy="31" r={radius} fill="none" strokeWidth="5" />
        <circle className="ring__value" cx="31" cy="31" r={radius} fill="none" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} />
      </svg>
      <span className="ring__label">{percent}%</span>
    </div>
  );
}
