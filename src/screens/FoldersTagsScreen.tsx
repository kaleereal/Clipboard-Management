import React, { useState, useMemo } from 'react';
import {
  Folder as FolderIcon,
  Tag as TagIcon,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  Search,
  Check,
  Filter,
  ExternalLink
} from 'lucide-react';
import { Folder, Tag, SmartFolder, AutoTagRule, ClipItem } from '../types';

interface FoldersTagsScreenProps {
  folders: Folder[];
  tags: Tag[];
  smartFolders: SmartFolder[];
  rules: AutoTagRule[];
  clips: ClipItem[];
  onAddFolder: (name: string, color?: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddTag: (name: string, color?: string) => void;
  onDeleteTag: (tagId: string) => void;
  onAddSmartFolder: (name: string, conditionType: string) => void;
  onDeleteSmartFolder: (smartFolderId: string) => void;
  onAddRule: (name: string, pattern: string, isRegex: boolean, targetTagId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onNavigateToSearchWithFilter: (folderId?: string | null, tagId?: string | null) => void;
}

export const FoldersTagsScreen: React.FC<FoldersTagsScreenProps> = ({
  folders,
  tags,
  smartFolders,
  rules,
  clips,
  onAddFolder,
  onDeleteFolder,
  onAddTag,
  onDeleteTag,
  onAddSmartFolder,
  onDeleteSmartFolder,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onNavigateToSearchWithFilter,
}) => {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3>(0);

  // Add Dialogs state
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('#6366f1');

  // Rule specific dialog state
  const [rulePattern, setRulePattern] = useState('');
  const [ruleIsRegex, setRuleIsRegex] = useState(false);
  const [ruleTargetTagId, setRuleTargetTagId] = useState(tags[0]?.id || '');
  const [smartCondition, setSmartCondition] = useState('URL');

  // Orphan count: snippets without any folder and without any tags
  const orphanCount = useMemo(() => {
    return clips.filter(c => !c.isDeleted && !c.folderId && (!c.tagIds || c.tagIds.length === 0)).length;
  }, [clips]);

  // Counts of clips per folder and tag
  const folderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clips) {
      if (!c.isDeleted && c.folderId) {
        map[c.folderId] = (map[c.folderId] || 0) + 1;
      }
    }
    return map;
  }, [clips]);

  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clips) {
      if (!c.isDeleted && c.tagIds) {
        for (const tid of c.tagIds) {
          map[tid] = (map[tid] || 0) + 1;
        }
      }
    }
    return map;
  }, [clips]);

  const handleOpenAdd = () => {
    setNameInput('');
    setRulePattern('');
    setRuleIsRegex(false);
    setRuleTargetTagId(tags[0]?.id || '');
    setSmartCondition('URL');
    setShowAddModal(true);
  };

  const handleSaveAdd = () => {
    if (!nameInput.trim()) return;

    if (activeTab === 0) {
      onAddFolder(nameInput.trim(), colorInput);
    } else if (activeTab === 1) {
      onAddTag(nameInput.trim(), colorInput);
    } else if (activeTab === 2) {
      onAddSmartFolder(nameInput.trim(), smartCondition);
    } else if (activeTab === 3) {
      if (!rulePattern.trim() || !ruleTargetTagId) return;
      onAddRule(nameInput.trim(), rulePattern.trim(), ruleIsRegex, ruleTargetTagId);
    }

    setShowAddModal(false);
  };

  const tagMap = useMemo(() => new Map(tags.map(t => [t.id, t])), [tags]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Folder & Tag</h1>
          <p className="text-xs text-stone-500">Kelola kategori, label, dan otomatisasi tagging</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToSearchWithFilter(null, null)}
          className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
        >
          <Search className="w-4 h-4 text-stone-500" />
          <span>Cari</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 bg-stone-200/60 p-1 rounded-xl mb-4 text-xs font-semibold">
        {[
          { key: 0 as const, label: 'Folder' },
          { key: 1 as const, label: 'Tag' },
          { key: 2 as const, label: 'Smart' },
          { key: 3 as const, label: 'Aturan' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 rounded-lg transition ${
              activeTab === tab.key
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orphan snippets notice banner */}
      {activeTab === 0 && orphanCount > 0 && (
        <div className="mb-4 bg-stone-100 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs text-stone-700">
          <div>
            <span className="font-semibold text-stone-900">{orphanCount} snippet</span> belum dikelompokkan ke folder atau tag.
          </div>
          <button
            type="button"
            onClick={() => onNavigateToSearchWithFilter(null, null)}
            className="text-purple-700 font-semibold hover:underline text-xs shrink-0"
          >
            Lihat
          </button>
        </div>
      )}

      {/* Tab 0: Folders */}
      {activeTab === 0 && (
        <div className="flex flex-col gap-2">
          {folders.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs bg-white rounded-xl border border-stone-200">
              Belum ada folder. Buat folder baru dengan tombol + di bawah.
            </div>
          ) : (
            folders.map(folder => (
              <div
                key={folder.id}
                className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center justify-between shadow-xs hover:border-stone-300 transition"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => onNavigateToSearchWithFilter(folder.id, null)}
                >
                  <div
                    style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0"
                  >
                    <FolderIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800 text-sm">{folder.name}</div>
                    <div className="text-[11px] text-stone-400">
                      {folderCounts[folder.id] || 0} snippet
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onNavigateToSearchWithFilter(folder.id, null)}
                    title="Buka konten folder"
                    className="p-2 text-stone-400 hover:text-purple-600 hover:bg-stone-100 rounded-lg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFolder(folder.id)}
                    title="Hapus folder"
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 1: Tags */}
      {activeTab === 1 && (
        <div className="flex flex-col gap-2">
          {tags.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs bg-white rounded-xl border border-stone-200">
              Belum ada tag. Buat tag baru dengan tombol + di bawah.
            </div>
          ) : (
            tags.map(tag => (
              <div
                key={tag.id}
                className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center justify-between shadow-xs hover:border-stone-300 transition"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => onNavigateToSearchWithFilter(null, tag.id)}
                >
                  <div
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0"
                  >
                    <TagIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                      <span>{tag.name}</span>
                      <span
                        style={{ backgroundColor: tag.color }}
                        className="w-2.5 h-2.5 rounded-full inline-block"
                      />
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {tagCounts[tag.id] || 0} snippet
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onNavigateToSearchWithFilter(null, tag.id)}
                    title="Buka konten dengan tag ini"
                    className="p-2 text-stone-400 hover:text-purple-600 hover:bg-stone-100 rounded-lg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTag(tag.id)}
                    title="Hapus tag"
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Smart Folders */}
      {activeTab === 2 && (
        <div className="flex flex-col gap-2">
          {smartFolders.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs bg-white rounded-xl border border-stone-200">
              Belum ada smart folder dinamis.
            </div>
          ) : (
            smartFolders.map(sf => (
              <div
                key={sf.id}
                className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800 text-sm">{sf.name}</div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      Kriteria: {sf.conditionsJson}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteSmartFolder(sf.id)}
                  title="Hapus Smart Folder"
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Auto-Tag Rules */}
      {activeTab === 3 && (
        <div className="flex flex-col gap-2">
          {rules.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs bg-white rounded-xl border border-stone-200">
              Belum ada aturan auto-tag. Snippet baru dapat otomatis diberi tag berdasarkan kata kunci atau regex.
            </div>
          ) : (
            rules.map(rule => {
              const targetTag = tagMap.get(rule.targetTagId);
              return (
                <div
                  key={rule.id}
                  className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-800 text-sm">{rule.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        Pola: {rule.pattern} {rule.isRegex ? '(Regex)' : '(Teks)'}
                      </div>
                      {targetTag && (
                        <span
                          style={{ color: targetTag.color }}
                          className="text-[11px] font-medium"
                        >
                          → Tag #{targetTag.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleRule(rule.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        rule.isEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {rule.isEnabled ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRule(rule.id)}
                      title="Hapus aturan"
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={handleOpenAdd}
        className="fixed right-6 bottom-20 z-40 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        title="Tambah Item"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <h3 className="text-base font-bold text-stone-900 mb-3">
              {activeTab === 0 && 'Tambah Folder Baru'}
              {activeTab === 1 && 'Tambah Tag Baru'}
              {activeTab === 2 && 'Tambah Smart Folder Baru'}
              {activeTab === 3 && 'Tambah Aturan Auto-Tag'}
            </h3>

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama {activeTab === 0 ? 'Folder' : activeTab === 1 ? 'Tag' : activeTab === 2 ? 'Smart Folder' : 'Aturan'}:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {(activeTab === 0 || activeTab === 1) && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Pilih Warna:</label>
                  <div className="flex items-center gap-2">
                    {['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorInput(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          colorInput === c ? 'border-stone-900 scale-110' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Filter Tipe Otomatis:</label>
                  <select
                    value={smartCondition}
                    onChange={e => setSmartCondition(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
                  >
                    <option value="URL">Hanya URL / Tautan</option>
                    <option value="CODE">Hanya Potongan Kode</option>
                    <option value="NUMBER">Hanya Angka / Nomor</option>
                    <option value="TEXT">Hanya Teks Biasa</option>
                  </select>
                </div>
              )}

              {activeTab === 3 && (
                <>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Pola Pencocokan:</label>
                    <input
                      type="text"
                      value={rulePattern}
                      onChange={e => setRulePattern(e.target.value)}
                      placeholder="Kata kunci atau ekspresi regex..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleIsRegex}
                      onChange={e => setRuleIsRegex(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-stone-700 font-medium">Gunakan Regular Expression (Regex)</span>
                  </label>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Target Tag:</label>
                    <select
                      value={ruleTargetTagId}
                      onChange={e => setRuleTargetTagId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
                    >
                      {tags.map(t => (
                        <option key={t.id} value={t.id}>#{t.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAdd}
                disabled={!nameInput.trim()}
                className="px-4 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
