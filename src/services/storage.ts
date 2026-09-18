import { ClipItem, ContentType, AutoTagRule, AppSettingsState } from '../types';

export function detectContentType(content: string): ContentType {
  const trimmed = content.trim();
  if (/^(https?:\/\/|www\.)[^\s]+$/i.test(trimmed)) {
    return 'URL';
  }
  if (/^[\d\s\-\+\(\)\.]{3,30}$/.test(trimmed) && (trimmed.match(/\d/g) || []).length >= 3) {
    return 'NUMBER';
  }
  if (
    trimmed.includes('{') ||
    trimmed.includes('}') ||
    trimmed.includes('=>') ||
    trimmed.includes('function') ||
    trimmed.includes('const ') ||
    trimmed.includes('let ') ||
    trimmed.includes('var ') ||
    trimmed.includes('import ') ||
    trimmed.includes('export ') ||
    trimmed.includes('class ') ||
    trimmed.includes('SELECT ') ||
    trimmed.includes('INSERT ') ||
    trimmed.startsWith('<') && trimmed.endsWith('>')
  ) {
    return 'CODE';
  }
  return 'TEXT';
}

export function detectSensitive(content: string): boolean {
  // Luhn credit card regex
  const ccMatch = content.match(/\b(?:\d[ -]*?){13,19}\b/);
  if (ccMatch && isLuhnValid(ccMatch[0].replace(/\D/g, ''))) {
    return true;
  }
  // API key / token / bearer regex
  if (/(?:sk-[a-zA-Z0-9]{20,}|bearer\s+[a-zA-Z0-9_\-\.]{15,}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z-_]{35})/i.test(content)) {
    return true;
  }
  // Password keyword indicators
  if (/password\s*[:=]\s*\S+/i.test(content)) {
    return true;
  }
  return false;
}

export const isSensitiveContent = detectSensitive;

function isLuhnValid(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash-${Math.abs(hash).toString(16)}`;
}

export const calculateHash = generateHash;

export function calculateTextStats(content: string) {
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split('\n').length : 0;
  return { charCount, wordCount, lineCount };
}

export function applyAutoTagRules(content: string, rules: AutoTagRule[]): string[] {
  const matchedTagIds: string[] = [];
  for (const rule of rules) {
    if (!rule.isEnabled || !rule.pattern) continue;
    try {
      if (rule.isRegex) {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(content)) {
          matchedTagIds.push(rule.targetTagId);
        }
      } else {
        if (content.toLowerCase().includes(rule.pattern.toLowerCase())) {
          matchedTagIds.push(rule.targetTagId);
        }
      }
    } catch {
      // ignore regex syntax errors
    }
  }
  return Array.from(new Set(matchedTagIds));
}

export function filterClipsBySearch(
  clips: ClipItem[],
  query: string,
  isRegex: boolean,
  contentTypeFilter?: string | null,
  folderIdFilter?: string | null,
  tagIdFilter?: string | null
): ClipItem[] {
  let result = clips.filter(c => !c.isDeleted);

  if (contentTypeFilter && contentTypeFilter !== 'ALL') {
    result = result.filter(c => c.contentType === contentTypeFilter);
  }
  if (folderIdFilter) {
    result = result.filter(c => c.folderId === folderIdFilter);
  }
  if (tagIdFilter) {
    result = result.filter(c => c.tagIds?.includes(tagIdFilter));
  }

  if (query.trim()) {
    if (isRegex) {
      try {
        const regex = new RegExp(query, 'i');
        result = result.filter(c => regex.test(c.content));
      } catch {
        result = [];
      }
    } else {
      const q = query.toLowerCase();
      result = result.filter(c => c.content.toLowerCase().includes(q));
    }
  }

  return result;
}
