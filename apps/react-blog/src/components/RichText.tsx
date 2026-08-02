import { Fragment, type ReactNode } from 'react';

/**
 * A very small Markdown subset: paragraphs, `**bold**`, `*italic*`, `` `code` ``.
 *
 * It returns React elements rather than HTML, so user-authored posts can never
 * inject markup — no `dangerouslySetInnerHTML`, no sanitizer to keep current.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((chunk, index) => {
    const key = `${keyPrefix}-${index}`;
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      return <strong key={key}>{chunk.slice(2, -2)}</strong>;
    }
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      return <em key={key}>{chunk.slice(1, -1)}</em>;
    }
    if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
      return <code key={key}>{chunk.slice(1, -1)}</code>;
    }
    return <Fragment key={key}>{chunk}</Fragment>;
  });
}

export function RichText({ children }: { children: string }) {
  const paragraphs = children.split(/\n{2,}/).filter((block) => block.trim());

  return (
    <>
      {paragraphs.map((block, index) => (
        <p key={index}>{inline(block.trim(), `p${index}`)}</p>
      ))}
    </>
  );
}

/** First ~200 characters, used for feed cards. */
export function excerpt(body: string, max = 190): string {
  const flat = body.replace(/[*`]/g, '').replace(/\s+/g, ' ').trim();
  return flat.length <= max ? flat : `${flat.slice(0, max).trimEnd()}…`;
}

/** Rounded-up minutes at a leisurely 200 words per minute. */
export function readingTime(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}
