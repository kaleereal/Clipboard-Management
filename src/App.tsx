import React, { useState, useEffect, useCallback } from 'react';
import { ClipItem, Folder, Tag, SmartFolder, AutoTagRule, ClipVersion, FilterPreset, BackupMetadata, UsageEvent, AppSettingsState, ScreenType, ContentType } from './types';
import {
  initialClips,
  initialFolders,
  initialTags,
  initialSmartFolders,
  initialRules,
  initialVersions,
  initialPresets,
  initialSettings,
} from './data/initialData';
import {
  detectContentType,
  calculateHash,
  isSensitiveContent,
  applyAutoTagRules,
} from './services/storage';
import { TopBar, BottomNav } from './components/Navigation';
import { LockScreen } from './components/LockScreen';
import { Toast } from './components/Toast';

import { HomeScreen } from './screens/HomeScreen';
import { EditorScreen } from './screens/EditorScreen';
import { FoldersTagsScreen } from './screens/FoldersTagsScreen';
import { SearchScreen } from './screens/SearchScreen';
import { TextToolsScreen } from './screens/TextToolsScreen';
import { SecurityScreen } from './screens/SecurityScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { BackupRestoreScreen } from './screens/BackupRestoreScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const STORAGE_KEYS = {
  CLIPS: 'clipboard_app_clips',
  FOLDERS: 'clipboard_app_folders',
  TAGS: 'clipboard_app_tags',
  SMART_FOLDERS: 'clipboard_app_smart_folders',
  RULES: 'clipboard_app_rules',
  VERSIONS: 'clipboard_app_versions',
  PRESETS: 'clipboard_app_presets',
  BACKUPS: 'clipboard_app_backups',
  EVENTS: 'clipboard_app_events',
  SETTINGS: 'clipboard_app_settings',
};

