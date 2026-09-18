# Clipboard Management (React + Vite)

A modern, responsive, offline-first web application for managing clipboard history, ported from `kaleereal/Clipboard-Management`.

## Features Ported

- **Clipboard Capture & History**:
  - Live OS clipboard reading and instant manual capture.
  - Pause capture toggle and Incognito mode.
  - Tabbed organization: All, Pinned, Frequently Used, and Trash.
  - Multi-selection with batch deletion and snippet merging (custom separators).
- **Organization**:
  - Folders with custom colors and archive status.
  - Tags with color-coding and linked snippet counts.
  - Smart Folders with dynamic content-type filtering (`URL`, `CODE`, `TEXT`, `NUMBER`).
  - Auto-Tagging automation rules matching keywords and Regular Expressions (Regex).
- **Editor & Versioning**:
  - Full-screen snippet editor with undo/redo history.
  - Dynamic token insertion (`{date}`, `{time}`, `{datetime}`, `{clipboard}`).
  - Live character, word, and line statistics.
  - Snippet splitting (newline, comma, blank line, custom delimiter).
  - Version history with one-click restoration and side-by-side Diff comparison.
- **Text Processing Tools**:
  - Text Sanitization: Remove excess blank lines, trim spaces, replace tabs, collapse double spaces.
  - Case Converter: camelCase, snake_case, kebab-case, UPPERCASE, lowercase, Title Case.
  - Code Formatter: Prettify and minify JSON, indent XML/HTML.
  - Data Extraction: Regex extraction for Phone numbers, Email addresses, URLs, and IP addresses.
  - Stacking & Sequential Pasting Queue with step-by-step rolling copy.
  - Lorem Ipsum generator (paragraphs, sentences, words).
- **Search & Visualization**:
  - Instant text and regex search.
  - Advanced multi-criteria filters (content type, folder, tag).
  - Saved search filter presets with quick execution.
  - Tag Relationship Graph rendered on an interactive HTML5 canvas.
- **Security & Privacy**:
  - Sensitive data auto-detection (Luhn credit card algorithm, API secrets, Bearer tokens, passwords) with masked preview and peek toggles.
  - 4-digit PIN lock screen with auto-lock timeout.
  - Excluded apps blacklist.
- **Analytics & Backup**:
  - Total copies, saved keystrokes/time, and active snippet KPIs.
  - Weekly activity distribution and content type breakdown.
  - Full backup export and restore in JSON, CSV, and TXT formats with Merge or Replace modes.

## Tech Stack
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage with automatic schema persistence
