import { z } from 'zod';

// ==================== USER VALIDATIONS ====================
export const userProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed').optional(),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  avatar: z.instanceof(File).optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'high-contrast']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    mentions: z.boolean(),
    threadReplies: z.boolean(),
    challengeUpdates: z.boolean(),
  }),
  interests: z.array(z.enum(['ml', 'nlp', 'cv', 'rl', 'robotics', 'ethics', 'tools'])),
  codeLanguage: z.enum(['python', 'javascript', 'typescript', 'rust']),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// ==================== FORUM VALIDATIONS ====================
export const threadSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be at most 200 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(10000, 'Content must be at most 10000 characters'),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed'),
  category: z.enum(['discussion', 'question', 'showcase', 'tutorial', 'announcement']),
  isTechnical: z.boolean(),
  codeSnippet: z.string().max(2000).optional(),
});

export const replySchema = z.object({
  content: z
    .string()
    .min(10, 'Reply must be at least 10 characters')
    .max(5000, 'Reply must be at most 5000 characters'),
  threadId: z.string().uuid('Invalid thread ID'),
  parentReplyId: z.string().uuid('Invalid reply ID').optional(),
  codeSnippet: z.string().max(2000).optional(),
  references: z.array(z.string().url('Invalid URL')).max(5).optional(),
});

export const voteSchema = z.object({
  targetId: z.string().uuid('Invalid target ID'),
  targetType: z.enum(['thread', 'reply', 'model', 'challenge']),
  value: z.number().int().min(-1).max(1),
});

export type Thread = z.infer<typeof threadSchema>;
export type Reply = z.infer<typeof replySchema>;
export type Vote = z.infer<typeof voteSchema>;

// ==================== AI SANDBOX VALIDATIONS ====================
export const codeSnippetSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  code: z.string().min(10).max(10000),
  language: z.enum(['python', 'javascript', 'typescript']),
  framework: z.enum(['tensorflow', 'pytorch', 'scikit-learn', 'transformers']).optional(),
  dependencies: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean(),
});

export const executionRequestSchema = z.object({
  snippetId: z.string().uuid('Invalid snippet ID'),
  inputData: z.string().max(5000),
  parameters: z.record(z.any()).optional(),
});

export type CodeSnippet = z.infer<typeof codeSnippetSchema>;
export type ExecutionRequest = z.infer<typeof executionRequestSchema>;

// ==================== MODEL ZOO VALIDATIONS ====================
export const aiModelSchema = z.object({
  name: z.string().min(5).max(100),
  description: z.string().min(50).max(1000),
  category: z.enum(['classification', 'regression', 'generation', 'detection', 'translation']),
  framework: z.enum(['tensorflow', 'pytorch', 'jax', 'onnx']),
  architecture: z.string().min(3).max(100),
  inputFormat: z.string().min(3).max(100),
  outputFormat: z.string().min(3).max(100),
  accuracy: z.number().min(0).max(100).optional(),
  f1Score: z.number().min(0).max(1).optional(),
  inferenceTime: z.number().positive().optional(),
  modelFile: z.instanceof(File),
  sampleInput: z.string().max(5000),
  sampleOutput: z.string().max(5000),
  license: z.enum(['mit', 'apache-2.0', 'gpl-3.0', 'cc-by-4.0']),
});

export type AIModel = z.infer<typeof aiModelSchema>;

// ==================== CHALLENGES VALIDATIONS ====================
export const challengeSchema = z.object({
  title: z.string().min(10).max(150),
  description: z.string().min(100).max(5000),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.enum(['ml', 'nlp', 'cv', 'rl', 'data-science']),
  datasetUrl: z.string().url('Invalid dataset URL').optional(),
  evaluationMetric: z.string().min(3).max(100),
  submissionDeadline: z.date().min(new Date()),
  maxTeamSize: z.number().int().min(1).max(10),
});

export const challengeSubmissionSchema = z.object({
  challengeId: z.string().uuid('Invalid challenge ID'),
  solutionUrl: z.string().url('Invalid solution URL'),
  codeUrl: z.string().url('Invalid code URL'),
  description: z.string().min(100).max(2000),
  metrics: z.record(z.number()),
});

export type Challenge = z.infer<typeof challengeSchema>;
export type ChallengeSubmission = z.infer<typeof challengeSubmissionSchema>;

// ==================== CHAT VALIDATIONS ====================
export const chatMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  roomId: z.string().uuid('Invalid room ID'),
  messageType: z.enum(['text', 'code', 'image', 'file']),
  fileUrl: z.string().url('Invalid file URL').optional(),
});

export const chatRoomSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  isPrivate: z.boolean(),
  participantIds: z.array(z.string().uuid('Invalid user ID')).min(2),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRoom = z.infer<typeof chatRoomSchema>;

