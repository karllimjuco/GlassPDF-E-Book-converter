// ─────────────────────────────────────────────
// GlassPDF — Shared Types
// ─────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentColor =
  | 'violet'
  | 'teal'
  | 'amber'
  | 'rose'
  | 'slateblue';

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentColor;
  glassBlur: number; // 8–32
  reducedMotion: boolean;
}

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  thumbnailUrl?: string; // object URL for first-page thumbnail
}

export interface PdfPageItem {
  id: string;
  pageIndex: number; // 0-based original index
  rotation: number;  // 0 | 90 | 180 | 270
  deleted: boolean;
  thumbnailUrl?: string;
}

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  previewUrl: string;
}

export type ProcessingStatus =
  | 'idle'
  | 'loading'
  | 'processing'
  | 'done'
  | 'error';

export interface RecentFile {
  id: string;
  name: string;
  tool: string;
  timestamp: number;
  sizeBytes: number;
}

export type FitMode = 'fit' | 'actual' | 'stretch';

export interface WatermarkOptions {
  text: string;
  opacity: number;     // 0–1
  angle: number;       // degrees
  fontSize: number;    // pt
  color: string;       // hex
  tileAll: boolean;
}

export interface PasswordOptions {
  enabled: boolean;
  userPassword: string;
  ownerPassword: string;
}
