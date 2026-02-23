export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  joinDate: Date;
  reputation: number;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface UserProfile extends User {
  skills: Skill[];
  projects: Project[];
  contributions: Contribution[];
  badges: Badge[];
  following: string[];
  followers: string[];
  notificationSettings: NotificationSettings;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 1-5
  yearsOfExperience: number;
}

export type SkillCategory = 
  | 'machine-learning'
  | 'deep-learning'
  | 'nlp'
  | 'computer-vision'
  | 'reinforcement-learning'
  | 'data-science'
  | 'ml-ops'
  | 'other';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

// Forum types
export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  tags: ThreadTag[];
  category: ThreadCategory;
  upvotes: number;
  downvotes: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  replyCount: number;
}

export interface ThreadTag {
  id: string;
  name: string;
  color: string;
}

export type ThreadCategory = 
  | 'discussion'
  | 'question'
  | 'tutorial'
  | 'showcase'
  | 'challenge'
  | 'announcement'
  | 'job';

export interface Reply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  author?: User;
  upvotes: number;
  downvotes: number;
  isSolution: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Vote {
  id: string;
  userId: string;
  threadId?: string;
  replyId?: string;
  type: 'upvote' | 'downvote';
}

// AI Sandbox types
export interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: CodeLanguage;
  framework?: Framework;
  authorId: string;
  author?: User;
  tags: string[];
  upvotes: number;
  forks: number;
  isPublic: boolean;
  createdAt: Date;
}

export type CodeLanguage = 
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'r'
  | 'julia'
  | 'other';

export type Framework = 
  | 'tensorflow'
  | 'pytorch'
  | 'keras'
  | 'scikit-learn'
  | 'huggingface'
  | 'langchain'
  | 'other';

export interface SandboxSession {
  id: string;
  userId?: string;
  codeSnippetId?: string;
  code: string;
  language: CodeLanguage;
  output?: SandboxOutput[];
  isRunning: boolean;
  createdAt: Date;
}

export interface SandboxOutput {
  type: 'stdout' | 'stderr' | 'result' | 'error';
  content: string;
}

// Model Zoo types
export interface AIModel {
  id: string;
  name: string;
  description: string;
  authorId: string;
  author?: User;
  modelType: ModelType;
  framework: Framework;
  tags: string[];
  metrics: ModelMetrics;
  codeUrl?: string;
  demoUrl?: string;
  paperUrl?: string;
  upvotes: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  license?: string;
}

export type ModelType = 
|'classification' 
|'regression' 
|'generative' 
|'transformer' 
|'cnn' 
|'rnn' 
|'gan' 
|'other';

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  inferenceTime?: number;
  modelSize?: number;
  trainingTime?: number;
}

// Challenges types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: SkillCategory;
  requirements: ChallengeRequirement[];
  testCases: TestCase[];
  starterCode?: string;
  solutionTemplate?: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  submissions: ChallengeSubmission[];
  createdAt: Date;
}

export type ChallengeDifficulty = 
|'beginner' 
|'intermediate' 
|'advanced' 
|'expert';

export interface ChallengeRequirement {
  id: string;
  description: string;
  isRequired: boolean;
}

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: any;
  isHidden: boolean;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  user?: User;
  code: string;
  language: CodeLanguage;
  passedTests: number;
  totalTests: number;
  score: number;
  submittedAt: Date;
  executionTime?: number;
}

// Chat and assistant types
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId?: string;
  sender?: User;
  content: string;
  type: MessageType;
  metadata?: ChatMetadata;
  createdAt: Date;
}

export type MessageType = 
|'text' 
|'code' 
|'image' 
|'file' 
|'system';

export interface ChatMetadata {
  codeLanguage?: CodeLanguage;
  fileName?: string;
  fileSize?: number;
  modelReference?: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: ChatRoomType;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
  unreadCount?: number;
}

export type ChatRoomType = 
|'direct' 
|'group' 
|'thread' 
|'assistant';

// Networking and collaboration types
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner?: User;
  collaborators: ProjectCollaborator[];
  technologies: Technology[];
  githubUrl?: string;
  demoUrl?: string;
  status: ProjectStatus;
  lookingForRoles?: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 
