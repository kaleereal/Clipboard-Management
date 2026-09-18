import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Copy,
  Share2,
  GitCompare,
  Split,
  History,
  Code,
  Tag as TagIcon,
  Folder as FolderIcon,
  Pin,
  Lock,
  EyeOff,
  Flame,
  Check,
  Undo2,
  Redo2,
  Sparkles
} from 'lucide-react';
import { ClipItem, ClipVersion, Folder, Tag, ContentType } from '../types';
import { calculateTextStats, substituteVariables } from '../services/textTools';

interface EditorScreenProps {
  clip?: ClipItem | null;
  versions: ClipVersion[];
  folders: Folder[];
  tags: Tag[];
  onSave: (clipData: {
    id?: string;
    content: string;
    contentType: ContentType;
    folderId: string | null;
    tagIds: string[];
    isPinned: boolean;
    isLocked: boolean;
    isSensitive: boolean;
    isSelfDestruct: boolean;
  }) => void;
  onNavigateBack: () => void;
  onRestoreVersion: (version: ClipVersion) => void;
  onSplitSnippet: (content: string, delimiter: string) => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  clip,
  versions,
  folders,
  tags,
  onSave,
  onNavigateBack,
  onRestoreVersion,
  onSplitSnippet,
}) => {
  const [content, setContent] = useState(clip ? clip.content : '');
  const [initialContent] = useState(clip ? clip.content : '');
  const [contentType, setContentType] = useState<ContentType>(clip ? clip.contentType : 'TEXT');
  const [folderId, setFolderId] = useState<string | null>(clip?.folderId || null);
  const [tagIds, setTagIds] = useState<string[]>(clip?.tagIds || []);
  const [isPinned, setIsPinned] = useState(clip?.isPinned || false);
  const [isLocked, setIsLocked] = useState(clip?.isLocked || false);
  const [isSensitive, setIsSensitive] = useState(clip?.isSensitive || false);
  const [isSelfDestruct, setIsSelfDestruct] = useState(clip?.isSelfDestruct || false);

  // Undo / Redo history stack
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Dialog states
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [splitDelimiter, setSplitDelimiter] = useState('\n');
  const [customSplitDelim, setCustomSplitDelim] = useState('');

  // Markdown preview mode
  const [showPreview, setShowPreview] = useState(false);

  const stats = useMemo(() => calculateTextStats(content), [content]);
  const isDirty = content !== initialContent ||
    (clip && (
      folderId !== clip.folderId ||
      isPinned !== clip.isPinned ||
      isSensitive !== clip.isSensitive ||
      contentType !== clip.contentType
    ));

  const handleContentChange = (val: string) => {
    setUndoStack(prev => [...prev, content]);
    setRedoStack([]);
    setContent(val);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, content]);
    setContent(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, content]);
    setContent(next);
  };

  const handleInsertVariable = (token: string) => {
    setContent(prev => prev + token);
    setShowVariableDropdown(false);
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert('Isi snippet tidak boleh kosong');
      return;
    }
    onSave({
      id: clip?.id,
      content,
      contentType,
      folderId,
      tagIds,
      isPinned,
      isLocked,
      isSensitive,
      isSelfDestruct,
    });
  };

  const handleCopyProcessed = () => {
    const substituted = substituteVariables(content);
    navigator.clipboard.writeText(substituted);
    alert('Teks dengan variabel disalin ke clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bagikan Snippet',
          text: content,
        });
      } catch {
        // canceled
      }
    } else {
      navigator.clipboard.writeText(content);
      alert('Teks disalin ke clipboard');
    }
  };

  const toggleTag = (tid: string) => {
    if (tagIds.includes(tid)) {
      setTagIds(tagIds.filter(id => id !== tid));
    } else {
      setTagIds([...tagIds, tid]);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateBack}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-800 text-base">
            {clip ? 'Edit Snippet' : 'Snippet Baru'}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30"
            title="Urungkan"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30"
            title="Ulangi"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim()}
            className="ml-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            Simpan
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4 flex flex-col gap-4">
        {/* Toolbar: Format selector & Variable dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-stone-400 font-medium px-1">Format:</span>
            {(['TEXT', 'URL', 'CODE', 'NUMBER'] as ContentType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  contentType === type
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVariableDropdown(!showVariableDropdown)}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium flex items-center gap-1 border border-stone-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Variabel Token ▾
            </button>

            {showVariableDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-stone-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase">Sisipkan Token</div>
                {[
                  { token: '{date}', label: 'Tanggal sekarang' },
                  { token: '{time}', label: 'Waktu sekarang' },
                  { token: '{datetime}', label: 'Tanggal & Waktu' },
                  { token: '{clipboard}', label: 'Isi Clipboard OS' },
                ].map(item => (
                  <button
                    key={item.token}
                    type="button"
                    onClick={() => handleInsertVariable(item.token)}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span className="font-mono text-purple-700">{item.token}</span>
                    <span className="text-[10px] text-stone-400">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Main Text Area */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col">
          <textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder="Tulis atau tempel teks di sini…"
            rows={12}
            className="w-full p-4 font-mono text-sm text-stone-800 placeholder-stone-400 focus:outline-none resize-y leading-relaxed"
          />

          {/* Real-time stats bar */}
          <div className="bg-stone-50 border-t border-stone-200 px-4 py-2 flex items-center justify-between text-xs text-stone-500">
            <span>
              {stats.charCount} karakter · {stats.wordCount} kata · {stats.lineCount} baris
            </span>
            {clip && (
              <span className="text-[11px] text-stone-400">
                Dipakai {clip.useCount}x
              </span>
            )}
          </div>
        </div>

        {/* Metadata & Organization Controls */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-stone-800 text-sm">Pengorganisasian & Atribut</h3>

          {/* Folder selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <span className="font-medium text-stone-700 flex items-center gap-1.5">
              <FolderIcon className="w-4 h-4 text-stone-500" />
              Folder:
            </span>
            <select
              value={folderId || ''}
              onChange={e => setFolderId(e.target.value || null)}
              className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">(Tanpa Folder)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Tags selection */}
          <div className="border-b border-stone-100 pb-3">
            <span className="font-medium text-stone-700 flex items-center gap-1.5 mb-2">
              <TagIcon className="w-4 h-4 text-stone-500" />
              Tag Terkait:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => {
                const checked = tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    style={{
                      borderColor: t.color,
                      backgroundColor: checked ? t.color : 'transparent',
                      color: checked ? '#ffffff' : t.color,
                    }}
                    className="px-2.5 py-1 rounded-full border text-xs font-medium transition"
                  >
                    {checked ? '✓ ' : '+ '}{t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flags: Pin, Lock, Sensitive, Self-Destruct */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition ${
                isPinned ? 'bg-purple-50 border-purple-500 text-purple-800' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Pin className="w-4 h-4" />
              <span>Sematkan</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition ${
                isLocked ? 'bg-amber-50 border-amber-500 text-amber-800' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Kunci</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSensitive(!isSensitive)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition ${
                isSensitive ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>Sensitif</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSelfDestruct(!isSelfDestruct)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition ${
                isSelfDestruct ? 'bg-orange-50 border-orange-500 text-orange-800' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Self-Destruct</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions: Copy Substituted, Share, Split, Diff, Version History */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200 shadow-xs text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyProcessed}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-1.5 transition"
              title="Salin dengan substitusi variabel"
            >
              <Copy className="w-3.5 h-3.5" />
              Salin Teks
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan
            </button>

            <button
              type="button"
              onClick={() => setShowSplitModal(true)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-1.5 transition"
            >
              <Split className="w-3.5 h-3.5" />
              Bagi (Split)
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {clip && (
              <button
                type="button"
                onClick={() => setShowDiffModal(true)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-1.5 transition"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Bandingkan (Diff)
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowVersionModal(true)}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              <History className="w-3.5 h-3.5" />
              Riwayat Versi ({versions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Split Dialog Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">Bagi Snippet</h3>
            <p className="text-xs text-stone-500 mb-4">
              Pilih pemisah untuk memecah teks ini menjadi beberapa snippet baru:
            </p>

            <div className="flex flex-col gap-2 mb-4 text-xs">
              {[
                { label: 'Baris Baru (\\n)', val: '\n' },
                { label: 'Koma (,)', val: ',' },
                { label: 'Baris Kosong (\\n\\n)', val: '\n\n' },
                { label: 'Pemisah Kustom', val: 'CUSTOM' },
              ].map(opt => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    splitDelimiter === opt.val
                      ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-medium'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="splitDelim"
                    checked={splitDelimiter === opt.val}
                    onChange={() => setSplitDelimiter(opt.val)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}

              {splitDelimiter === 'CUSTOM' && (
                <input
                  type="text"
                  value={customSplitDelim}
                  onChange={e => setCustomSplitDelim(e.target.value)}
                  placeholder="Karakter pemisah..."
                  className="mt-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSplitModal(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const sep = splitDelimiter === 'CUSTOM' ? customSplitDelim : splitDelimiter;
                  onSplitSnippet(content, sep);
                  setShowSplitModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
              >
                Bagi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-base font-bold text-stone-900 mb-1">Riwayat Versi Snippet</h3>
            <p className="text-xs text-stone-500 mb-4">
              Pilih versi sebelumnya untuk memulihkan isi teks:
            </p>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 mb-4 pr-1">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Belum ada riwayat perubahan tersimpan untuk snippet ini.
                </div>
              ) : (
                versions.map(v => (
                  <div key={v.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-stone-800">Versi {v.versionNumber}</div>
                      <div className="text-stone-400 text-[11px]">
                        {new Date(v.createdAt).toLocaleString('id-ID')}
                      </div>
                      <div className="text-stone-600 font-mono text-[11px] line-clamp-1 mt-0.5">
                        {v.content}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setContent(v.content);
                        onRestoreVersion(v);
                        setShowVersionModal(false);
                      }}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs shrink-0"
                    >
                      Pulihkan
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <h3 className="text-base font-bold text-stone-900 mb-1">Bandingkan Perubahan</h3>
            <p className="text-xs text-stone-500 mb-4">
              Perbandingan teks asli dan teks yang sedang diedit:
            </p>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 mb-4 p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono">
              <div>
                <div className="font-bold text-stone-500 mb-1 text-[11px]">SEBELUM:</div>
                <pre className="whitespace-pre-wrap break-words text-stone-700">{initialContent}</pre>
              </div>
              <div>
                <div className="font-bold text-purple-600 mb-1 text-[11px]">SESUDAH:</div>
                <pre className="whitespace-pre-wrap break-words text-stone-900">{content}</pre>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