// ==================== FILE VALIDATIONS ====================
export const fileValidationSchema: {
  maxSize: {
    avatar: number;
    modelFile: number;
    generalFile: number;
    codeFile: number;
    imageFile: number;
    documentFile: number;
  };
  allowedTypes: {
    avatar: string[];
    modelFile: string[];
    codeFile: string[];
    imageFile: string[];
    documentFile: string[];
  };
  validateFile(file?: File, type?: keyof typeof fileValidationSchema.allowedTypes): string[];
} = {
  maxSize: {
    avatar: 5 * 1024 * 1024, // 5MB
    modelFile: 100 * 1024 * 1024, // 100MB
    generalFile: 10 * 1024 * 1024, // 10MB
    codeFile: 1 * 1024 * 1024, // 1MB
    imageFile: 10 * 1024 * 1024, // 10MB
    documentFile: 20 * 1024 * 1024, // 20MB
  },
  
  allowedTypes: {
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
    modelFile: ['application/octet-stream', '.h5', '.pt', '.pth'],
    codeFile: ['.py', '.js', '.ts', '.json'],
    imageFile: ['image/jpeg', 'image/png', 'image/gif'],
    documentFile: ['application/pdf'],
  },
  
  validateFile(file?: File, type?: keyof typeof fileValidationSchema.allowedTypes): string[] {
    const errors: string[] = [];
    
    if (!file) return errors;
    
    if (type && this.maxSize[type]) {
      if (file.size > this.maxSize[type]) {
        errors.push(`File size must be less than ${this.maxSize[type] / (1024 * 1024)}MB`);
      }
      
      if (this.allowedTypes[type]) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = this.allowedTypes[type].some(allowedType => 
          file.type === allowedType || allowedType.startsWith('.') && fileExtension === allowedType
        );
        
        if (!isValidType) {
          errors.push(`Invalid file type. Allowed types: ${this.allowedTypes[type].join(', ')}`);
        }
      }
    }
    
    return errors;
  },
};

// ==================== SEARCH VALIDATIONS ====================
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.object({
    category: z.array(z.enum(['threads', 'models', 'challenges', 'users'])).optional(),
    tags: z.array(z.string()).max(10).optional(),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
    sortBy: z.enum(['relevance', 'date', 'votes', 'popularity']).optional(),
    difficultyLevels: challengeSchema.shape.difficulty.array().optional(),
    frameworksUsed: aiModelSchema.shape.framework.array().optional(),
    languagesUsed : codeSnippetSchema.shape.language.array().optional()
}).optional()
});

export type SearchQuery =z.infer<typeof searchQuerySchema>;

// ==================== NETWORKING VALIDATIONS ====================
export const collaborationRequestSchema=z.object({
targetUserId :z.string().uuid('Invalid user ID'),
message :z.string().min(20).max(500),
projectType :z.enum(['open-source','research','startup','freelance']),
skillsNeeded :z.array(z.string()).min(1).max(10),
estimatedTimeline :z.enum(['short-term','medium-term','long-term'])
});

export const userMatchingPreferencesSchema=z.object({
lookingForCollaboration :z.boolean(),
availableFor :z.array(z.enum(['mentoring','pair-programming','project-work','research'])),
skillsToOffer :z.array(z.string()).max(15),
skillsSeeking :z.array(z.string()).max(15),
timezone :z.string()
});

export type CollaborationRequest=z.infer<typeof collaborationRequestSchema>;
export type UserMatchingPreferences=z.infer<typeof userMatchingPreferencesSchema>;

// ==================== EVENT VALIDATIONS ====================
export const eventSchema=z.object({
title :z.string().min(10).max(150),
description :z.string().min(50).max(2000),
eventType :z.enum(['webinar','workshop','hackathon','meetup','conference']),
startTime :z.date(),
endTime :z.date(),
timezone :z.string(),
maxAttendees :z.number().int().positive().optional(),
registrationRequired :z.boolean(),
meetingLink :z.string().url('Invalid meeting URL').optional()
});

export const eventRegistrationSchema=z.object({
eventId :z.string().uuid('Invalid event ID'),
userId :z.string().uuid('Invalid user ID'),
questions :z.array(z.object({
question :z.string(),
answer :z.string()
})).max(5).optional()
});

export type Event=z.infer<typeof eventSchema>;
export type EventRegistration=z.infer<typeof eventRegistrationSchema>;

// ==================== HELPER FUNCTIONS ====================
export function sanitizeInput(input:string):string{
return input
.replace(/[<>]/g,'')
.trim()
.slice(0,10000);
}

export function validateEmailDomain(email:string):boolean{
const allowedDomains=['gmail.com','outlook.com','yahoo.com','protonmail.com'];
const domain=email.split('@')[1];
return allowedDomains.includes(domain)||domain.includes('.edu')||domain.includes('.org');
}

export function validateCodeSnippet(code:string,language:string):string[]{
const errors:string[]=[];
if(code.length>10000){
errors.push('Code exceeds maximum length of10000 characters');
}
if(language==='python'){
if(code.includes('os.system')||code.includes('subprocess.run')){
errors.push('Potentially unsafe system calls detected');
}
}
if(language==='javascript'||language==='typescript'){
if(code.includes('eval(')||code.includes('Function(')){
errors.push('Potentially unsafe eval usage detected');
}
}
return errors;
}

// Export all schemas for easy import
export const validationSchemas={
userProfile :userProfileSchema,
userPreferences :userPreferencesSchema,
thread :threadSchema,
reply :replySchema,
vote :voteSchema,
codeSnippet :codeSnippetSchema,
executionRequest :executionRequestSchema,
aiModel :aiModelSchema,
challenge :challengeSchema,
challengeSubmission :challengeSubmissionSchema,
chatMessage :chatMessageSchema,
chatRoom :chatRoomSchema,
searchQuery :searchQuerySchema,
collaborationRequest :collaborationRequestSchema,
userMatchingPreferences :userMatchingPreferencesSchema,
event :eventSchema,
eventRegistration :eventRegistrationSchema
};

// Type exports for all schemas
export type ValidationSchemas=typeof validationSchemas;