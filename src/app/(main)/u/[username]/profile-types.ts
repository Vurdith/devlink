export type TabType =
  | "about"
  | "posts"
  | "reposts"
  | "liked"
  | "replies"
  | "saved"
  | "portfolio"
  | "reviews";

export interface TabPost {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    profile: {
      avatarUrl: string | null;
      bannerUrl: string | null;
      profileType: string;
      verified: boolean;
      bio: string | null;
      website: string | null;
      location: string | null;
    } | null;
    _count?: { followers: number; following: number };
  };
  media: Array<{ id: string; mediaUrl: string; mediaType: string; order: number }>;
  isSlideshow: boolean;
  isPinned: boolean;
  views: number;
  likes?: Array<{ id: string; userId: string }>;
  reposts?: Array<{ id: string; userId: string }>;
  savedBy?: Array<{ id: string; userId: string }>;
  replies?: Array<{ id: string; userId: string }>;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  poll?: {
    id: string;
    question: string;
    options: Array<{ id: string; text: string; votes: number; isSelected?: boolean }>;
    isMultiple: boolean;
    expiresAt: Date;
    totalVotes: number;
  };
  replyTo?: {
    id: string;
    content: string;
    media?: Array<{ id: string; mediaUrl?: string; mediaType?: string; order?: number }>;
    user: { username: string; name: string | null; image?: string | null };
  };
  _count?: { likes: number; reposts: number; replies: number };
}
