export const APP_NAME = 'AI-Dev Nexus Forum';
export const APP_SLOGAN = 'Conectando mentes, construyendo el futuro de la IA';
export const APP_DESCRIPTION = 'Foro de Desarrolladores de IA - Comunidad colaborativa para el desarrollo de inteligencia artificial';

// API endpoints
export const API_ENDPOINTS = {
  FORUM: {
    THREADS: '/api/forum/threads',
    POSTS: '/api/forum/posts',
    VOTES: '/api/forum/votes',
    TAGS: '/api/forum/tags',
    SEARCH: '/api/forum/search',
  },
  CHAT: {
    MESSAGES: '/api/chat/messages',
    ROOMS: '/api/chat/rooms',
    BOT: '/api/chat/bot',
  },
  SANDBOX: {
    CODE: '/api/sandbox/code',
    EXECUTE: '/api/sandbox/execute',
    SHARE: '/api/sandbox/share',
  },
  MODELS: {
    LIST: '/api/models',
    UPLOAD: '/api/models/upload',
    TEST: '/api/models/test',
  },
  CHALLENGES: {
    ACTIVE: '/api/challenges/active',
    SUBMIT: '/api/challenges/submit',
    LEADERBOARD: '/api/challenges/leaderboard',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    ONLINE: '/api/users/online',
    MATCHING: '/api/users/matching',
  },
  TRENDS: {
    HOT_TOPICS: '/api/trends/hot-topics',
    FRAMEWORKS: '/api/trends/frameworks',
    PAPERS: '/api/trends/papers',
  },
} as const;

// AI categories and tags
export const AI_CATEGORIES = [
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Reinforcement Learning',
  'Generative AI',
  'Robotics',
  'AI Ethics',
  'MLOps',
  'Edge AI',
] as const;

export const AI_TAGS = [
  'python',
  'tensorflow',
  'pytorch',
  'keras',
  'scikit-learn',
  'transformers',
  'llm',
  'gpt',
  'diffusion',
  'gan',
  'cnn',
  'rnn',
  'lstm',
  'attention',
  'bert',
  'openai',
  'huggingface',
  'langchain',
  'vector-db',
  'rag',
] as const;

// Programming languages supported in sandbox
export const SANDBOX_LANGUAGES = [
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'typescript', label: 'TypeScript', extension: '.ts' },
  { value: 'r', label: 'R', extension: '.r' },
  { value: 'julia', label: 'Julia', extension: '.jl' },
] as const;

// AI frameworks supported
export const AI_FRAMEWORKS = [
  { id: 'tf', name: 'TensorFlow', color: '#FF6F00' },
  { id: 'pt', name: 'PyTorch', color: '#EE4C2C' },
  { id: 'sk', name: 'Scikit-learn', color: '#F7931E' },
  { id: 'keras', name: 'Keras', color: '#D00000' },
  { id: 'hf', name: 'Hugging Face', color: '#FFD21E' },
  { id: 'onnx', name: 'ONNX', color: '#005CED' },
  { id: 'mxnet', name: 'MXNet', color: '#FF9900' },
  { id: 'jax', name: 'JAX', color: '#8A2BE2' },
] as const;

// Challenge difficulty levels
export const CHALLENGE_LEVELS = {
  BEGINNER: { value: 'beginner', label: 'Beginner', points: 10 },
  INTERMEDIATE: { value: 'intermediate', label: 'Intermediate', points: 25 },
  ADVANCED: { value: 'advanced', label: 'Advanced', points: 50 },
  EXPERT: { value: 'expert', label: 'Expert', points: 100 },
} as const;

// User roles and permissions
export const USER_ROLES = {
  GUEST: { id: 0, name: 'Guest', permissions: ['read'] },
  MEMBER: { id: 1, name: 'Member', permissions: ['read', 'write', 'vote'] },
  CONTRIBUTOR: { id: 2, name: 'Contributor', permissions: ['read', 'write', 'vote', 'edit_own'] },
  MODERATOR: { id: 3, name: 'Moderator', permissions: ['read', 'write', 'vote', 'edit_any', 'delete'] },
  ADMIN: { id: 4, name: 'Admin', permissions: ['all'] },
} as const;

// Chat constants
export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_ROOM_NAME_LENGTH: 50,
  MAX_ROOM_DESCRIPTION_LENGTH: 200,
  MESSAGES_PER_PAGE: 50,
} as const;

// Forum constants
export const FORUM_CONSTANTS = {
  POSTS_PER_PAGE: 20,
  THREADS_PER_PAGE: 15,
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MAX_TAGS_PER_THREAD: 5,
} as const;

// Model zoo constants
export const MODEL_CONSTANTS = {
  MAX_MODEL_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  SUPPORTED_FORMATS: ['.h5', '.pth', '.pt', '.onnx', '.pb'],
  MAX_FILE_SIZE_MB: 100,
} as const;

// Sandbox constants
export const SANDBOX_CONSTANTS = {
  MAX_CODE_LENGTH: 10000,
  MAX_OUTPUT_LENGTH: 5000,
  TIMEOUT_MS: 30000,
} as const;

// UI constants
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FASTEST_MS: -1,
  FAST_MS: 50,
  NORMAL_MS: 200,
  SLOW_MS: 300,
  SLOWEST_MS: 500,
} as const;
