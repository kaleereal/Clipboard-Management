import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Shield,
  Download,
  BarChart3,
  Moon,
  Sun,
  LayoutGrid,
  List,
  SortAsc,
  RefreshCw,
  Trash2,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import { AppSettingsState, DisplayMode, SortOrder, ThemeMode } from '../types';

interface SettingsScreenProps {
  settings: AppSettingsState;
  onUpdateSettings: (newSettings: Partial<AppSettingsState>) => void;
  onNavigateTo: (screen: any) => void;
  onNavigateBack: () => void;
  onResetToDefaults: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onNavigateTo,
  onNavigateBack,
  onResetToDefaults,
  onShowToast,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 h-14 flex items-center gap-2">
        <button
          type="button"
          onClick={onNavigateBack}
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-base">Pengaturan</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 flex flex-col gap-4 text-xs">
        {/* Navigation Shortcut Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTo('SECURITY')}
            className="bg-white p-3 rounded-xl border border-stone-200 hover:border-purple-300 shadow-xs flex flex-col items-center gap-1.5 transition text-center"
          >
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-stone-800">Keamanan</span>
            <span className="text-[10px] text-stone-400">PIN & Masking</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTo('BACKUP_RESTORE')}
            className="bg-white p-3 rounded-xl border border-stone-200 hover:border-purple-300 shadow-xs flex flex-col items-center gap-1.5 transition text-center"
          >
            <Download className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-stone-800">Cadangkan</span>
            <span className="text-[10px] text-stone-400">Ekspor/Impor</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTo('ANALYTICS')}
            className="bg-white p-3 rounded-xl border border-stone-200 hover:border-purple-300 shadow-xs flex flex-col items-center gap-1.5 transition text-center"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-stone-800">Statistik</span>
            <span className="text-[10px] text-stone-400">Waktu Hemat</span>
          </button>
        </div>

        {/* Display & Layout Settings */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            Tampilan & Antarmuka
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Tata Letak Daftar Snippet</div>
              <div className="text-stone-500 text-[11px]">Format pratinjau kartu di layar utama</div>
            </div>
            <div className="flex bg-stone-100 p-1 rounded-lg">
              {[
                { key: 'COMPACT' as const, label: 'Kompak' },
                { key: 'DETAILED' as const, label: 'Standar' },
                { key: 'GRID' as const, label: 'Kisi' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onUpdateSettings({ displayMode: opt.key })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    settings.displayMode === opt.key
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Urutan Default</div>
              <div className="text-stone-500 text-[11px]">Metode pengurutan snippet di riwayat</div>
            </div>
            <select
              value={settings.sortOrder || 'NEWEST'}
              onChange={e => onUpdateSettings({ sortOrder: e.target.value as SortOrder })}
              className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800"
            >
              <option value="NEWEST">Terkini (Terbaru)</option>
              <option value="OLDEST">Terlama</option>
              <option value="MOST_USED">Paling Sering Dipakai</option>
              <option value="TEXT_SIZE">Ukuran Teks Terpanjang</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Batas Riwayat Maksimal</div>
              <div className="text-stone-500 text-[11px]">Jumlah item maksimal yang disimpan</div>
            </div>
            <select
              value={settings.maxHistoryItems || settings.maxItems || 500}
              onChange={e => {
                const val = Number(e.target.value);
                onUpdateSettings({ maxHistoryItems: val, maxItems: val });
              }}
              className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800"
            >
              <option value={100}>100 Item</option>
              <option value={500}>500 Item</option>
              <option value={1000}>1000 Item</option>
              <option value={5000}>5000 Item (Tak Terbatas)</option>
            </select>
          </div>
        </div>

        {/* Capture Behavior Settings */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-purple-600" />
            Perilaku Penangkapan Clipboard
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Penangkapan Aktif</div>
              <div className="text-stone-500 text-[11px]">Pantau dan simpan teks salinan ke riwayat</div>
            </div>
            <input
              type="checkbox"
              checked={settings.captureEnabled}
              onChange={e => onUpdateSettings({ captureEnabled: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Pembersihan Sampah Otomatis</div>
              <div className="text-stone-500 text-[11px]">Hapus permanen item sampah setelah periode tertentu</div>
            </div>
            <select
              value={settings.autoCleanTrashDays !== undefined ? settings.autoCleanTrashDays : settings.trashDays}
              onChange={e => {
                const val = Number(e.target.value);
                onUpdateSettings({ autoCleanTrashDays: val, trashDays: val });
              }}
              className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800"
            >
              <option value={7}>7 Hari</option>
              <option value={14}>14 Hari</option>
              <option value={30}>30 Hari</option>
              <option value={0}>Jangan Hapus Otomatis</option>
            </select>
          </div>
        </div>

        {/* Reset Database Section */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" />
            Pengaturan Ulang
          </h3>
          <p className="text-stone-500 text-[11px]">
            Kembalikan seluruh data clipboard, folder, dan tag ke data awal bawaan aplikasi.
          </p>

          <div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Database ke Bawaan
            </button>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-stone-900 text-xs">Clipboard Management Web</div>
            <div className="text-[11px] text-stone-400">
              Versi 1.0.0 · Berdasarkan <span className="font-mono">kaleereal/Clipboard-Management</span>
            </div>
          </div>
          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded font-semibold border border-purple-200">
            React + Vite
          </span>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <h3 className="text-base font-bold text-stone-900 mb-1">Reset Database?</h3>
            <p className="text-stone-500 mb-4">
              Tindakan ini akan mengembalikan seluruh snippet, folder, dan aturan ke contoh awal bawaan.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setShowResetModal(false);
                  onShowToast('Database berhasil direset ke bawaan');
                }}
                className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
