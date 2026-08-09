import type { WirePost } from '@/lib/post-types';
import { excerpt, readingTime } from './RichText';
import { HeartIcon } from './icons';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function PostCard({
  post,
  onOpen,
  onLike,
}: {
  post: WirePost;
  onOpen: () => void;
  onLike: () => void;
}) {
  return (
    <article className="post-card">
      <button type="button" className="post-card__hit" onClick={onOpen}>
        <h2>{post.title}</h2>
        <p className="post-card__excerpt">{excerpt(post.body)}</p>
      </button>

      <div className="post-card__meta">
        <span className="byline">
          <span className="avatar" aria-hidden="true">
            {post.authorName.slice(0, 1).toUpperCase()}
          </span>
          {post.authorName}
        </span>
        <span className="dot" aria-hidden="true">
          ·
        </span>
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        <span className="dot" aria-hidden="true">
          ·
        </span>
        <span>{readingTime(post.body)} min read</span>

        {!post.published && <span className="badge">Draft</span>}

        <button
          type="button"
          className="like"
          data-liked={post.likedByMe}
          onClick={onLike}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? 'Remove your like' : 'Like this post'}
        >
          <HeartIcon filled={post.likedByMe} />
          {post.likes > 0 && <span>{post.likes}</span>}
        </button>
      </div>

      {post.tags.length > 0 && (
        <ul className="tags">
          {post.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
