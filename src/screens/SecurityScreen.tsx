import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Lock,
  Fingerprint,
  EyeOff,
  Eye,
  KeyRound,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AppSettingsState } from '../types';

interface SecurityScreenProps {
  settings: AppSettingsState;
  onUpdateSettings: (newSettings: Partial<AppSettingsState>) => void;
  onNavigateBack: () => void;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({
  settings,
  onUpdateSettings,
  onNavigateBack,
}) => {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const [newBlacklistApp, setNewBlacklistApp] = useState('');

  const handleOpenPinSetup = () => {
    setPinInput('');
    setPinConfirm('');
    setPinError('');
    setShowPinDialog(true);
  };

  const handleSavePin = () => {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('PIN harus berupa 4 digit angka.');
      return;
    }
    if (pinInput !== pinConfirm) {
      setPinError('Konfirmasi PIN tidak cocok.');
      return;
    }

    onUpdateSettings({
      appPin: pinInput,
      appLockEnabled: true,
    });
    setShowPinDialog(false);
  };

  const handleToggleLock = (enabled: boolean) => {
    if (enabled && !settings.appPin) {
      handleOpenPinSetup();
    } else {
      onUpdateSettings({ appLockEnabled: enabled });
    }
  };

  const handleAddBlacklistApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistApp.trim()) return;
    const pkg = newBlacklistApp.trim().toLowerCase();
    if (!settings.appBlacklist.includes(pkg)) {
      onUpdateSettings({
        appBlacklist: [...settings.appBlacklist, pkg],
      });
    }
    setNewBlacklistApp('');
  };

  const handleRemoveBlacklistApp = (pkg: string) => {
    onUpdateSettings({
      appBlacklist: settings.appBlacklist.filter(p => p !== pkg),
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 h-14 flex items-center gap-2">
        <button
          type="button"
          onClick={onNavigateBack}
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-base">Keamanan & Privasi</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 flex flex-col gap-4 text-xs">
        {/* Security Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1">Enkripsi</div>
            <div className="font-bold text-emerald-700 flex items-center gap-1 text-sm">
              <CheckCircle2 className="w-4 h-4" /> AES-256
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Data lokal terproteksi</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1">Kunci Aplikasi</div>
            <div className={`font-bold text-sm ${settings.appLockEnabled ? 'text-purple-700' : 'text-stone-500'}`}>
              {settings.appLockEnabled ? 'Aktif' : 'Nonaktif'}
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              {settings.appPin ? 'PIN diatur' : 'PIN belum diatur'}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1">Masking Sensitif</div>
            <div className="font-bold text-purple-700 text-sm">Aktif</div>
            <div className="text-[10px] text-stone-400 mt-1">Sembunyikan kredensial</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1">Mode Incognito</div>
            <div className={`font-bold text-sm ${settings.incognitoMode ? 'text-amber-600' : 'text-stone-500'}`}>
              {settings.incognitoMode ? 'Aktif' : 'Mati'}
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Riwayat temporer</div>
          </div>
        </div>

        {/* Section 1: App Lock */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-600" />
            Kunci & Autentikasi Aplikasi
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Aktifkan Kunci Aplikasi</div>
              <div className="text-stone-500 text-[11px]">
                {settings.appPin ? 'Aplikasi akan meminta PIN saat dibuka' : 'Atur PIN 4 digit untuk mengaktifkan'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.appLockEnabled}
              onChange={e => handleToggleLock(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <button
              type="button"
              onClick={handleOpenPinSetup}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <KeyRound className="w-4 h-4 text-stone-500" />
              {settings.appPin ? 'Ubah PIN 4 Digit' : 'Atur PIN 4 Digit Baru'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-stone-100">
            <div>
              <div className="font-semibold text-stone-800 text-xs">Kunci Otomatis (Timeout)</div>
              <div className="text-stone-500 text-[11px]">Durasi jeda sebelum aplikasi terkunci otomatis</div>
            </div>
            <select
              value={settings.autoLockDelayMinutes}
              onChange={e => onUpdateSettings({ autoLockDelayMinutes: Number(e.target.value) })}
              className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800 text-xs"
            >
              <option value={0}>Segera saat ditutup</option>
              <option value={1}>1 menit</option>
              <option value={5}>5 menit</option>
              <option value={15}>15 menit</option>
            </select>
          </div>
        </div>

        {/* Section 2: Masking & Protection */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-purple-600" />
            Deteksi Data Sensitif & Masking
          </h3>
          <p className="text-stone-500 text-[11px]">
            Clipboard secara cerdas mengenali nomor kartu kredit (algoritma Luhn), token rahasia API (sk-..., bearer, GitHub PAT), dan kata sandi, lalu menutupnya dengan topeng ••••••••.
          </p>
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center justify-between font-mono text-xs">
            <span className="text-stone-500">bearer sk-live-••••••••••••••••</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans font-medium text-[10px]">
              Otomatis Terlindungi
            </span>
          </div>
        </div>

        {/* Section 3: App Blacklist (Excluded Apps) */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            Daftar Hitam Aplikasi (Blacklist)
          </h3>
          <p className="text-stone-500 text-[11px]">
            Teks yang disalin dari aplikasi dalam daftar ini tidak akan pernah disimpan ke riwayat clipboard (misal aplikasi perbankan atau password manager).
          </p>

          <form onSubmit={handleAddBlacklistApp} className="flex gap-2">
            <input
              type="text"
              value={newBlacklistApp}
              onChange={e => setNewBlacklistApp(e.target.value)}
              placeholder="Contoh: com.bank.bca atau 1password"
              className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-mono"
            />
            <button
              type="submit"
              disabled={!newBlacklistApp.trim()}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg font-semibold"
            >
              Tambah
            </button>
          </form>

          <div className="flex flex-col gap-1.5 mt-1">
            {settings.appBlacklist.map(pkg => (
              <div
                key={pkg}
                className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono"
              >
                <span className="text-stone-700">{pkg}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlacklistApp(pkg)}
                  className="text-stone-400 hover:text-red-600 p-1"
                  title="Hapus dari daftar hitam"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Setup Modal */}
      {showPinDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <h3 className="text-base font-bold text-stone-900 mb-1">Atur PIN 4 Digit</h3>
            <p className="text-stone-500 mb-4">
              Buat 4 digit angka rahasia untuk melindungi clipboard Anda.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">PIN 4 Digit Baru:</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-stone-800"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Konfirmasi PIN:</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinConfirm}
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-stone-800"
                />
              </div>

              {pinError && (
                <div className="text-red-600 text-[11px] font-medium">{pinError}</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPinDialog(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePin}
                disabled={pinInput.length !== 4 || pinConfirm.length !== 4}
                className="px-4 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-sm"
              >
                Simpan PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
