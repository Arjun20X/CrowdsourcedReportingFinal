/**
 * Shared code between client and server
 */

export type IssueStatus =
  | "submitted"
  | "pending_verification"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "escalated";

export type IssueCategory =
  | "pothole"
  | "graffiti"
  | "streetlight"
  | "garbage"
  | "other";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface Contribution {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  description: string;
  mediaUrl: string; // base64 or URL
  upvotes: number;
  createdAt: string;
}

export interface VotePayload {
  userId: string;
  vote: 1 | -1;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: GeoPoint;
  address: string;
  wardId: string;
  photoUrl: string;
  createdAt: string;
  status: IssueStatus;
  upvotes: number;
  downvotes: number;
  verificationThreshold: number;
  comments: Comment[];
  contributions?: Contribution[];
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  category: IssueCategory;
  location: GeoPoint;
  address: string;
  wardId: string;
  photoBase64?: string;
}

export interface IssuesResponse {
  issues: Issue[];
}

export interface StatsResponse {
  issuesReportedToday: number;
  resolvedThisMonth: number;
  avgTimeToResolutionHours: number;
  byCategory: { category: IssueCategory; count: number }[];
}

export interface DemoResponse {
  message: string;
}

// Community Feed Types
export interface CommunityPostMedia {
  url: string; // base64 data URL or external URL
  kind: "image" | "video";
}

export interface CommunityPost {
  id: string;
  userId: string;
  description: string;
  media: CommunityPostMedia[];
  upvotes: number;
  createdAt: string;
}

export interface CreateCommunityPostPayload {
  userId: string;
  description: string;
  mediaBase64: string[]; // any number of images/videos as data URLs
}

export interface CommunityPostsResponse {
  posts: CommunityPost[];
}

// Profile management types
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  phone: string;
}

export interface GetProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  phone?: string;
}

export interface UsernameCheckPayload { username: string }
export interface UsernameCheckResponse { available: boolean }

export interface ChangePasswordPayload { current: string; next: string }
export interface ChangePasswordResponse { ok: true }
