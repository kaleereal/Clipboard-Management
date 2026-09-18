import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  ClipboardPaste,
  Copy,
  PlusCircle,
  RefreshCw,
  Layers,
  FileText,
  Code,
  Type,
  ListFilter,
  Check,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { ClipItem } from '../types';
import {
  cleanText,
  convertCase,
  formatCode,
  extractData,
  generateLorem,
  ExtractedData
} from '../services/textTools';

interface TextToolsScreenProps {
  clips: ClipItem[];
  onSaveAsSnippet: (content: string) => void;
  onShowToast: (text: string) => void;
}

export const TextToolsScreen: React.FC<TextToolsScreenProps> = ({
  clips,
  onSaveAsSnippet,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  // Clean tab options
  const [removeExcessLines, setRemoveExcessLines] = useState(true);
  const [trimSpaces, setTrimSpaces] = useState(true);
  const [removeTabs, setRemoveTabs] = useState(true);
  const [removeDoubleSpaces, setRemoveDoubleSpaces] = useState(true);

  // Extract results
  const [extracted, setExtracted] = useState<ExtractedData>({
    phoneNumbers: [],
    emails: [],
    urls: [],
    ipAddresses: [],
  });

  // Stacking & Queue
  const [queueItems, setQueueItems] = useState<string[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [stackSeparator, setStackSeparator] = useState('\n');

  // Lorem
  const [loremType, setLoremType] = useState<'PARAGRAPHS' | 'SENTENCES' | 'WORDS'>('PARAGRAPHS');
  const [loremCount, setLoremCount] = useState(3);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        onShowToast('Teks ditempel dari clipboard');
      }
    } catch {
      onShowToast('Gagal membaca clipboard langsung. Silakan tempel manual.');
    }
  };

  const handleSelectFromHistory = (clipContent: string) => {
    setInput(clipContent);
  };

  // Run Clean
  const runClean = () => {
    const res = cleanText(input, {
      removeExcessLines,
      trimSpaces,
      removeTabs,
      removeDoubleSpaces,
    });
    setResult(res);
  };

  // Run Case
  const runCase = (caseType: string) => {
    const res = convertCase(input, caseType);
    setResult(res);
  };

  // Run Code Format
  const runCodeFormat = (format: string, mode: 'PRETTIFY' | 'MINIFY') => {
    const res = formatCode(input, format, mode);
    setResult(res);
  };

  // Run Extract
  const runExtract = () => {
    const data = extractData(input);
    setExtracted(data);
    const summary = [
      ...data.urls.map(u => `[URL] ${u}`),
      ...data.emails.map(e => `[EMAIL] ${e}`),
      ...data.phoneNumbers.map(p => `[TELP] ${p}`),
      ...data.ipAddresses.map(ip => `[IP] ${ip}`),
    ].join('\n');
    setResult(summary || 'Tidak ada entitas terdeteksi (URL, Email, Nomor Telepon, atau IP).');
  };

  // Run Lorem
  const runGenerateLorem = () => {
    const res = generateLorem(loremType, loremCount);
    setResult(res);
  };

  // Queue actions
  const handleAddToQueue = (text: string) => {
    if (!text.trim()) return;
    setQueueItems(prev => [...prev, text.trim()]);
    onShowToast('Item ditambahkan ke antrean');
  };

  const handleCopyNextQueue = () => {
    if (queueItems.length === 0) return;
    const item = queueItems[currentQueueIndex];
    navigator.clipboard.writeText(item);
    onShowToast(`Disalin: Item ${currentQueueIndex + 1} dari ${queueItems.length}`);
    setCurrentQueueIndex((currentQueueIndex + 1) % queueItems.length);
  };

  const handleStackAll = () => {
    const joined = queueItems.join(stackSeparator);
    setResult(joined);
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    onShowToast('Hasil disalin ke clipboard');
  };

  const handleReplaceInput = () => {
    if (!result) return;
    setInput(result);
    setResult('');
    onShowToast('Input diganti dengan teks hasil');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-28">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">Alat Pemrosesan Teks</h1>
        <p className="text-xs text-stone-500">Sanitasi, format kode, ubah huruf, ekstrak data, dan antrean sekuensial</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-200/60 p-1 rounded-xl mb-4 text-xs font-semibold overflow-x-auto">
        {[
          { key: 0 as const, label: 'Bersihkan' },
          { key: 1 as const, label: 'Huruf (Case)' },
          { key: 2 as const, label: 'Format Kode' },
          { key: 3 as const, label: 'Ekstrak Data' },
          { key: 4 as const, label: 'Tumpuk & Antrean' },
          { key: 5 as const, label: 'Lorem Ipsum' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      {activeTab !== 5 && (
        <div className="bg-white rounded-xl border border-stone-200 p-3.5 mb-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-700">Teks Masukan:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-xs font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <ClipboardPaste className="w-3.5 h-3.5" /> Tempel dari Clipboard
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Masukkan atau tempel teks yang ingin diproses di sini..."
            rows={4}
            className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
          />

          {/* Quick history picker pills */}
          {clips.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto text-[11px] text-stone-500">
              <span className="shrink-0">Pilih riwayat:</span>
              {clips.filter(c => !c.isDeleted).slice(0, 4).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectFromHistory(c.content)}
                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 truncate max-w-[120px]"
                >
                  {c.content.slice(0, 20)}...
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tool Actions Panel */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4 shadow-xs text-xs">
        {/* Tab 0: Clean */}
        {activeTab === 0 && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeExcessLines}
                  onChange={e => setRemoveExcessLines(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Hapus baris kosong berlebih (&gt;2 baris)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trimSpaces}
                  onChange={e => setTrimSpaces(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Pangkas spasi di awal & akhir baris</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeTabs}
                  onChange={e => setRemoveTabs(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Ganti tab karakter dengan 4 spasi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeDoubleSpaces}
                  onChange={e => setRemoveDoubleSpaces(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Hapus spasi ganda berturutan</span>
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={runClean}
                disabled={!input}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-semibold transition"
              >
                Bersihkan Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Case Converter */}
        {activeTab === 1 && (
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'camelCase', label: 'camelCase' },
              { id: 'snake_case', label: 'snake_case' },
              { id: 'kebab-case', label: 'kebab-case' },
              { id: 'uppercase', label: 'HURUF BESAR' },
              { id: 'lowercase', label: 'huruf kecil' },
              { id: 'title case', label: 'Huruf Judul (Title Case)' },
            ].map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => runCase(c.id)}
                disabled={!input}
                className="px-3 py-2 bg-stone-100 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 text-stone-700 font-semibold rounded-xl border border-stone-200 transition"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Code Format */}
        {activeTab === 2 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runCodeFormat('JSON', 'PRETTIFY')}
              disabled={!input}
              className="px-3 py-2 bg-stone-100 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 text-stone-700 font-semibold rounded-xl border border-stone-200 transition"
            >
              Prettify JSON
            </button>
            <button
              type="button"
              onClick={() => runCodeFormat('JSON', 'MINIFY')}
              disabled={!input}
              className="px-3 py-2 bg-stone-100 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 text-stone-700 font-semibold rounded-xl border border-stone-200 transition"
            >
              Minify JSON
            </button>
            <button
              type="button"
              onClick={() => runCodeFormat('HTML', 'PRETTIFY')}
              disabled={!input}
              className="px-3 py-2 bg-stone-100 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 text-stone-700 font-semibold rounded-xl border border-stone-200 transition"
            >
              Format XML / HTML
            </button>
          </div>
        )}

        {/* Tab 3: Extract */}
        {activeTab === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-stone-500">
              Pindai teks masukan untuk mengekstrak entitas nomor telepon, email, alamat URL, dan IP secara otomatis:
            </p>
            <div>
              <button
                type="button"
                onClick={runExtract}
                disabled={!input}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-semibold transition"
              >
                Ekstrak Entitas
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Stacking & Sequential Pasting Queue */}
        {activeTab === 4 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-800 text-xs">Antrean Tempel Sekuensial (Sequential Pasting Queue)</h4>
                <p className="text-stone-400 text-[11px]">
                  Simpan beberapa potongan teks dan salin satu per satu secara berurutan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddToQueue(input)}
                disabled={!input}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs"
              >
                + Masukkan Input ke Antrean
              </button>
            </div>

            {queueItems.length > 0 ? (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                  <span>Antrean ({queueItems.length} item):</span>
                  <span>Posisi Berikutnya: #{currentQueueIndex + 1}</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {queueItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between ${
                        idx === currentQueueIndex
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                          : 'bg-white text-stone-700 border border-stone-200'
                      }`}
                    >
                      <span className="truncate max-w-[280px]">
                        {idx + 1}. {item}
                      </span>
                      {idx === currentQueueIndex && (
                        <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded">
                          Aktif
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={handleCopyNextQueue}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Salin Item Berikutnya ({currentQueueIndex + 1}/{queueItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleStackAll}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-medium"
                  >
                    Tumpuk Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQueueItems([]);
                      setCurrentQueueIndex(0);
                    }}
                    className="px-3 py-2 text-stone-500 hover:text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-stone-400 text-center py-4 bg-stone-50 rounded-xl border border-stone-200">
                Antrean kosong. Masukkan teks dan klik "+ Masukkan Input ke Antrean" di atas.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Lorem Ipsum */}
        {activeTab === 5 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-700">Tipe:</span>
                <select
                  value={loremType}
                  onChange={e => setLoremType(e.target.value as any)}
                  className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800"
                >
                  <option value="PARAGRAPHS">Paragraf</option>
                  <option value="SENTENCES">Kalimat</option>
                  <option value="WORDS">Kata</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-700">Jumlah:</span>
                <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                  <button
                    type="button"
                    onClick={() => setLoremCount(Math.max(1, loremCount - 1))}
                    className="p-1.5 text-stone-500 hover:text-stone-900"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-semibold text-stone-800">{loremCount}</span>
                  <button
                    type="button"
                    onClick={() => setLoremCount(loremCount + 1)}
                    className="p-1.5 text-stone-500 hover:text-stone-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={runGenerateLorem}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
              >
                Hasilkan Lorem Ipsum
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Output Box */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-stone-800">Hasil Pemrosesan:</span>
        </div>

        <textarea
          value={result}
          readOnly
          rows={5}
          placeholder="Hasil akan muncul di sini setelah memilih salah satu tindakan di atas..."
          className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:outline-none font-mono resize-y"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyResult}
              disabled={!result}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Salin Hasil
            </button>
            <button
              type="button"
              onClick={() => onSaveAsSnippet(result)}
              disabled={!result}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 rounded-xl font-medium flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simpan sebagai Snippet
            </button>
          </div>

          <button
            type="button"
            onClick={handleReplaceInput}
            disabled={!result}
            className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Ganti Input
          </button>
        </div>
      </div>
    </div>
  );
};
