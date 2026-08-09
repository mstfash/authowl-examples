import { useState, type FormEvent } from 'react';
import type { PostInput, WirePost } from '@/lib/post-types';

const PLACEHOLDER = `Write in plain text.

**Bold**, *italic*, and \`code\` work. Leave a blank line between paragraphs.`;

export function Editor({
  post,
  busy,
  error,
  onSave,
  onCancel,
}: {
  post: WirePost | null;
  busy: boolean;
  error: string | null;
  onSave: (input: PostInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');
  const [published, setPublished] = useState(post?.published ?? true);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({
      title: title.trim(),
      body: body.trim(),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      published,
    });
  }

  const canSave = title.trim().length > 0 && body.trim().length > 0 && !busy;

  return (
    <form className="editor" onSubmit={submit}>
      <input
        className="editor__title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        maxLength={120}
        aria-label="Post title"
        autoFocus
      />

      <textarea
        className="editor__body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={PLACEHOLDER}
        rows={16}
        maxLength={20000}
        aria-label="Post body"
      />

      <input
        className="editor__tags"
        value={tags}
        onChange={(event) => setTags(event.target.value)}
        placeholder="Tags, comma separated (up to 5)"
        aria-label="Tags"
      />

      {error && <p className="form-error">{error}</p>}

      <div className="editor__actions">
        <label className="switch">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          <span />
          Publish to the feed
        </label>

        <div className="editor__buttons">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={!canSave}>
            {busy ? 'Saving…' : post ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </div>
    </form>
  );
}
