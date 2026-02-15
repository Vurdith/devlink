/**
 * TypeScript types for API responses
 */

// Base API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// User types
export interface User {
  id: string;
  username: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
  _count?: {
    followers: number;
    following: number;
    posts: number;
  };
}

export interface Profile {
  id: string;
  userId: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  profileType: string;
  verified: boolean;
  bio: string | null;
  website: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isSlideshow: boolean;
  isScheduled: boolean;
  scheduledFor: Date | null;
  location: string | null;
  embedUrls: string[] | null;
  replyToId: string | null;
  user: User;
  media: PostMedia[];
  poll?: Poll;
  likes: PostLike[];
  reposts: PostRepost[];
  replies: Post[];
  views: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  score?: number;
}

/**
 * Post with additional metadata (likes, reposts, saves, views)
 */
export interface PostWithMetadata extends Post {
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  views: number;
}

export interface PostMedia {
  id: string;
  postId: string;
  mediaUrl: string;
  mediaType: string;
  order: number;
  createdAt: Date;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface PostRepost {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface PostView {
  id: string;
  postId: string;
  userId: string | null;
  viewedAt: Date;
}

// Poll types
export interface Poll {
  id: string;
  postId: string;
  question: string;
  expiresAt: Date | null;
  isMultiple: boolean;
  createdAt: Date;
  updatedAt: Date;
  options: PollOption[];
  totalVotes: number;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  order: number;
  createdAt: Date;
  votes: PollVote[];
  voteCount: number;
  userVoted?: boolean;
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

// Hashtag types
export interface Hashtag {
  id: string;
  name: string;
  createdAt: Date;
  postCount: number;
}

export interface PostHashtag {
  id: string;
  postId: string;
  hashtagId: string;
  createdAt: Date;
}

// Follow types
export interface Follower {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

// Review types
export interface Review {
  id: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  text: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewer: User;
  reviewed: User;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  skills: string | null;
  location: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
  user: User;
  _count?: {
    applications: number;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  job?: Job;
  applicant?: User;
}

export interface MessageThread {
  id: string;
  userAId: string;
  userBId: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userA: User;
  userB: User;
  messages?: Message[];
}

export interface Message {
  id: string;
  threadId: string;
  conversationId?: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  createdAt: Date;
}

export interface EscrowContract {
  id: string;
  clientId: string;
  developerId: string;
  jobId: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "FUNDED" | "SUBMITTED" | "RELEASED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  client: User;
  developer: User;
  milestone?: EscrowMilestone;
  job?: Job;
}

export interface EscrowMilestone {
  id: string;
  contractId: string;
  title: string;
  amount: number;
  status: "PENDING" | "SUBMITTED" | "RELEASED" | "CANCELLED";
  submittedAt: Date | null;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  type: "EMAIL" | "ID" | "PORTFOLIO";
  status: "PENDING" | "APPROVED" | "REJECTED";
  documentUrl: string | null;
  notes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessagingSettings {
  id: string;
  userId: string;
  allowFrom: "EVERYONE" | "FOLLOWERS" | "FOLLOWING" | "MUTUALS" | "NONE";
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageRequest {
  id: string;
  senderId: string;
  recipientId: string;
  conversationId?: string | null;
  lastMessage?: Pick<Message, "id" | "senderId" | "content" | "createdAt"> | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: Date;
  updatedAt: Date;
  sender: User;
  recipient: User;
}

// Report types
export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  type: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio types
export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  mediaUrls: string | null;
  links: string | null;
  category: string | null;
  tags: string | null;
  isPublic: boolean;
  skills?: Array<{
    skill: { id: string; name: string; category: string; icon?: string | null };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// API endpoint response types
export interface AuthResponse {
  user: User;
  message?: string;
}

export interface LoginResponse extends AuthResponse {
  session: {
    user: User;
    expires: string;
  };
}

export interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  message?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface UserResponse {
  user: User;
  posts?: Post[];
  followers?: User[];
  following?: User[];
}

export interface HashtagResponse {
  hashtag: Hashtag;
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SearchResponse {
  results: {
    users: User[];
    posts: Post[];
    hashtags: Hashtag[];
  };
  query: string;
  type: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Request types
export interface CreatePostRequest {
  content: string;
  mediaUrls?: string[];
  poll?: {
    question: string;
    options: string[];
    isMultiple: boolean;
    expiresAt?: string;
  };
  isScheduled?: boolean;
  scheduledFor?: string;
  location?: string;
  embedUrls?: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  website?: string;
  location?: string;
  profileType?: string;
}

export interface CreateReviewRequest {
  reviewedId: string;
  rating: number;
  text?: string;
}

export interface CreateReportRequest {
  reportedId: string;
  type: string;
  reason: string;
  description?: string;
}

// Utility types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequest {
  method: ApiMethod;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}








