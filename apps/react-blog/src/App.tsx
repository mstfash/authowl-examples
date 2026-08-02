import { useCallback, useEffect, useMemo, useState } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton, useAuth, useUser } from '@authowl/react';
import { ApiError, createApi, type PostInput, type WirePost } from './api';
import { useThemeToggle } from './theme';
import { Editor } from './components/Editor';
import { PostCard } from './components/PostCard';
import { RichText, readingTime } from './components/RichText';
import { BackIcon, MoonIcon, OwlMark, PencilIcon, PlusIcon, SunIcon, TrashIcon } from './components/icons';

type View =
  | { name: 'feed' }
  | { name: 'mine' }
  | { name: 'post'; id: string }
  | { name: 'editor'; post: WirePost | null }
  | { name: 'auth' };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function App() {
  // `getToken()` mints the short-lived JWT the API verifies. That is the entire
  // client-side auth surface of this app.
  const { getToken, isSignedIn } = useAuth();
  const { isLoaded } = useUser();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const { theme, toggle } = useThemeToggle();
  const [view, setView] = useState<View>({ name: 'feed' });
  const [posts, setPosts] = useState<WirePost[] | null>(null);
  const [drafts, setDrafts] = useState<WirePost[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = (thrown: unknown) =>
    thrown instanceof ApiError ? thrown.message : 'Something went wrong.';

  const loadFeed = useCallback(() => {
    api
      .feed()
      .then(setPosts)
      .catch((thrown) => setError(message(thrown)));
  }, [api]);

  // Reload the feed when the session changes: signing in flips `likedByMe`
  // and `isMine` on every card.
  useEffect(loadFeed, [loadFeed, isSignedIn]);

  useEffect(() => {
    if (view.name !== 'mine') return;
    setDrafts(null);
    api
      .mine()
      .then(setDrafts)
      .catch((thrown) => setError(message(thrown)));
  }, [api, view.name]);

  function replaceEverywhere(updated: WirePost) {
    const swap = (list: WirePost[] | null) =>
      list?.map((post) => (post.id === updated.id ? updated : post)) ?? null;
    setPosts(swap);
    setDrafts(swap);
  }

  async function like(post: WirePost) {
    if (!isSignedIn) return setView({ name: 'auth' });
    try {
      replaceEverywhere(await api.like(post.id));
    } catch (thrown) {
      setError(message(thrown));
    }
  }

  async function save(input: PostInput) {
    const editing = view.name === 'editor' ? view.post : null;
    setBusy(true);
    setError(null);
    try {
      const saved = editing ? await api.update(editing.id, input) : await api.create(input);
      // Drop it into the list immediately so the reader has something to show
      // before the refetch lands.
      if (saved.published) {
        setPosts((list) => [saved, ...(list ?? []).filter((post) => post.id !== saved.id)]);
      }
      setDrafts(null);
      loadFeed();
      setView(saved.published ? { name: 'post', id: saved.id } : { name: 'mine' });
    } catch (thrown) {
      setError(message(thrown));
    } finally {
      setBusy(false);
    }
  }

  async function remove(post: WirePost) {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    try {
      await api.remove(post.id);
      setPosts((list) => list?.filter((item) => item.id !== post.id) ?? null);
      setDrafts((list) => list?.filter((item) => item.id !== post.id) ?? null);
      setView({ name: 'feed' });
    } catch (thrown) {
      setError(message(thrown));
    }
  }

  const openPost = posts?.find((post) => view.name === 'post' && post.id === view.id)
    ?? drafts?.find((post) => view.name === 'post' && post.id === view.id)
    ?? null;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <button type="button" className="brand" onClick={() => setView({ name: 'feed' })}>
            <OwlMark size={30} idPrefix="nav" />
            Owl Blog
            <span className="brand__sub">/ React</span>
          </button>

          <nav className="nav">
            <button
              type="button"
              aria-current={view.name === 'feed' ? 'page' : undefined}
              onClick={() => setView({ name: 'feed' })}
            >
              Feed
            </button>
            <SignedIn>
              <button
                type="button"
                aria-current={view.name === 'mine' ? 'page' : undefined}
                onClick={() => setView({ name: 'mine' })}
              >
                Your posts
              </button>
            </SignedIn>
          </nav>

          <div className="topbar__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Two components cover the whole signed-in / signed-out split. */}
            <SignedOut>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setView({ name: 'auth' })}
              >
                Sign in
              </button>
            </SignedOut>
            <SignedIn>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setView({ name: 'editor', post: null })}
              >
                <PlusIcon />
                Write
              </button>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {error && view.name !== 'editor' && (
            <p className="banner" role="alert">
              {error}
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
                ×
              </button>
            </p>
          )}

          {view.name === 'auth' && (
            <div className="auth-panel">
              <SignedOut>
                <SignIn onSignedIn={() => setView({ name: 'feed' })} />
              </SignedOut>
              <SignedIn>
                <p className="muted">You&rsquo;re signed in.</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setView({ name: 'feed' })}
                >
                  Back to the feed
                </button>
              </SignedIn>
            </div>
          )}

          {view.name === 'feed' && (
            <>
              <section className="page-head">
                <h1>
                  Notes from the <em>night shift</em>
                </h1>
                <p>
                  Anyone can read this feed — no token required. Writing, editing, and liking need
                  a valid AuthOwl JWT, checked by the API in <code>api/auth.ts</code>.
                </p>
              </section>

              {posts === null ? (
                <Skeleton />
              ) : posts.length === 0 ? (
                <Empty
                  title="No posts yet"
                  hint={isLoaded && isSignedIn ? 'Press Write to publish the first one.' : 'Sign in to publish the first one.'}
                />
              ) : (
                <div className="post-list">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onOpen={() => setView({ name: 'post', id: post.id })}
                      onLike={() => like(post)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {view.name === 'mine' && (
            <>
              <section className="page-head">
                <h1>
                  Your <em>posts</em>
                </h1>
                <p>
                  Drafts included. The API scopes this list to the <code>sub</code> claim of your
                  verified token, so it can only ever return your own rows.
                </p>
              </section>

              {drafts === null ? (
                <Skeleton />
              ) : drafts.length === 0 ? (
                <Empty title="Nothing here yet" hint="Press Write to start your first post." />
              ) : (
                <div className="post-list">
                  {drafts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onOpen={() => setView({ name: 'post', id: post.id })}
                      onLike={() => like(post)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {view.name === 'post' && openPost && (
            <article className="reader">
              <button type="button" className="btn btn--ghost" onClick={() => setView({ name: 'feed' })}>
                <BackIcon />
                Back
              </button>

              <h1>{openPost.title}</h1>
              <p className="reader__meta">
                {openPost.authorName} · {formatDate(openPost.createdAt)} ·{' '}
                {readingTime(openPost.body)} min read
                {!openPost.published && <span className="badge">Draft</span>}
              </p>

              {openPost.tags.length > 0 && (
                <ul className="tags">
                  {openPost.tags.map((tag) => (
                    <li key={tag}>#{tag}</li>
                  ))}
                </ul>
              )}

              <div className="reader__body">
                <RichText>{openPost.body}</RichText>
              </div>

              {openPost.isMine && (
                <div className="reader__owner">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setView({ name: 'editor', post: openPost })}
                  >
                    <PencilIcon />
                    Edit
                  </button>
                  <button type="button" className="btn btn--danger" onClick={() => remove(openPost)}>
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              )}
            </article>
          )}

          {view.name === 'post' && !openPost && <Skeleton />}

          {view.name === 'editor' && (
            <>
              <section className="page-head">
                <h1>{view.post ? 'Edit post' : 'New post'}</h1>
              </section>
              <Editor
                post={view.post}
                busy={busy}
                error={error}
                onSave={save}
                onCancel={() =>
                  setView(view.post ? { name: 'post', id: view.post.id } : { name: 'feed' })
                }
              />
            </>
          )}
        </div>
      </main>

      <footer className="footnote">
        Public reads, authenticated writes — verified with{' '}
        <code>verifyToken()</code> from <code>@authowl/core/server</code>.
      </footer>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="post-list" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="skeleton" />
      ))}
    </div>
  );
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="empty">
      <OwlMark size={44} idPrefix="empty" />
      <h2>{title}</h2>
      <p>{hint}</p>
    </div>
  );
}
