import React, { useState, useMemo } from 'react';
import {
  Copy,
  Edit3,
  Pin,
  PinOff,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  CheckSquare,
  Square,
  Combine,
  Clock,
  Sparkles,
  ExternalLink,
  Tag as TagIcon,
  Folder as FolderIcon,
  Search,
  Check
} from 'lucide-react';
import { ClipItem, DisplayMode, Folder, SortOrder, Tag, ContentType } from '../types';

interface HomeScreenProps {
  clips: ClipItem[];
  folders: Folder[];
  tags: Tag[];
  captureEnabled: boolean;
  onToggleCapture: () => void;
  incognitoMode: boolean;
  onToggleIncognito: () => void;
  displayMode: DisplayMode;
  sortOrder: SortOrder;
  onCopyClip: (clip: ClipItem) => void;
  onEditClip: (clip: ClipItem) => void;
  onTogglePin: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onRestoreClip: (clipId: string) => void;
  onPermanentDeleteClip: (clipId: string) => void;
  onEmptyTrash: () => void;
  onMergeClips: (clipIds: string[], separator: string) => void;
  onBatchDelete: (clipIds: string[]) => void;
  onNewSnippet: () => void;
  onSimulateCapture: (content: string, sourceApp?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  clips,
  folders,
  tags,
  captureEnabled,
  onToggleCapture,
  incognitoMode,
  onToggleIncognito,
  displayMode,
  sortOrder,
  onCopyClip,
  onEditClip,
  onTogglePin,
  onDeleteClip,
  onRestoreClip,
  onPermanentDeleteClip,
  onEmptyTrash,
  onMergeClips,
  onBatchDelete,
  onNewSnippet,
  onSimulateCapture,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PINNED' | 'FREQUENT' | 'TRASH'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ContentType>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickInput, setQuickInput] = useState('');
  const [revealedSensitiveIds, setRevealedSensitiveIds] = useState<Set<string>>(new Set());

  // Merge modal state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSeparator, setMergeSeparator] = useState('\n');
  const [customSeparator, setCustomSeparator] = useState('');

  // Delete permanently confirmation modal
  const [permDeleteId, setPermDeleteId] = useState<string | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);

