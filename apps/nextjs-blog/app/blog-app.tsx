'use client';

import { useState, useTransition } from 'react';
import { UserButton, useUser } from '@authowl/react';
import type { PostInput, WirePost } from '@/lib/post-types';
import {
  createPostAction,
  deletePostAction,
  toggleLikeAction,
  updatePostAction,
} from './actions';
import { useTheme } from './providers';
import { Editor } from './components/Editor';
import { PostCard } from './components/PostCard';
import { RichText, readingTime } from './components/RichText';
import { BackIcon, MoonIcon, OwlMark, PencilIcon, PlusIcon, SunIcon, TrashIcon } from './components/icons';

type View =
  | { name: 'feed' }
  | { name: 'mine' }
  | { name: 'post'; id: string }
  | { name: 'editor'; post: WirePost | null };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function BlogApp({ initialPosts, initialMine }: { initialPosts: WirePost[]; initialMine: WirePost[] }) {
  const { isLoaded, isSignedIn } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<View>({ name: 'feed' });
  const [posts, setPosts] = useState(initialPosts);
  const [mine, setMine] = useState(initialMine);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function replaceEverywhere(updated: WirePost) {
    const replace = (items: WirePost[]) => items.map((post) => post.id === updated.id ? updated : post);
    setPosts(replace);
    setMine(replace);
  }

  function like(post: WirePost) {
    if (!isSignedIn) {
      window.location.assign('/sign-in');
      return;
    }
    startTransition(async () => {
      try {
        replaceEverywhere(await toggleLikeAction(post.id));
      } catch (thrown) {
        setError(thrown instanceof Error ? thrown.message : 'Could not update that like.');
      }
    });
  }

  function save(input: PostInput) {
    const editing = view.name === 'editor' ? view.post : null;
    setBusy(true);
    setError(null);
    startTransition(async () => {
      try {
        const saved = editing
          ? await updatePostAction(editing.id, input)
          : await createPostAction(input);
        setMine((items) => [saved, ...items.filter((post) => post.id !== saved.id)]);
        setPosts((items) => saved.published
          ? [saved, ...items.filter((post) => post.id !== saved.id)]
          : items.filter((post) => post.id !== saved.id));
        setView(saved.published ? { name: 'post', id: saved.id } : { name: 'mine' });
      } catch (thrown) {
        setError(thrown instanceof Error ? thrown.message : 'Could not save that post.');
      } finally {
        setBusy(false);
      }
    });
  }

  function remove(post: WirePost) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deletePostAction(post.id);
        setPosts((items) => items.filter((item) => item.id !== post.id));
        setMine((items) => items.filter((item) => item.id !== post.id));
        setView({ name: 'feed' });
      } catch (thrown) {
        setError(thrown instanceof Error ? thrown.message : 'Could not delete that post.');
      }
    });
  }

  const openPost = posts.find((post) => view.name === 'post' && post.id === view.id)
    ?? mine.find((post) => view.name === 'post' && post.id === view.id)
    ?? null;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <button type="button" className="brand" onClick={() => setView({ name: 'feed' })}>
            <OwlMark size={30} idPrefix="nav" />
            Owl Blog
            <span className="brand__sub">/ Next.js</span>
          </button>

          <nav className="nav" aria-label="Blog">
            <button type="button" aria-current={view.name === 'feed' ? 'page' : undefined} onClick={() => setView({ name: 'feed' })}>Feed</button>
            {isSignedIn && (
              <button type="button" aria-current={view.name === 'mine' ? 'page' : undefined} onClick={() => setView({ name: 'mine' })}>Your posts</button>
            )}
          </nav>

          <div className="topbar__actions">
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {isSignedIn ? (
              <>
                <button type="button" className="btn btn--primary" onClick={() => setView({ name: 'editor', post: null })}><PlusIcon />Write</button>
                <UserButton />
              </>
            ) : (
              <>
                <a className="btn" href="/sign-in">Sign in</a>
                <a className="btn btn--primary" href="/sign-up">Create account</a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {error && view.name !== 'editor' && (
            <p className="banner" role="alert">{error}<button type="button" onClick={() => setError(null)} aria-label="Dismiss">×</button></p>
          )}

          {view.name === 'feed' && (
            <>
              <section className="page-head">
                <h1>Notes from the <em>night shift</em></h1>
                <p>
                  Anyone can read this server-rendered feed. Writing, editing, deleting, and liking
                  re-check the AuthOwl session inside a Next.js server action.
                </p>
              </section>
              {posts.length === 0 ? (
                <Empty title="No posts yet" hint={isLoaded && isSignedIn ? 'Press Write to publish the first one.' : 'Sign in to publish the first one.'} />
              ) : (
                <div className="post-list">{posts.map((post) => <PostCard key={post.id} post={post} onOpen={() => setView({ name: 'post', id: post.id })} onLike={() => like(post)} />)}</div>
              )}
            </>
          )}

          {view.name === 'mine' && (
            <>
              <section className="page-head">
                <h1>Your <em>posts</em></h1>
                <p>Drafts included. The server derives this list from <code>auth()</code>, never a user id supplied by the browser.</p>
              </section>
              {mine.length === 0 ? <Empty title="Nothing here yet" hint="Press Write to start your first post." /> : (
                <div className="post-list">{mine.map((post) => <PostCard key={post.id} post={post} onOpen={() => setView({ name: 'post', id: post.id })} onLike={() => like(post)} />)}</div>
              )}
            </>
          )}

          {view.name === 'post' && openPost && (
            <article className="reader">
              <button type="button" className="btn btn--ghost" onClick={() => setView({ name: 'feed' })}><BackIcon />Back</button>
              <h1>{openPost.title}</h1>
              <p className="reader__meta">{openPost.authorName} · {formatDate(openPost.createdAt)} · {readingTime(openPost.body)} min read {!openPost.published && <span className="badge">Draft</span>}</p>
              {openPost.tags.length > 0 && <ul className="tags">{openPost.tags.map((tag) => <li key={tag}>#{tag}</li>)}</ul>}
              <div className="reader__body"><RichText>{openPost.body}</RichText></div>
              {openPost.isMine && (
                <div className="reader__owner">
                  <button type="button" className="btn" onClick={() => setView({ name: 'editor', post: openPost })}><PencilIcon />Edit</button>
                  <button type="button" className="btn btn--danger" onClick={() => remove(openPost)}><TrashIcon />Delete</button>
                </div>
              )}
            </article>
          )}

          {view.name === 'post' && !openPost && <Empty title="Post not found" hint="It may have been deleted or returned to drafts." />}

          {view.name === 'editor' && (
            <>
              <section className="page-head"><h1>{view.post ? 'Edit post' : 'New post'}</h1></section>
              <Editor post={view.post} busy={busy} error={error} onSave={save} onCancel={() => setView(view.post ? { name: 'post', id: view.post.id } : { name: 'feed' })} />
            </>
          )}
        </div>
      </main>

      <footer className="footnote">Public reads from a Server Component. Authenticated writes through server actions guarded by <code>auth()</code>.</footer>
    </div>
  );
}

function Empty({ title, hint }: { title: string; hint: string }) {
  return <div className="empty"><OwlMark size={44} idPrefix="empty" /><h2>{title}</h2><p>{hint}</p></div>;
}
