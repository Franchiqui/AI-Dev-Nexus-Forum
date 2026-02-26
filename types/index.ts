export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  fileType: MediaFileType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // For audio/video in seconds
  width?: number; // For images/video
  height?: number; // For images/video
  metadata: MediaMetadata;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaFileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface MediaMetadata {
  title?: string;
  description?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  cameraMake?: string;
  cameraModel?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  customTags: Record<string, string>;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverMediaId?: string;
  items: ProjectItem[];
  isPublic: boolean;
  shareLink?: string;
  viewCount: number;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectItem {
  id: string;
  mediaFileId: string;
  position: number;
  caption?: string;
  startTime?: number; // For video/audio clips
  endTime?: number; // For video/audio clips
}

export interface ProjectSettings {
  layout: 'grid' | 'carousel' | 'slideshow';
  autoplay: boolean;
  transitionSpeed: number;
  showCaptions: boolean;
}

export interface Gallery extends Omit<Project, 'items'> {
  items: GalleryItem[];
}

export interface GalleryItem {
  id: string;
  mediaFileId: string;
  position: number;
}

// Dashboard types
export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  position: WidgetPosition;
  size: WidgetSize;
  data?: Record<string, unknown>;
}

export type DashboardWidgetType = 
  | 'recent-files'
  | 'active-projects'
  | 'storage-usage'
  | 'suggestions'
  | 'quick-actions'
  | 'activity-feed';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

// Editor types
export type EditorType = 'image' | 'video' | 'audio' | 'document';

export interface ImageEditState {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  blur: number; // 0 to 100
  crop?: CropRegion;
}

export interface CropRegion {
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
}

export interface AudioEditState {
  volume: number; // -50 to +50 dB
  fadeInDuration: number; // seconds
  fadeOutDuration: number; // seconds
  trimStart?: number; // seconds
  trimEnd?: number; // seconds
}

export interface VideoEditState {
  trimStart?: number; // seconds
  trimEnd?: number; // seconds
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  hue?: number; // -180 to 180
  blur?: number; // 0 to 20
  timeline?: TimelineState;
  textClips?: TextClip[];
}

export interface TextClip {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: { x: number; y: number };
  startTime: number;
  duration: number;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
}

export interface TimelineState {
  duration: number; // total duration in seconds
  currentTime: number; // current playback position in seconds
  zoom: number; // zoom level (pixels per second)
  tracks: TimelineTrack[];
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  clips: TimelineClip[];
  isMuted?: boolean;
  isLocked?: boolean;
  volume?: number; // 0-1 for audio tracks
}

export type TrackType = 'video' | 'audio' | 'text';

export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom-in' | 'zoom-out' | 'blur' | 'dissolve';

export interface TimelineClip {
  id: string;
  trackId: string;
  mediaFileId?: string;
  type: TrackType;
  startTime: number; // position on timeline in seconds
  duration: number; // duration on timeline in seconds
  sourceStartTime?: number; // where to start in source media
  sourceDuration?: number; // how much of source media to use
  
  // Text-specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  position?: { x: number; y: number };
  
  // Common properties
  volume?: number; // 0-1
  opacity?: number; // 0-1
  
  // Visual properties
  thumbnailUrl?: string;
  backgroundColor?: string; // background color for text clips

  // Transition properties
  transitionIn?: {
    type: TransitionType;
    duration: number;
  };
  transitionOut?: {
    type: TransitionType;
    duration: number;
  };

  // Effects properties
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
}

export interface TextEditState {
  content: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  wordWrap?: boolean;
}

// Effects and filters
export interface MediaEffect {
  id: string;
  name: string;
  category: EffectCategory;
  type: EffectType;
  intensityRange: [number, number]; // min, max
}

export type EffectCategory = 
  | 'vintage'
  | 'modern'
  | 'cinematic'
  | 'energetic'
  | 'artistic'
  | 'black-white';

export type EffectType = 'image' | 'audio' | 'video';

// Export and sharing
export interface ExportPreset {
  id: string;
  name: string;
  description?: string;
  format: 'jpg' | 'png' | 'webp';
  quality: number; // 0-100
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export interface ExportSettings {
  presetId?: string;
  format: 'jpg' | 'png' | 'webp';
  quality: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  includeMetadata: boolean;
}