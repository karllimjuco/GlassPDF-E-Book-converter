import type { RecentFile } from '@/types';

const KEY = 'glasspdf_recent';
const MAX_ENTRIES = 20;

export function getRecentFiles(): RecentFile[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentFile[]) : [];
  } catch {
    return [];
  }
}

export function addRecentFile(entry: Omit<RecentFile, 'id'>): void {
  const all = getRecentFiles();
  const newEntry: RecentFile = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  const updated = [newEntry, ...all].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // Storage full — silently ignore
  }
}

export function clearRecentFiles(): void {
  localStorage.removeItem(KEY);
}

export function removeRecentFile(id: string): void {
  const all = getRecentFiles().filter((f) => f.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}
