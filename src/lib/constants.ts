/**
 * Centralized constants for the application
 * This prevents magic numbers scattered throughout the codebase
 */

// ============ Rate Limiting ============
export const RATE_LIMITS = {
  POST_CREATION: {
    limit: 10,
    window: 60_000, // 1 minute
  },
  POLL_VOTE: {
    limit: 5,
    window: 60_000, // 1 minute
  },
  REGISTRATION: {
    limit: 3,
    window: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// ============ Content Constraints ============
export const CONTENT_LIMITS = {
  POST_MAX_LENGTH: 2000,
  POST_MIN_LENGTH: 1,
  LOCATION_MAX_LENGTH: 120,
  REVIEW_TEXT_MAX_LENGTH: 1000,
  REVIEW_TEXT_MIN_LENGTH: 1,
  PORTFOLIO_TITLE_MAX_LENGTH: 200,
  PORTFOLIO_TITLE_MIN_LENGTH: 3,
  PORTFOLIO_DESCRIPTION_MAX_LENGTH: 5000,
  POLL_QUESTION_MAX_LENGTH: 500,
  POLL_QUESTION_MIN_LENGTH: 3,
  POLL_OPTION_MAX_LENGTH: 200,
  POLL_OPTION_MIN_LENGTH: 1,
  HASHTAG_MAX_LENGTH: 50,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_MIN_LENGTH: 8,
  URL_MAX_LENGTH: 2048,
  REPORT_DESCRIPTION_MAX_LENGTH: 5000,
  REPORT_DESCRIPTION_MIN_LENGTH: 10,
} as const;

// ============ Array/Collection Limits ============
export const COLLECTION_LIMITS = {
  MAX_MEDIA_FILES: 10,
  MAX_POLL_OPTIONS: 10,
  MIN_POLL_OPTIONS: 2,
  MAX_PORTFOLIO_TAGS: 10,
  MAX_PORTFOLIO_LINKS: 10,
  MAX_PORTFOLIO_MEDIA_URLS: 10,
  PORTFOLIO_TAG_MAX_LENGTH: 50,
  POSTS_PER_PAGE: 20,
  MAX_POSTS_PER_REQUEST: 50,
} as const;

// ============ Date/Time Constants ============
export const TIME_CONSTRAINTS = {
  REPORT_DUPLICATE_CHECK_HOURS: 24,
  MIN_FUTURE_SCHEDULE_MINUTES: 1,
  SESSION_STORAGE_KEY_PREFIX: 'viewed_',
  PROFILE_UPDATE_DEBOUNCE_MS: 100,
  PROFILE_UPDATE_RACE_CONDITION_WINDOW_MS: 2000,
  API_CALL_DEBOUNCE_MS: 150,
  SEARCH_DEBOUNCE_MS: 150,
  VIEW_TRACKING_DELAY_MS: 100,
} as const;

// ============ Algorithm Constants ============
export const ALGORITHM_CONSTANTS = {
  TEMPORAL_WEIGHTS: {
    fresh: 100,      // 0-2 hours
    recent: 60,      // 2-6 hours
    moderate: 30,    // 6-12 hours
    aging: 10,       // 12-24 hours
    legacy: 1,       // 24+ hours
  },
  ENGAGEMENT_WEIGHTS: {
    replies: 25.0,
    reposts: 15.0,
    likes: 5.0,
    views: 0.5,
  },
  USER_DISCOVERY_WEIGHTS: {
    newUser: 50,            // 0-30 days
    growingUser: 30,        // 30-180 days
    establishedUser: 10,    // 180+ days
    scorePerFollower: 0.1,
    verifiedMultiplier: 1.5,
  },
  NETWORK_WEIGHTS: {
    closeNetwork: 2.0,      // Mutual follows
    extendedNetwork: 1.5,   // One-way follows
    discoveryNetwork: 1.0,  // No connection
    diverseNetwork: 1.2,    // Different interests
  },
  CONTENT_WEIGHTS: {
    hasMedia: 15,
    hasPoll: 12,
    optimalLength: 8,
    originalContent: 20,
  },
  USER_ACCOUNT_AGE_THRESHOLDS: {
    newUserDays: 30,
    growingUserDays: 180,
  },
} as const;

// ============ UI Constants ============
export const UI_CONSTANTS = {
  ANIMATION_DURATION_MS: 200,
  MODAL_ANIMATION_DELAY_MS: 0.2,
  EXPLOSION_ANIMATION_TYPES: ['like', 'repost', 'save'],
} as const;

// ============ Profile Types ============
export const VALID_PROFILE_TYPES = ['Developer', 'Designer', 'Manager', 'Other'] as const;
export const VALID_PORTFOLIO_CATEGORIES = ['Web', 'Mobile', 'Game', 'AI', 'Other'] as const;
export const VALID_REPORT_TYPES = ['SCAM', 'SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'OTHER'] as const;

// ============ Cache Settings ============
export const CACHE_SETTINGS = {
  CACHE_CONTROL_HEADERS: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
} as const;

// ============ Algorithm Enhancement Constants ============
export const ALGORITHM_ENHANCEMENTS = {
  // Velocity decay configuration
  VELOCITY_DECAY: {
    DECAY_START_HOURS: 1,
    DECAY_HALF_HOURS: 12,
    MIN_MULTIPLIER: 0.1,
    MAX_MULTIPLIER: 1.0,
  },
  
  // Engagement rate thresholds
  ENGAGEMENT_RATE: {
    SUSPICIOUS_PER_MINUTE: 10,
    FIRST_HOUR_COORDINATION_THRESHOLD: 0.8,
    DISTRIBUTION_STDEV_THRESHOLD: 0.15,
    MIN_SUSPICIOUS_ENGAGEMENT: 50,
  },

  // Conversation depth thresholds
  CONVERSATION_DEPTH: {
    LONG_REPLY_MIN_LENGTH: 100,
    DEEP_REPLY_POINTS: 3,
    THREAD_BONUS_POINTS: 10,
    BASE_POINTS_PER_REPLY: 2,
  },

  // Spam detection thresholds
  SPAM_DETECTION: {
    IMPROBABLE_GROWTH_THRESHOLD: 10,
    MIN_ENGAGEMENT_FOR_PATTERN: 20,
    SHORT_REPLY_MAX_LENGTH: 10,
    SHORT_REPLY_RATIO_THRESHOLD: 0.6,
    MIN_REPLIES_FOR_SHORT_ANALYSIS: 10,
    TRUST_MULTIPLIER_MIN: 0.3,
    TRUST_MULTIPLIER_MAX: 1.0,
  },

  // Account trust score thresholds
  TRUST_SCORE: {
    NEW_ACCOUNT_DAYS: 7,
    GROWING_ACCOUNT_DAYS: 30,
    ESTABLISHED_ACCOUNT_DAYS: 180,
    ENGAGEMENT_PER_POST_MIN: 5,
    ENGAGEMENT_PER_POST_MAX: 50,
    REPLY_RATIO_GOOD_THRESHOLD: 0.2,
    SPAM_REPORT_RATIO_HIGH: 0.7,
    SPAM_REPORT_RATIO_MEDIUM: 0.4,
    REPORT_COUNT_HIGH: 5,
  },

  // Topic diversity configuration
  TOPIC_DIVERSITY: {
    SIMILARITY_PENALTY_MAX: 0.5,
    PREVIOUS_POSTS_TO_CHECK: 3,
  },

  // Cache configuration
  CACHE: {
    ENGAGEMENT_STATS_TTL_MS: 60 * 60 * 1000, // 1 hour
  },
} as const;

// ============ Error Messages ============
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not found',
  INVALID_INPUT: 'Invalid input',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait before trying again.',
  DATABASE_ERROR: 'Database error. Please try again later.',
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

// ============ HTTP Status Codes ============
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500,
} as const;

