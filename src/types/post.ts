export interface FeedPostProfile {
  avatarUrl: string | null;
  bannerUrl: string | null;
  profileType: string;
  verified: boolean;
  bio: string | null;
  website: string | null;
  location: string | null;
}

export interface FeedPostUser {
  id: string;
  username: string;
  name: string | null;
  createdAt?: Date;
  profile: FeedPostProfile | null;
  _count?: {
    followers: number;
    following: number;
  };
}

export interface FeedPostMedia {
  id: string;
  mediaUrl: string;
  mediaType: string;
  order: number;
}

export interface FeedPollOption {
  id: string;
  text: string;
  votes: number;
  isSelected?: boolean;
}

export interface FeedPoll {
  id: string;
  question: string;
  options: FeedPollOption[];
  isMultiple: boolean;
  expiresAt: Date | null;
  totalVotes: number;
}

export interface FeedEngagement {
  id: string;
  userId: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  location?: string | null;
  embedUrls?: string | string[] | null;
  isScheduled?: boolean;
  scheduledFor?: Date | null;
  replyToId?: string | null;
  user: FeedPostUser;
  media: FeedPostMedia[];
  isSlideshow: boolean;
  isPinned: boolean;
  poll?: FeedPoll | null;
  likes?: FeedEngagement[];
  reposts?: FeedEngagement[];
  savedBy?: FeedEngagement[];
  replies?: Array<FeedEngagement | null>;
  views: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  userVote?: {
    optionIds: string[];
  };
  _count?: {
    likes: number;
    reposts: number;
    replies?: number;
    savedBy?: number;
  };
  replyTo?: {
    id: string;
    content?: string;
    user: {
      username: string;
    };
  } | null;
}