  // Filter clips based on active tab and type filter
  const filteredClips = useMemo(() => {
    let list: ClipItem[] = [];

    if (activeTab === 'TRASH') {
      list = clips.filter(c => c.isDeleted);
    } else {
      const activeClips = clips.filter(c => !c.isDeleted);
      if (activeTab === 'ALL') {
        list = activeClips;
      } else if (activeTab === 'PINNED') {
        list = activeClips.filter(c => c.isPinned);
      } else if (activeTab === 'FREQUENT') {
        list = [...activeClips].sort((a, b) => b.useCount - a.useCount).filter(c => c.useCount > 0);
      }
    }

    if (typeFilter !== 'ALL') {
      list = list.filter(c => c.contentType === typeFilter);
    }

    // Apply sorting (except FREQUENT tab which ranks by usage)
    if (activeTab !== 'FREQUENT') {
      list = [...list].sort((a, b) => {
        // Pinned items stay on top in ALL tab
        if (activeTab === 'ALL' && a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        switch (sortOrder) {
          case 'NEWEST':
            return b.createdAt - a.createdAt;
          case 'OLDEST':
            return a.createdAt - b.createdAt;
          case 'MOST_USED':
            return b.useCount - a.useCount;
          case 'TEXT_SIZE':
            return b.charCount - a.charCount;
          default:
            return b.createdAt - a.createdAt;
        }
      });
    }

    return list;
  }, [clips, activeTab, typeFilter, sortOrder]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredClips.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClips.map(c => c.id)));
    }
  };

  const toggleSensitiveReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(revealedSensitiveIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setRevealedSensitiveIds(next);
  };

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSimulateCapture(quickInput.trim(), 'Web App');
    setQuickInput('');
  };

  const handleReadClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onSimulateCapture(text, 'Browser Clipboard');
      }
    } catch {
      // Fallback if browser permission is blocked in iframe
      const sample = prompt('Masukkan teks untuk disimpan ke clipboard:');
      if (sample) {
        onSimulateCapture(sample, 'User Input');
      }
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Baru saja';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m yang lalu`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}j yang lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}h yang lalu`;
  };

  const folderMap = useMemo(() => new Map(folders.map(f => [f.id, f])), [folders]);
  const tagMap = useMemo(() => new Map(tags.map(t => [t.id, t])), [tags]);

  return (
    <div className="pb-28">
      {/* Banners */}
      {!captureEnabled && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <span>⚠️ Penangkapan dijeda. Teks yang baru disalin tidak akan disimpan otomatis.</span>
          <button
            type="button"
            onClick={onToggleCapture}
            className="font-bold text-amber-700 hover:text-amber-900 underline ml-2"
          >
            Lanjutkan
          </button>
        </div>
      )}

      {incognitoMode && (
        <div className="bg-stone-800 text-stone-200 px-4 py-2 flex items-center justify-between text-xs">
          <span>🕶️ Mode Incognito aktif. Salinan baru tidak dicatat ke riwayat.</span>
          <button
            type="button"
            onClick={onToggleIncognito}
            className="text-purple-300 hover:text-purple-100 underline ml-2 font-medium"
          >
            Nonaktifkan
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-4">
        {/* Quick Add / Capture bar */}
        <form onSubmit={handleQuickCapture} className="mb-4 flex gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            placeholder="Ketik atau tempel teks cepat di sini..."
            className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition shadow-sm shrink-0"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={handleReadClipboard}
            title="Baca dari Clipboard perangkat"
            className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl font-medium text-sm transition shrink-0 flex items-center gap-1.5"
          >
            <Copy className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Tangkap OS</span>
          </button>
        </form>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 mb-3 overflow-x-auto scrollbar-none">
          {[
            { key: 'ALL' as const, label: 'Semua' },
            { key: 'PINNED' as const, label: 'Disematkan' },
            { key: 'FREQUENT' as const, label: 'Sering Dipakai' },
            { key: 'TRASH' as const, label: 'Sampah' },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedIds(new Set());
                }}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub filter chips: Content Types (TEXT, URL, CODE, NUMBER) */}
        {activeTab !== 'TRASH' && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-400 font-medium whitespace-nowrap">Filter:</span>
            {[
              { key: 'ALL' as const, label: 'Semua tipe' },
              { key: 'TEXT' as const, label: 'Teks' },
              { key: 'URL' as const, label: 'URL' },
              { key: 'CODE' as const, label: 'Kode' },
              { key: 'NUMBER' as const, label: 'Angka' },
            ].map(typeChip => {
              const selected = typeFilter === typeChip.key;
              return (
                <button
                  key={typeChip.key}
                  type="button"
                  onClick={() => setTypeFilter(typeChip.key)}
                  className={`px-3 py-1 rounded-full border transition whitespace-nowrap font-medium ${
                    selected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {typeChip.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Multi-Selection Contextual Action Bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-purple-900 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 font-semibold text-purple-800 hover:text-purple-950"
              >
                {selectedIds.size === filteredClips.length ? (
                  <CheckSquare className="w-4 h-4 text-purple-700" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400" />
                )}
                {selectedIds.size} dipilih
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== 'TRASH' && selectedIds.size >= 2 && (
                <button
                  type="button"
                  onClick={() => setShowMergeModal(true)}
                  className="px-2.5 py-1 bg-white hover:bg-purple-100 border border-purple-300 text-purple-700 rounded-lg font-medium flex items-center gap-1 transition"
                >
                  <Combine className="w-3.5 h-3.5" />
                  Gabungkan
                </button>
              )}

              {activeTab === 'TRASH' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      selectedIds.forEach(id => onRestoreClip(id));
                      setSelectedIds(new Set());
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-purple-100 border border-purple-300 text-purple-700 rounded-lg font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Pulihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      selectedIds.forEach(id => onPermanentDeleteClip(id));
                      setSelectedIds(new Set());
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Permanen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onBatchDelete(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus ke Sampah
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-stone-500 hover:text-stone-700 ml-1 text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Trash Actions Header */}
        {activeTab === 'TRASH' && filteredClips.length > 0 && selectedIds.size === 0 && (
          <div className="mb-4 flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Item di Sampah disimpan sebelum dihapus otomatis.</span>
            <button
              type="button"
              onClick={() => setShowEmptyTrashModal(true)}
              className="font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Sampah
            </button>
          </div>
        )}

        {/* Clips List */}
        {filteredClips.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 shadow-sm mt-2">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-800 text-base mb-1">
              {activeTab === 'ALL' && 'Belum ada riwayat'}
              {activeTab === 'PINNED' && 'Belum ada item disematkan'}
              {activeTab === 'FREQUENT' && 'Belum ada data pemakaian'}
              {activeTab === 'TRASH' && 'Sampah kosong'}
            </h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              {activeTab === 'ALL' && 'Salin teks dari aplikasi lain, gunakan kotak di atas, atau klik tombol + untuk membuat snippet.'}
              {activeTab === 'PINNED' && 'Sematkan item penting dengan ikon jarum agar tidak terhapus otomatis.'}
              {activeTab === 'FREQUENT' && 'Item yang sering disalin atau dipakai akan otomatis diurutkan di sini.'}
              {activeTab === 'TRASH' && 'Item yang Anda hapus sementara akan ditampung di sini.'}
            </p>
          </div>
        ) : (
          <div
            className={
              displayMode === 'GRID'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
                : 'flex flex-col gap-2.5'
            }
          >
            {filteredClips.map(clip => {
              const isSelected = selectedIds.has(clip.id);
              const isMasked = clip.isSensitive && !revealedSensitiveIds.has(clip.id);
              const folder = clip.folderId ? folderMap.get(clip.folderId) : undefined;
              const clipTags = (clip.tagIds || [])
                .map(tid => tagMap.get(tid))
                .filter(Boolean) as Tag[];

              return (
                <div
                  key={clip.id}
                  onClick={() => toggleSelect(clip.id)}
                  className={`relative group bg-white rounded-xl border transition cursor-pointer select-none p-3.5 shadow-xs ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50/30'
                      : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                  }`}
                >
                  {/* Card Header: Type Badge, Folder, Sensitive, Time */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(clip.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 rounded border-stone-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
                          clip.contentType === 'URL'
                            ? 'bg-blue-100 text-blue-800'
                            : clip.contentType === 'CODE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : clip.contentType === 'NUMBER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {clip.contentType}
                      </span>

                      {folder && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                          <FolderIcon className="w-2.5 h-2.5" />
                          {folder.name}
                        </span>
                      )}

                      {clip.isSensitive && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-medium">
                          Sensitif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(clip.createdAt)}</span>
                      {clip.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-purple-600 fill-purple-600 ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Card Body: Content Preview */}
                  <div className="relative mb-2.5">
                    {isMasked ? (
                      <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-500 text-xs font-mono">
                        <span>••••••••••••••••••••</span>
                        <button
                          type="button"
                          onClick={e => toggleSensitiveReveal(clip.id, e)}
                          className="text-stone-500 hover:text-stone-800 p-1"
                          title="Lihat teks sensitif"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <pre
                          className={`font-sans text-stone-800 whitespace-pre-wrap break-words leading-relaxed ${
                            displayMode === 'COMPACT'
                              ? 'text-xs line-clamp-2'
                              : displayMode === 'GRID'
                              ? 'text-xs line-clamp-4'
                              : 'text-sm line-clamp-6'
                          }`}
                        >
                          {clip.content}
                        </pre>
                        {clip.isSensitive && (
                          <button
                            type="button"
                            onClick={e => toggleSensitiveReveal(clip.id, e)}
                            className="absolute top-0 right-0 text-stone-400 hover:text-stone-700 bg-white/80 p-0.5 rounded"
                            title="Sembunyikan teks sensitif"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Tags & Quick Action Toolbar */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[60%]">
                      {clipTags.map(tag => (
                        <span
                          key={tag.id}
                          style={{ borderColor: tag.color, color: tag.color }}
                          className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border bg-white whitespace-nowrap font-medium"
                        >
                          <TagIcon className="w-2 h-2" />
                          {tag.name}
                        </span>
                      ))}
                      {clip.useCount > 0 && (
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                          {clip.useCount}x salin
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      {activeTab === 'TRASH' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onRestoreClip(clip.id)}
                            title="Pulihkan"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-purple-700 hover:bg-purple-50 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPermDeleteId(clip.id)}
                            title="Hapus Permanen"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onCopyClip(clip)}
                            title="Salin teks"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-purple-700 hover:bg-purple-50 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditClip(clip)}
                            title="Edit snippet"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-purple-700 hover:bg-purple-50 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onTogglePin(clip.id)}
                            title={clip.isPinned ? "Lepas sematan" : "Sematkan"}
                            className={`p-1.5 rounded-lg transition ${
                              clip.isPinned
                                ? 'text-purple-600 hover:bg-purple-50'
                                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {clip.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClip(clip.id)}
                            title="Pindahkan ke Sampah"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={onNewSnippet}
        className="fixed right-6 bottom-20 z-40 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        title="Buat Snippet Baru"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">Gabungkan Item Terpilih</h3>
            <p className="text-xs text-stone-500 mb-4">
              Pilih karakter pemisah untuk menggabungkan {selectedIds.size} item teks:
            </p>

            <div className="flex flex-col gap-2 mb-4 text-xs">
              {[
                { label: 'Baris baru (\\n)', val: '\n' },
                { label: 'Spasi (" ")', val: ' ' },
                { label: 'Koma (", ")', val: ', ' },
                { label: 'Kustom', val: 'CUSTOM' },
              ].map(opt => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    mergeSeparator === opt.val
                      ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-medium'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="separator"
                    checked={mergeSeparator === opt.val}
                    onChange={() => setMergeSeparator(opt.val)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}

              {mergeSeparator === 'CUSTOM' && (
                <input
                  type="text"
                  value={customSeparator}
                  onChange={e => setCustomSeparator(e.target.value)}
                  placeholder="Masukkan pemisah kustom..."
                  className="mt-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const sep = mergeSeparator === 'CUSTOM' ? customSeparator : mergeSeparator;
                  onMergeClips(Array.from(selectedIds), sep);
                  setShowMergeModal(false);
                  setSelectedIds(new Set());
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
              >
                Gabungkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {permDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-1">Hapus Permanen?</h3>
            <p className="text-xs text-stone-500 mb-4">Item ini tidak dapat dikembalikan lagi setelah dihapus.</p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPermDeleteId(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentDeleteClip(permDeleteId);
                  setPermDeleteId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Trash Modal */}
      {showEmptyTrashModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-1">Kosongkan Sampah?</h3>
            <p className="text-xs text-stone-500 mb-4">Semua item di Sampah akan dihapus secara permanen.</p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmptyTrashModal(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onEmptyTrash();
                  setShowEmptyTrashModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
