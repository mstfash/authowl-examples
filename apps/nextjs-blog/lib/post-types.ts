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
