import { auth } from '@authowl/next/server';
import { BlogApp } from './blog-app';
import { isConfigured } from '@/lib/session';
import { listByAuthor, listPublished, toWire } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  if (!isConfigured) return null;

  const session = await auth();
  const viewerId = session?.user.id ?? null;
  const [feed, mine] = await Promise.all([
    listPublished(),
    viewerId ? listByAuthor(viewerId) : Promise.resolve([]),
  ]);

  return (
    <BlogApp
      initialPosts={feed.map((post) => toWire(post, viewerId))}
      initialMine={mine.map((post) => toWire(post, viewerId))}
    />
  );
}
