import React, { useState } from 'react';
import {
  Clipboard,
  FolderTree,
  Wrench,
  BarChart3,
  Settings,
  Search,
  Pause,
  Play,
  MoreVertical,
  Shield,
  EyeOff,
  LayoutList,
  LayoutGrid,
  FileText,
  Plus
} from 'lucide-react';
import { DisplayMode, SortOrder } from '../types';

export type ScreenType =
  | 'HOME'
  | 'FOLDERS_TAGS'
  | 'TOOLS'
  | 'TEXT_TOOLS'
  | 'ANALYTICS'
  | 'SETTINGS'
  | 'SEARCH'
  | 'EDITOR'
  | 'SECURITY'
  | 'BACKUP_RESTORE';

export interface NavigationProps {
  currentScreen?: ScreenType | string;
  onNavigate?: (screen: any) => void;
  onNavigateTo?: (screen: any) => void;
  captureEnabled?: boolean;
  onToggleCapture?: () => void;
  incognitoMode?: boolean;
  onToggleIncognito?: () => void;
  displayMode?: DisplayMode;
  onChangeDisplayMode?: (mode: DisplayMode) => void;
  sortOrder?: SortOrder;
  onChangeSortOrder?: (order: SortOrder) => void;
  onNewSnippet?: () => void;
}

export const TopBar: React.FC<NavigationProps> = ({
  currentScreen = 'HOME',
  onNavigate,
  onNavigateTo,
  captureEnabled = true,
  onToggleCapture,
  incognitoMode = false,
  onToggleIncognito,
  displayMode = 'COMPACT',
  onChangeDisplayMode,
  sortOrder = 'NEWEST',
  onChangeSortOrder,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDisplaySubmenu, setShowDisplaySubmenu] = useState(false);
  const [showSortSubmenu, setShowSortSubmenu] = useState(false);

  const navigate = (screen: any) => {
    if (typeof onNavigate === 'function') {
      onNavigate(screen);
    } else if (typeof onNavigateTo === 'function') {
      onNavigateTo(screen);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Clipboard className="w-4 h-4" />
          </div>
          <span className="font-bold text-stone-800 tracking-tight text-lg">Clipboard</span>
          {incognitoMode && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
              <EyeOff className="w-3 h-3" /> Incognito
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 relative">
          <button
            type="button"
            onClick={() => navigate('SEARCH')}
            title="Cari & Filter"
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleCapture}
            title={captureEnabled ? "Jeda Penangkapan" : "Lanjutkan Penangkapan"}
            className={`p-2 rounded-lg transition ${
              captureEnabled
                ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            {captureEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-amber-600" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMenu(!showMenu);
                setShowDisplaySubmenu(false);
                setShowSortSubmenu(false);
              }}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowMenu(false)}
              >
                <button
                  type="button"
                  onClick={onToggleIncognito}
                  className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-stone-500" /> Mode Incognito
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${incognitoMode ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                    {incognitoMode ? 'Aktif' : 'Mati'}
                  </span>
                </button>

                <div className="border-t border-stone-100 my-1" />

                <div className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Tampilan
                </div>

                <div className="grid grid-cols-3 gap-1 px-3 py-1">
                  <button
                    type="button"
                    onClick={() => onChangeDisplayMode && onChangeDisplayMode('COMPACT')}
                    className={`p-1.5 rounded flex flex-col items-center gap-1 text-xs ${
                      displayMode === 'COMPACT' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-stone-100 text-stone-600'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                    Ringkas
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeDisplayMode && onChangeDisplayMode('GRID')}
                    className={`p-1.5 rounded flex flex-col items-center gap-1 text-xs ${
                      displayMode === 'GRID' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-stone-100 text-stone-600'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeDisplayMode && onChangeDisplayMode('DETAILED')}
                    className={`p-1.5 rounded flex flex-col items-center gap-1 text-xs ${
                      displayMode === 'DETAILED' ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-stone-100 text-stone-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Detail
                  </button>
                </div>

                <div className="border-t border-stone-100 my-1" />

                <div className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Urutan
                </div>
                {[
                  { key: 'NEWEST' as SortOrder, label: 'Terbaru' },
                  { key: 'OLDEST' as SortOrder, label: 'Terlama' },
                  { key: 'MOST_USED' as SortOrder, label: 'Paling sering dipakai' },
                  { key: 'TEXT_SIZE' as SortOrder, label: 'Ukuran teks' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onChangeSortOrder && onChangeSortOrder(item.key)}
                    className={`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between ${
                      sortOrder === item.key ? 'text-purple-700 font-medium bg-purple-50' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                    {sortOrder === item.key && <span className="text-purple-600">✓</span>}
                  </button>
                ))}

                <div className="border-t border-stone-100 my-1" />

                <button
                  type="button"
                  onClick={() => navigate('SECURITY')}
                  className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-stone-500" /> Keamanan & Privasi
                </button>

                <button
                  type="button"
                  onClick={() => navigate('SETTINGS')}
                  className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-stone-500" /> Pengaturan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC<{
  currentScreen: ScreenType | string;
  onNavigate?: (screen: any) => void;
  onNavigateTo?: (screen: any) => void;
}> = ({ currentScreen, onNavigate, onNavigateTo }) => {
  const navigate = (screen: any) => {
    if (typeof onNavigate === 'function') {
      onNavigate(screen);
    } else if (typeof onNavigateTo === 'function') {
      onNavigateTo(screen);
    }
  };

  const tabs: { screen: ScreenType | string; label: string; icon: React.ReactNode }[] = [
    { screen: 'HOME', label: 'Beranda', icon: <Clipboard className="w-5 h-5" /> },
    { screen: 'FOLDERS_TAGS', label: 'Folder & Tag', icon: <FolderTree className="w-5 h-5" /> },
    { screen: 'TEXT_TOOLS', label: 'Alat', icon: <Wrench className="w-5 h-5" /> },
    { screen: 'ANALYTICS', label: 'Analitik', icon: <BarChart3 className="w-5 h-5" /> },
    { screen: 'SETTINGS', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map(tab => {
          const isActive = currentScreen === tab.screen;
          return (
            <button
              key={tab.screen}
              type="button"
              onClick={() => navigate(tab.screen)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                isActive
                  ? 'text-purple-700 font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-all ${
                  isActive ? 'bg-purple-100' : 'bg-transparent'
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
