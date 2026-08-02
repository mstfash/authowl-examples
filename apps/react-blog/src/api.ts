/**
 * The client half of the integration.
 *
 * Every request carries `Authorization: Bearer <AuthOwl JWT>`. The token comes
 * from `getToken()` — AuthOwl mints a short-lived, memory-only JWT for backends
 * and caches it until it is near expiry, so calling this per request is cheap
 * and the durable session cookie never leaves the browser.
 */

export type WirePost = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  published: boolean;
  authorName: string;
  likes: number;
  likedByMe: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = {
  title: string;
  body: string;
  tags: string[];
  published: boolean;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type GetToken = () => Promise<string | null>;

export function createApi(getToken: GetToken) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken().catch(() => null);

    const response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (response.status === 204) return undefined as T;

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new ApiError(payload.error ?? `Request failed (${response.status})`, response.status);
    }
    return payload as T;
  }

  return {
    feed: () => request<{ posts: WirePost[] }>('/api/posts').then((r) => r.posts),
    mine: () => request<{ posts: WirePost[] }>('/api/posts/mine').then((r) => r.posts),
    me: () => request<{ userId: string; claims: Record<string, unknown> }>('/api/me'),
    create: (input: PostInput) =>
      request<{ post: WirePost }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then((r) => r.post),
    update: (id: string, input: PostInput) =>
      request<{ post: WirePost }>(`/api/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }).then((r) => r.post),
    remove: (id: string) => request<void>(`/api/posts/${id}`, { method: 'DELETE' }),
    like: (id: string) =>
      request<{ post: WirePost }>(`/api/posts/${id}/like`, { method: 'POST' }).then((r) => r.post),
  };
}

export type Api = ReturnType<typeof createApi>;
