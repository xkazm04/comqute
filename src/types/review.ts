// Review and reputation system types

// Individual review from a requester
export interface WorkerReview {
  id: string;
  workerId: string;
  requesterId: string;
  requesterAddress: string;
  jobId: string;
  rating: number; // 1-5 stars
  comment: string;
  responseTime: number; // ms - how long the job took
  createdAt: number;
}

// Request to create a review
export interface CreateReviewRequest {
  workerId: string;
  requesterId: string;
  requesterAddress: string;
  jobId: string;
  rating: number;
  comment: string;
  responseTime: number;
}

// Extended worker stats for reputation system
export interface WorkerReputationStats {
  // Basic stats
  jobsCompleted: number;
  totalEarnings: number;

  // Upwork-like metrics
  completionRate: number; // 0-100%
  avgResponseTime: number; // ms
  avgRating: number; // 1-5 stars
  totalReviews: number;

  // Rating distribution
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };

  // Legacy reputation score (0-100) for backward compat
  reputation: number;

  // Time-based metrics
  memberSince: number;
  lastActiveAt: number;

  // Trust indicators
  repeatClients: number;
  jobsLast30Days: number;
}

// Worker preference (for requesters to prefer specific workers)
export interface WorkerPreference {
  id: string;
  requesterId: string;
  workerId: string;
  workerAddress: string;
  workerName: string;
  isFavorite: boolean;
  notes: string;
  lastJobAt: number;
  totalJobsTogether: number;
  avgRatingGiven: number;
  createdAt: number;
}

// Simplified worker info for display in lists
export interface WorkerListItem {
  id: string;
  address: string;
  name: string;
  status: "online" | "busy" | "offline";
  avgRating: number;
  totalReviews: number;
  completionRate: number;
  avgResponseTime: number;
  jobsCompleted: number;
  memberSince: number;
  isFavorite?: boolean;
}
