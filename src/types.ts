export type ContentType = 'TEXT' | 'URL' | 'CODE' | 'NUMBER';

export interface ClipItem {
  id: string;
  content: string;
  plainContent: string;
  richContent?: string | null;
  contentType: ContentType;
  sourceApp: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
  useCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isSensitive: boolean;
  isSelfDestruct: boolean;
  folderId?: string | null;
  tagIds?: string[];
  charCount: number;
  wordCount: number;
  lineCount: number;
  contentHash: string;
  deletedAt?: number | null;
  isDeleted: boolean;
}

export interface ClipVersion {
  id: string;
  clipId: string;
  content: string;
  versionNumber: number;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  icon: string;
  color: string;
  isArchived: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  parentId?: string | null;
  color: string;
  createdAt: number;
}

export interface SmartFolder {
  id: string;
  name: string;
  icon: string;
  conditionsJson: string; // e.g. { "type": "URL" } or { "contains": "http" }
  createdAt: number;
}

export interface AutoTagRule {
  id: string;
  name: string;
  pattern: string;
  isRegex: boolean;
  targetTagId: string;
  isEnabled: boolean;
  createdAt: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  queryText: string;
  isRegex: boolean;
  filterJson: string;
  createdAt: number;
}

export interface UsageEvent {
  id: string;
  clipId?: string | null;
  eventType: 'CAPTURE' | 'COPY' | 'PASTE';
  sourceApp: string;
  timestamp: number;
}

export type DisplayMode = 'COMPACT' | 'GRID' | 'DETAILED';
export type SortOrder = 'NEWEST' | 'OLDEST' | 'MOST_USED' | 'TEXT_SIZE';
export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export type ScreenType =
  | 'HOME'
  | 'FOLDERS_TAGS'
  | 'TOOLS'
  | 'TEXT_TOOLS'
  | 'ANALYTICS'
  | 'SETTINGS'
  | 'SEARCH'
  | 'EDITOR'
  | 'SECURITY'
  | 'BACKUP_RESTORE';

export interface BackupMetadata {
  id: string;
  fileName: string;
  itemCount: number;
  fileSizeBytes: number;
  createdAt: number;
  isEncrypted: boolean;
}

export interface AppSettingsState {
  captureEnabled: boolean;
  incognitoMode: boolean;
  dedupMode: 'UPDATE_TIME' | 'IGNORE';
  keepFormat: boolean;
  autoPurgeHours: number; // 0, 24, 168, 720
  maxItems: number; // 0 = unlimited
  trashDays: number;
  displayMode: DisplayMode;
  sortOrder?: SortOrder;
  maxHistoryItems?: number;
  autoCleanTrashDays?: number;
  theme: 'SYSTEM' | 'LIGHT' | 'DARK';
  haptic: boolean;
  sound: boolean;
  eventNotif: boolean;
  onlineUnfurl: boolean;

  // Security
  appLockEnabled: boolean;
  appPin: string;
  biometricEnabled: boolean;
  autoLockDelayMinutes: number;
  stealthMode: boolean;
  appWhitelist: string[];
  appBlacklist: string[];
}