|'planning' 
|'development' 
|'beta' 
|'released' 
|'archived';

export interface ProjectCollaborator {
  userId: string;
  user?: User;
  role: Role;
  joinedAt: Date;
}

export type Role = 
|'ml-engineer' 
|'data-scientist' 
|'backend-dev' 
|'frontend-dev' 
|'researcher' 
|'product-manager';

export interface Technology {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface CollaborationRequest {
  id: string;
  projectId: string;
  project?: Project;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  message?: string;
  status: RequestStatus;
  createdAt: Date;
}

export type RequestStatus = 
|'pending' 
|'accepted' 
|'rejected';

// Trends and analytics types
export interface TrendData {
  technologyId: string;
  technologyName: string;
  category: SkillCategory;
  discussionCount: number;
  mentionGrowth: number; // percentage
  averageSentiment?: number; // -1 to +1
  relatedTechnologies?: {
    id: string;
    name: string;
    correlation: number;
  }[];
}

export interface GitHubTrend {
  id: string;
  repoName: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: CodeLanguage;
  framework?: Framework;
  trendingScore: number;
  url: string;
}

// Dashboard and personalization types
export interface UserPreferences {
  theme: AppTheme;
  notifications: NotificationSettings;
  emailFrequency: EmailFrequency;
  defaultCodeLanguage: CodeLanguage;
  showOnlineStatus: boolean;
}

export type AppTheme = 
'dark'

| 'light'

| 'high-contrast'

| 'auto';

export interface NotificationSettings {
  emailThreadReplies: boolean;
  emailChallengeUpdates: boolean;
  emailCollaborationRequests: boolean;
  pushThreadReplies: boolean;
  pushChallengeUpdates: boolean;
  pushCollaborationRequests: boolean;
}

export type EmailFrequency = 
'realtime'

| 'daily'

| 'weekly'

| 'never';

export interface ActivityFeedItem {
  id: string;
  userId: string;
  user?: User;
  type: ActivityType;
  targetId?: string;
  targetType?: ActivityTargetType;
  data?: Record<string, any>;
  createdAt: Date;
}

export type ActivityType = 
'thread_created'

| 'reply_posted'

| 'challenge_submitted'

| 'model_shared'

| 'project_created'

| 'collaboration_requested'

| 'badge_earned';

export type ActivityTargetType = 
'thread'

| 'reply'

| 'challenge'

| 'model'

| 'project'

| 'user';

// Contribution tracking
export interface Contribution {
  id: string;
  userId: string;
  user?: User;
  type: ContributionType;
  points: number;
  description: string;
  createdAt: Date;
}

export type ContributionType = 
'reply_solution'

| 'challenge_winner'

| 'model_shared'

| 'tutorial_written'

| 'bug_report'

| 'feature_suggestion';

// Search and filtering types
export interface SearchFilters {
  query?: string;
  categories?: ThreadCategory[];
  tags?: string[];
  languages?: CodeLanguage[];
  frameworks?: Framework[];
  difficulty?: ChallengeDifficulty[];
  timeRange?: TimeRange;
  sortBy?: SortOption;
}

export type TimeRange = 
'all'
| 'today'
| 'week'

| 'month'

| 'year';

export type SortOption = 
'relevance'

| 'newest'

| 'popular'

| 'most_voted'

| 'trending';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form validation types
export interface ThreadFormData {
  title: string;
  content: string;
  category: ThreadCategory;
  tags: ThreadTag[];
}

export interface ReplyFormData {
  content: string;
  threadId: string;
}

export interface CodeSnippetFormData {
  title: string;
  description?: string;
  code: string;
  language: CodeLanguage;
  framework?: Framework;
  tags: string[];
  isPublic: boolean;
}

// Event types for real-time features
export interface SocketEvent<T = any> {
  type: SocketEventType;
  data?: T;
  timestamp: Date;
}

export type SocketEventType = 
'message_sent'

| 'user_online'

| 'user_offline'

| 'thread_updated'

| 'challenge_progress'

| 'sandbox_output'

| 'notification';

// Utility types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Nullable<T> = T | null | undefined;

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;