export const App: React.FC = () => {
  // 1. Core State with Local Storage fallback
  const [clips, setClips] = useState<ClipItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIPS);
      return saved ? JSON.parse(saved) : initialClips;
    } catch {
      return initialClips;
    }
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      return saved ? JSON.parse(saved) : initialFolders;
    } catch {
      return initialFolders;
    }
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAGS);
      return saved ? JSON.parse(saved) : initialTags;
    } catch {
      return initialTags;
    }
  });

  const [smartFolders, setSmartFolders] = useState<SmartFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SMART_FOLDERS);
      return saved ? JSON.parse(saved) : initialSmartFolders;
    } catch {
      return initialSmartFolders;
    }
  });

  const [rules, setRules] = useState<AutoTagRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RULES);
      return saved ? JSON.parse(saved) : initialRules;
    } catch {
      return initialRules;
    }
  });

  const [versions, setVersions] = useState<ClipVersion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VERSIONS);
      return saved ? JSON.parse(saved) : initialVersions;
    } catch {
      return initialVersions;
    }
  });

  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESETS);
      return saved ? JSON.parse(saved) : initialPresets;
    } catch {
      return initialPresets;
    }
  });

  const [backups, setBackups] = useState<BackupMetadata[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BACKUPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [events, setEvents] = useState<UsageEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // 2. Navigation & UI state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [editingClip, setEditingClip] = useState<ClipItem | null>(null);
  const [searchFilterInit, setSearchFilterInit] = useState<{
    folderId?: string | null;
    tagId?: string | null;
  }>({});
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return settings.appLockEnabled && Boolean(settings.appPin);
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIPS, JSON.stringify(clips));
  }, [clips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SMART_FOLDERS, JSON.stringify(smartFolders));
  }, [smartFolders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
  }, [versions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Handler: Update Settings
  const handleUpdateSettings = (newSettings: Partial<AppSettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Handler: Simulate / Capture new clip
  const handleSimulateCapture = useCallback(
    (content: string, sourceApp = 'Web App') => {
      if (!settings.captureEnabled) {
        showToast('Penangkapan sedang dijeda');
        return;
      }

      if (settings.incognitoMode) {
        showToast('Mode Incognito: Teks tidak disimpan');
        return;
      }

      // Check blacklist
      const lowerApp = sourceApp.toLowerCase();
      if (settings.appBlacklist.some(pkg => lowerApp.includes(pkg))) {
        showToast(`Diabaikan: Sumber aplikasi ${sourceApp} ada di daftar hitam`);
        return;
      }

      // Duplicate prevention: if exactly same as the most recent clip within 2 seconds
      if (clips.length > 0 && clips[0].content === content && Date.now() - clips[0].createdAt < 2000) {
        return;
      }

      const contentType = detectContentType(content);
      const hash = calculateHash(content);
      const sensitive = isSensitiveContent(content);
      const matchedTagIds = applyAutoTagRules(content, rules);
      const now = Date.now();

      const newClip: ClipItem = {
        id: `clip_${now}_${Math.random().toString(36).slice(2, 6)}`,
        content,
        plainContent: content,
        contentType,
        folderId: null,
        tagIds: matchedTagIds,
        isPinned: false,
        isLocked: false,
        isSensitive: sensitive,
        isSelfDestruct: false,
        isDeleted: false,
        useCount: 0,
        charCount: content.length,
        wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
        lineCount: content.split('\n').length,
        contentHash: hash,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
        sourceApp,
      };

      const maxLimit = settings.maxHistoryItems || settings.maxItems;
      setClips(prev => [
        newClip,
        ...(maxLimit && maxLimit > 0 ? prev.slice(0, maxLimit - 1) : prev),
      ]);
      showToast('Teks baru berhasil disimpan ke riwayat');
    },
    [clips, settings, rules, showToast]
  );

  // Handler: Copy Clip
  const handleCopyClip = useCallback(
    (clip: ClipItem) => {
      try {
        navigator.clipboard.writeText(clip.content);
      } catch {
        // Fallback for sandboxed iframe
      }

      // Increment useCount
      setClips(prev =>
        prev.map(c => (c.id === clip.id ? { ...c, useCount: c.useCount + 1 } : c))
      );

      // Record event
      setEvents(prev => [
        {
          id: `evt_${Date.now()}`,
          clipId: clip.id,
          eventType: 'COPY',
          sourceApp: clip.sourceApp || 'com.clipboard.management',
          timestamp: Date.now(),
        },
        ...prev.slice(0, 500),
      ]);

      showToast('Teks disalin ke papan klip');
    },
    [showToast]
  );

  // Handler: Toggle Pin
  const handleTogglePin = (clipId: string) => {
    setClips(prev =>
      prev.map(c => (c.id === clipId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Handler: Move to Trash
  const handleDeleteClip = (clipId: string) => {
    setClips(prev =>
      prev.map(c => (c.id === clipId ? { ...c, isDeleted: true } : c))
    );
    showToast('Snippet dipindahkan ke Sampah');
  };

  // Handler: Restore from Trash
  const handleRestoreClip = (clipId: string) => {
    setClips(prev =>
      prev.map(c => (c.id === clipId ? { ...c, isDeleted: false } : c))
    );
    showToast('Snippet dipulihkan');
  };

  // Handler: Permanent Delete
  const handlePermanentDeleteClip = (clipId: string) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    setVersions(prev => prev.filter(v => v.clipId !== clipId));
    showToast('Snippet dihapus permanen');
  };

  // Handler: Empty Trash
  const handleEmptyTrash = () => {
    const trashIds = new Set(clips.filter(c => c.isDeleted).map(c => c.id));
    setClips(prev => prev.filter(c => !c.isDeleted));
    setVersions(prev => prev.filter(v => !trashIds.has(v.clipId)));
    showToast('Semua item di Sampah telah dihapus');
  };

  // Handler: Batch Delete
  const handleBatchDelete = (clipIds: string[]) => {
    const idSet = new Set(clipIds);
    setClips(prev =>
      prev.map(c => (idSet.has(c.id) ? { ...c, isDeleted: true } : c))
    );
    showToast(`${clipIds.length} item dipindahkan ke Sampah`);
  };

  // Handler: Merge Clips
  const handleMergeClips = (clipIds: string[], separator: string) => {
    const selectedClips = clips.filter(c => clipIds.includes(c.id));
    if (selectedClips.length < 2) return;

    const mergedContent = selectedClips.map(c => c.content).join(separator);
    const contentType = detectContentType(mergedContent);

    const newClip: ClipItem = {
      id: `clip_merge_${Date.now()}`,
      content: mergedContent,
      plainContent: mergedContent,
      contentType,
      folderId: null,
      tagIds: [],
      isPinned: false,
      isLocked: false,
      isSensitive: false,
      isSelfDestruct: false,
      isDeleted: false,
      useCount: 0,
      charCount: mergedContent.length,
      wordCount: mergedContent.trim() ? mergedContent.trim().split(/\s+/).length : 0,
      lineCount: mergedContent.split('\n').length,
      contentHash: calculateHash(mergedContent),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
      sourceApp: 'Merge Tool',
    };

    setClips(prev => [newClip, ...prev]);
    showToast(`${clipIds.length} snippet berhasil digabungkan`);
  };

  // Handler: Save Snippet (Add or Edit)
  const handleSaveClip = (clipData: {
    id?: string;
    content: string;
    contentType: ContentType;
    folderId: string | null;
    tagIds: string[];
    isPinned: boolean;
    isLocked: boolean;
    isSensitive: boolean;
    isSelfDestruct: boolean;
  }) => {
    if (clipData.id) {
      // Editing existing clip
      const existing = clips.find(c => c.id === clipData.id);
      if (existing && existing.content !== clipData.content) {
        // Record version
        const existingVersionsCount = versions.filter(v => v.clipId === existing.id).length;
        const newVersion: ClipVersion = {
          id: `ver_${Date.now()}`,
          clipId: existing.id,
          versionNumber: existingVersionsCount + 1,
          content: existing.content,
          createdAt: Date.now(),
        };
        setVersions(prev => [newVersion, ...prev]);
      }

      setClips(prev =>
        prev.map(c =>
          c.id === clipData.id
            ? {
                ...c,
                ...clipData,
                charCount: clipData.content.length,
                contentHash: calculateHash(clipData.content),
                updatedAt: Date.now(),
              }
            : c
        )
      );
      showToast('Perubahan snippet disimpan');
    } else {
      // Creating new clip
      const now = Date.now();
      const newClip: ClipItem = {
        id: `clip_${now}`,
        content: clipData.content,
        plainContent: clipData.content,
        contentType: clipData.contentType,
        folderId: clipData.folderId,
        tagIds: clipData.tagIds,
        isPinned: clipData.isPinned,
        isLocked: clipData.isLocked,
        isSensitive: clipData.isSensitive,
        isSelfDestruct: clipData.isSelfDestruct,
        isDeleted: false,
        useCount: 0,
        charCount: clipData.content.length,
        wordCount: clipData.content.trim() ? clipData.content.trim().split(/\s+/).length : 0,
        lineCount: clipData.content.split('\n').length,
        contentHash: calculateHash(clipData.content),
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
        sourceApp: 'Editor',
      };
      setClips(prev => [newClip, ...prev]);
      showToast('Snippet baru berhasil dibuat');
    }

    setCurrentScreen('HOME');
    setEditingClip(null);
  };

  // Handler: Split Snippet
  const handleSplitSnippet = (content: string, delimiter: string) => {
    const parts = content
      .split(delimiter)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (parts.length <= 1) {
      showToast('Tidak ada pemisahan yang dihasilkan.');
      return;
    }

    const newItems: ClipItem[] = parts.map((part, idx) => ({
      id: `clip_split_${Date.now()}_${idx}`,
      content: part,
      plainContent: part,
      contentType: detectContentType(part),
      folderId: null,
      tagIds: [],
      isPinned: false,
      isLocked: false,
      isSensitive: isSensitiveContent(part),
      isSelfDestruct: false,
      isDeleted: false,
      useCount: 0,
      charCount: part.length,
      wordCount: part.trim() ? part.trim().split(/\s+/).length : 0,
      lineCount: part.split('\n').length,
      contentHash: calculateHash(part),
      createdAt: Date.now() + idx,
      updatedAt: Date.now() + idx,
      lastUsedAt: Date.now() + idx,
      sourceApp: 'Split Tool',
    }));

    setClips(prev => [...newItems, ...prev]);
    showToast(`Berhasil memecah menjadi ${newItems.length} snippet baru`);
    setCurrentScreen('HOME');
  };

  // Handler: Folders & Tags
  const handleAddFolder = (name: string, color = '#6366f1') => {
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      icon: 'folder',
      color,
      isArchived: false,
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
    showToast(`Folder "${name}" dibuat`);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setClips(prev =>
      prev.map(c => (c.folderId === folderId ? { ...c, folderId: null } : c))
    );
    showToast('Folder dihapus');
  };

  const handleAddTag = (name: string, color = '#6366f1') => {
    const newTag: Tag = {
      id: `tag_${Date.now()}`,
      name,
      color,
      createdAt: Date.now(),
    };
    setTags(prev => [...prev, newTag]);
    showToast(`Tag #${name} dibuat`);
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setClips(prev =>
      prev.map(c => ({
        ...c,
        tagIds: (c.tagIds || []).filter(tid => tid !== tagId),
      }))
    );
    showToast('Tag dihapus');
  };

  const handleAddSmartFolder = (name: string, conditionType: string) => {
    const newSF: SmartFolder = {
      id: `smart_${Date.now()}`,
      name,
      icon: 'sparkles',
      conditionsJson: `contentType == "${conditionType}"`,
      createdAt: Date.now(),
    };
    setSmartFolders(prev => [...prev, newSF]);
    showToast(`Smart Folder "${name}" dibuat`);
  };

  const handleDeleteSmartFolder = (sfId: string) => {
    setSmartFolders(prev => prev.filter(s => s.id !== sfId));
    showToast('Smart Folder dihapus');
  };

  const handleAddRule = (name: string, pattern: string, isRegex: boolean, targetTagId: string) => {
    const newRule: AutoTagRule = {
      id: `rule_${Date.now()}`,
      name,
      pattern,
      isRegex,
      targetTagId,
      isEnabled: true,
      createdAt: Date.now(),
    };
    setRules(prev => [...prev, newRule]);
    showToast(`Aturan "${name}" dibuat`);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    showToast('Aturan dihapus');
  };

  // Handler: Presets
  const handleSavePreset = (name: string, queryText: string, isRegex: boolean, filterJson: string) => {
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      queryText,
      isRegex,
      filterJson,
      createdAt: Date.now(),
    };
    setPresets(prev => [...prev, newPreset]);
    showToast(`Preset "${name}" disimpan`);
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    showToast('Preset dihapus');
  };

  // Handler: Backup & Restore
  const handleImportData = (
    data: {
      clips: ClipItem[];
      folders?: Folder[];
      tags?: Tag[];
      versions?: ClipVersion[];
    },
    mode: 'MERGE' | 'REPLACE'
  ) => {
    if (mode === 'REPLACE') {
      setClips(data.clips);
      if (data.folders) setFolders(data.folders);
      if (data.tags) setTags(data.tags);
      if (data.versions) setVersions(data.versions);
    } else {
      // Merge
      setClips(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const filteredNew = data.clips.filter(c => !existingIds.has(c.id));
        return [...filteredNew, ...prev];
      });
      if (data.folders) {
        setFolders(prev => {
          const existingIds = new Set(prev.map(f => f.id));
          const filteredNew = data.folders!.filter(f => !existingIds.has(f.id));
          return [...prev, ...filteredNew];
        });
      }
      if (data.tags) {
        setTags(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const filteredNew = data.tags!.filter(t => !existingIds.has(t.id));
          return [...prev, ...filteredNew];
        });
      }
    }
  };

  const handleRecordBackup = (metadata: BackupMetadata) => {
    setBackups(prev => [metadata, ...prev]);
  };

  // Handler: Reset to Defaults
  const handleResetToDefaults = () => {
    setClips(initialClips);
    setFolders(initialFolders);
    setTags(initialTags);
    setSmartFolders(initialSmartFolders);
    setRules(initialRules);
    setVersions(initialVersions);
    setPresets(initialPresets);
    setBackups([]);
    setEvents([]);
    setSettings(initialSettings);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
      {/* App Lock Screen Overlay */}
      {isLocked && settings.appLockEnabled && (
        <LockScreen
          correctPin={settings.appPin}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Top Header Bar (when not in full sub-screens that provide their own back headers) */}
      {!['EDITOR', 'SEARCH', 'SECURITY', 'ANALYTICS', 'BACKUP_RESTORE', 'SETTINGS'].includes(
        currentScreen
      ) && (
        <TopBar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onNavigateTo={setCurrentScreen}
          captureEnabled={settings.captureEnabled}
          onToggleCapture={() =>
            handleUpdateSettings({ captureEnabled: !settings.captureEnabled })
          }
          incognitoMode={settings.incognitoMode}
          onToggleIncognito={() =>
            handleUpdateSettings({ incognitoMode: !settings.incognitoMode })
          }
          displayMode={settings.displayMode}
          onChangeDisplayMode={mode =>
            handleUpdateSettings({ displayMode: mode })
          }
          sortOrder={settings.sortOrder || 'NEWEST'}
          onChangeSortOrder={order =>
            handleUpdateSettings({ sortOrder: order })
          }
          onNewSnippet={() => {
            setEditingClip(null);
            setCurrentScreen('EDITOR');
          }}
        />
      )}

      {/* Screen Routing */}
      <main>
        {currentScreen === 'HOME' && (
          <HomeScreen
            clips={clips}
            folders={folders}
            tags={tags}
            captureEnabled={settings.captureEnabled}
            onToggleCapture={() =>
              handleUpdateSettings({ captureEnabled: !settings.captureEnabled })
            }
            incognitoMode={settings.incognitoMode}
            onToggleIncognito={() =>
              handleUpdateSettings({ incognitoMode: !settings.incognitoMode })
            }
            displayMode={settings.displayMode}
            sortOrder={settings.sortOrder || 'NEWEST'}
            onCopyClip={handleCopyClip}
            onEditClip={clip => {
              setEditingClip(clip);
              setCurrentScreen('EDITOR');
            }}
            onTogglePin={handleTogglePin}
            onDeleteClip={handleDeleteClip}
            onRestoreClip={handleRestoreClip}
            onPermanentDeleteClip={handlePermanentDeleteClip}
            onEmptyTrash={handleEmptyTrash}
            onMergeClips={handleMergeClips}
            onBatchDelete={handleBatchDelete}
            onNewSnippet={() => {
              setEditingClip(null);
              setCurrentScreen('EDITOR');
            }}
            onSimulateCapture={handleSimulateCapture}
          />
        )}

        {currentScreen === 'FOLDERS_TAGS' && (
          <FoldersTagsScreen
            folders={folders}
            tags={tags}
            smartFolders={smartFolders}
            rules={rules}
            clips={clips}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
            onAddSmartFolder={handleAddSmartFolder}
            onDeleteSmartFolder={handleDeleteSmartFolder}
            onAddRule={handleAddRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onNavigateToSearchWithFilter={(folderId, tagId) => {
              setSearchFilterInit({ folderId, tagId });
              setCurrentScreen('SEARCH');
            }}
          />
        )}

        {currentScreen === 'TEXT_TOOLS' && (
          <TextToolsScreen
            clips={clips}
            onSaveAsSnippet={content => {
              const now = Date.now();
              setEditingClip({
                id: '',
                content,
                plainContent: content,
                contentType: detectContentType(content),
                folderId: null,
                tagIds: [],
                isPinned: false,
                isLocked: false,
                isSensitive: false,
                isSelfDestruct: false,
                isDeleted: false,
                useCount: 0,
                charCount: content.length,
                wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
                lineCount: content.split('\n').length,
                contentHash: calculateHash(content),
                createdAt: now,
                updatedAt: now,
                lastUsedAt: now,
                sourceApp: 'Text Tools',
              });
              setCurrentScreen('EDITOR');
            }}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'SEARCH' && (
          <SearchScreen
            clips={clips}
            folders={folders}
            tags={tags}
            presets={presets}
            initialFolderId={searchFilterInit.folderId}
            initialTagId={searchFilterInit.tagId}
            onNavigateBack={() => setCurrentScreen('HOME')}
            onEditClip={clip => {
              setEditingClip(clip);
              setCurrentScreen('EDITOR');
            }}
            onCopyClip={handleCopyClip}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
          />
        )}

        {currentScreen === 'EDITOR' && (
          <EditorScreen
            clip={editingClip}
            versions={editingClip ? versions.filter(v => v.clipId === editingClip.id) : []}
            folders={folders}
            tags={tags}
            onSave={handleSaveClip}
            onNavigateBack={() => {
              setEditingClip(null);
              setCurrentScreen('HOME');
            }}
            onRestoreVersion={version => {
              showToast(`Versi ${version.versionNumber} dimuat ke editor`);
            }}
            onSplitSnippet={handleSplitSnippet}
          />
        )}

        {currentScreen === 'SECURITY' && (
          <SecurityScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onNavigateBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'ANALYTICS' && (
          <AnalyticsScreen
            clips={clips}
            events={events}
            onNavigateBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'BACKUP_RESTORE' && (
          <BackupRestoreScreen
            clips={clips}
            folders={folders}
            tags={tags}
            versions={versions}
            backups={backups}
            onImportData={handleImportData}
            onRecordBackup={handleRecordBackup}
            onNavigateBack={() => setCurrentScreen('HOME')}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onNavigateTo={setCurrentScreen}
            onNavigateBack={() => setCurrentScreen('HOME')}
            onResetToDefaults={handleResetToDefaults}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
