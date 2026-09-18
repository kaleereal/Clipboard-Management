import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  Sliders,
  Bookmark,
  Share2,
  Play,
  Trash2,
  Copy,
  Edit3,
  Pin,
  Clock,
  Sparkles
} from 'lucide-react';
import { ClipItem, FilterPreset, Folder, Tag, ContentType } from '../types';
import { filterClipsBySearch } from '../services/storage';

interface SearchScreenProps {
  clips: ClipItem[];
  folders: Folder[];
  tags: Tag[];
  presets: FilterPreset[];
  initialFolderId?: string | null;
  initialTagId?: string | null;
  onNavigateBack: () => void;
  onEditClip: (clip: ClipItem) => void;
  onCopyClip: (clip: ClipItem) => void;
  onSavePreset: (name: string, query: string, isRegex: boolean, filterJson: string) => void;
  onDeletePreset: (presetId: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  clips,
  folders,
  tags,
  presets,
  initialFolderId,
  initialTagId,
  onNavigateBack,
  onEditClip,
  onCopyClip,
  onSavePreset,
  onDeletePreset,
}) => {
  const [query, setQuery] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [selectedTab, setSelectedTab] = useState<0 | 1 | 2 | 3>(0);

  // Advanced Filters
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId || null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(initialTagId || null);

  // Save preset modal
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  // Canvas ref for Tag Graph visualization
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter clips based on current query and filters
  const searchResults = useMemo(() => {
    return filterClipsBySearch(
      clips,
      query,
      isRegex,
      selectedContentType,
      selectedFolderId,
      selectedTagId
    );
  }, [clips, query, isRegex, selectedContentType, selectedFolderId, selectedTagId]);

  // Tag Graph Canvas Rendering
  useEffect(() => {
    if (selectedTab !== 3) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (tags.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Belum ada tag untuk visualisasi grafik', width / 2, height / 2);
      return;
    }

    // Build co-occurrence matrix between tags
    const coOccurrence: Record<string, Record<string, number>> = {};
    tags.forEach(t1 => {
      coOccurrence[t1.id] = {};
      tags.forEach(t2 => {
        coOccurrence[t1.id][t2.id] = 0;
      });
    });

    clips.forEach(clip => {
      if (clip.isDeleted || !clip.tagIds || clip.tagIds.length < 2) return;
      for (let i = 0; i < clip.tagIds.length; i++) {
        for (let j = i + 1; j < clip.tagIds.length; j++) {
          const t1 = clip.tagIds[i];
          const t2 = clip.tagIds[j];
          if (coOccurrence[t1] && coOccurrence[t1][t2] !== undefined) {
            coOccurrence[t1][t2]++;
            coOccurrence[t2][t1]++;
          }
        }
      }
    });

    // Layout tags in a circle around center
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    const positions: Record<string, { x: number; y: number; tag: Tag }> = {};
    tags.forEach((tag, idx) => {
      const angle = (idx / tags.length) * 2 * Math.PI - Math.PI / 2;
      positions[tag.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        tag,
      };
    });

    // Draw lines between connected tags
    ctx.lineWidth = 2;
    tags.forEach(t1 => {
      tags.forEach(t2 => {
        if (t1.id < t2.id && coOccurrence[t1.id]?.[t2.id] > 0) {
          const p1 = positions[t1.id];
          const p2 = positions[t2.id];
          ctx.beginPath();
          ctx.strokeStyle = '#e2e8f0';
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    });

    // Draw tag nodes
    tags.forEach(tag => {
      const p = positions[tag.id];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22, 0, 2 * Math.PI);
      ctx.fillStyle = tag.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${tag.name}`, p.x, p.y + 32);
    });
  }, [selectedTab, tags, clips]);

  const handleApplyPreset = (preset: FilterPreset) => {
    setQuery(preset.queryText);
    setIsRegex(preset.isRegex);
    try {
      const filter = JSON.parse(preset.filterJson);
      if (filter.contentType) setSelectedContentType(filter.contentType === 'ALL' ? null : filter.contentType);
      if (filter.folderId) setSelectedFolderId(filter.folderId);
      if (filter.tagId) setSelectedTagId(filter.tagId);
    } catch {
      // ignore
    }
    setSelectedTab(0);
  };

  const handleSaveCurrentAsPreset = () => {
    if (!presetNameInput.trim()) return;
    const filterJson = JSON.stringify({
      contentType: selectedContentType || 'ALL',
      folderId: selectedFolderId,
      tagId: selectedTagId,
    });
    onSavePreset(presetNameInput.trim(), query, isRegex, filterJson);
    setShowSavePresetModal(false);
    setPresetNameInput('');
  };

  const resetFilters = () => {
    setSelectedContentType(null);
    setSelectedFolderId(null);
    setSelectedTagId(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Search App Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 h-14 flex items-center gap-2">
        <button
          type="button"
          onClick={onNavigateBack}
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari snippet teks, kode, atau tautan..."
            className="w-full bg-stone-100 border-none rounded-xl pl-9 pr-9 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsRegex(!isRegex)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isRegex
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
          }`}
          title="Mode Regular Expression"
        >
          .* Regex
        </button>
      </header>

      {/* Tabs Row */}
      <div className="max-w-4xl mx-auto px-4 pt-3">
        <div className="grid grid-cols-4 bg-stone-200/60 p-1 rounded-xl mb-4 text-xs font-semibold">
          {[
            { key: 0 as const, label: `Hasil (${searchResults.length})` },
            { key: 1 as const, label: 'Filter Lanjutan' },
            { key: 2 as const, label: `Preset (${presets.length})` },
            { key: 3 as const, label: 'Grafik Tag' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`py-2 rounded-lg transition ${
                selectedTab === tab.key
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 0: Results */}
        {selectedTab === 0 && (
          <div className="flex flex-col gap-2.5">
            {searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-6">
                <Search className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h3 className="font-semibold text-stone-800 text-sm">Tidak ada hasil ditemukan</h3>
                <p className="text-stone-400 text-xs mt-1">Coba kata kunci lain atau ubah filter pencarian.</p>
              </div>
            ) : (
              searchResults.map(clip => (
                <div
                  key={clip.id}
                  className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs hover:border-stone-300 transition cursor-pointer"
                  onClick={() => onEditClip(clip)}
                >
                  <div className="flex items-center justify-between mb-2 text-xs">
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
                    <span className="text-stone-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(clip.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <pre className="font-sans text-xs text-stone-800 whitespace-pre-wrap break-words line-clamp-3 mb-2 leading-relaxed">
                    {clip.content}
                  </pre>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                    <span className="text-[10px] text-stone-400">
                      {clip.sourceApp.replace('com.', '')}
                    </span>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onCopyClip(clip)}
                        className="p-1.5 text-stone-500 hover:text-purple-700 rounded-lg hover:bg-stone-100 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditClip(clip)}
                        className="p-1.5 text-stone-500 hover:text-purple-700 rounded-lg hover:bg-stone-100 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 1: Advanced Filters */}
        {selectedTab === 1 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs text-xs flex flex-col gap-4">
            <h3 className="font-bold text-stone-800 text-sm">Filter Kategori & Konten</h3>

            <div>
              <label className="block font-medium text-stone-700 mb-2">Tipe Konten:</label>
              <div className="flex flex-wrap gap-2">
                {['TEXT', 'URL', 'CODE', 'NUMBER'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setSelectedContentType(selectedContentType === type ? null : type)
                    }
                    className={`px-3 py-1.5 rounded-lg border font-medium transition ${
                      selectedContentType === type
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Folder:</label>
              <select
                value={selectedFolderId || ''}
                onChange={e => setSelectedFolderId(e.target.value || null)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
              >
                <option value="">Semua Folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Tag:</label>
              <select
                value={selectedTagId || ''}
                onChange={e => setSelectedTagId(e.target.value || null)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
              >
                <option value="">Semua Tag</option>
                {tags.map(t => (
                  <option key={t.id} value={t.id}>#{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-stone-700 font-medium"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setShowSavePresetModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm"
              >
                Simpan Sebagai Preset
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Presets */}
        {selectedTab === 2 && (
          <div className="flex flex-col gap-2">
            {presets.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs bg-white rounded-xl border border-stone-200">
                Belum ada preset filter tersimpan.
              </div>
            ) : (
              presets.map(preset => (
                <div
                  key={preset.id}
                  className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-800 text-xs">{preset.name}</div>
                      <div className="text-[11px] text-stone-400">
                        Query: "{preset.queryText || '(Semua)'}" {preset.isRegex && '[Regex]'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Terapkan
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePreset(preset.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Tag Graph Canvas */}
        {selectedTab === 3 && (
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <h3 className="font-bold text-stone-800 text-sm mb-1">Visualisasi Grafik Hubungan Tag</h3>
            <p className="text-xs text-stone-400 mb-3">
              Grafik interaktif yang menampilkan keterkaitan antar-tag yang sering disematkan bersamaan pada snippet.
            </p>
            <div className="w-full h-80 bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>
        )}
      </div>

      {/* Save Preset Dialog */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <h3 className="text-base font-bold text-stone-900 mb-2">Simpan Preset Pencarian</h3>
            <p className="text-stone-500 mb-4">
              Simpan kombinasi kata kunci dan filter saat ini untuk diakses cepat kapan saja.
            </p>

            <div className="mb-4">
              <label className="block font-medium text-stone-700 mb-1">Nama Preset:</label>
              <input
                type="text"
                value={presetNameInput}
                onChange={e => setPresetNameInput(e.target.value)}
                placeholder="Contoh: Kode Frontend Penting"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSavePresetModal(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                disabled={!presetNameInput.trim()}
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
