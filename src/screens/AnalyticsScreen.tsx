import React, { useMemo } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Zap,
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ClipItem, UsageEvent } from '../types';

interface AnalyticsScreenProps {
  clips: ClipItem[];
  events: UsageEvent[];
  onNavigateBack: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  clips,
  events,
  onNavigateBack,
}) => {
  const activeClips = useMemo(() => clips.filter(c => !c.isDeleted), [clips]);

  // Total copies count (sum of all clip useCounts plus copy events)
  const totalCopies = useMemo(() => {
    const fromClips = activeClips.reduce((acc, c) => acc + c.useCount, 0);
    const fromEvents = events.filter(e => e.eventType === 'COPY').length;
    return Math.max(fromClips, fromEvents);
  }, [activeClips, events]);

  // Total characters saved
  const totalCharsSaved = useMemo(() => {
    return activeClips.reduce((acc, c) => acc + (c.charCount * Math.max(1, c.useCount)), 0);
  }, [activeClips]);

  // Estimated typing time saved (assume 40 WPM ~ 200 chars per min)
  const timeSavedMinutes = useMemo(() => {
    return Math.round(totalCharsSaved / 200);
  }, [totalCharsSaved]);

  // Content type breakdown
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = { TEXT: 0, URL: 0, CODE: 0, NUMBER: 0 };
    for (const c of activeClips) {
      counts[c.contentType] = (counts[c.contentType] || 0) + 1;
    }
    const total = activeClips.length || 1;
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [activeClips]);

  // Top apps
  const appBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of activeClips) {
      const app = c.sourceApp || 'Lainnya';
      counts[app] = (counts[app] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = activeClips.length || 1;
    return sorted.slice(0, 5).map(([app, count]) => ({
      app: app.replace('com.', '').replace('android.', ''),
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [activeClips]);

  // Daily distribution (Monday to Sunday)
  const dayDistribution = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const c of activeClips) {
      const day = new Date(c.createdAt).getDay();
      counts[day]++;
    }
    const max = Math.max(...counts, 1);
    return days.map((label, idx) => ({
      label,
      count: counts[idx],
      percent: Math.round((counts[idx] / max) * 100),
    }));
  }, [activeClips]);

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
        <h1 className="font-bold text-stone-900 text-base">Analisis & Statistik</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 flex flex-col gap-4 text-xs">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1 flex items-center justify-between">
              <span>Total Salinan</span>
              <Zap className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-stone-900">{totalCopies}</div>
            <div className="text-[10px] text-stone-400 mt-1">Kali disalin ke clipboard</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1 flex items-center justify-between">
              <span>Waktu Hemat</span>
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-stone-900">
              {timeSavedMinutes > 60
                ? `${(timeSavedMinutes / 60).toFixed(1)} jam`
                : `${timeSavedMinutes} mnt`}
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Estimasi hemat pengetikan</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1 flex items-center justify-between">
              <span>Karakter</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-stone-900">{totalCharsSaved.toLocaleString()}</div>
            <div className="text-[10px] text-stone-400 mt-1">Total karakter tersimpan</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="text-stone-400 mb-1 flex items-center justify-between">
              <span>Item Aktif</span>
              <Layers className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-stone-900">{activeClips.length}</div>
            <div className="text-[10px] text-stone-400 mt-1">Snippet dalam riwayat</div>
          </div>
        </div>

        {/* Activity Distribution by Day of Week */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" />
            Distribusi Aktivitas Mingguan
          </h3>
          <p className="text-stone-400 text-[11px] mb-4">
            Frekuensi pembuatan dan penyimpanan snippet berdasarkan hari:
          </p>

          <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4 px-2">
            {dayDistribution.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-end gap-1.5">
                <span className="text-[10px] font-semibold text-stone-600">{d.count}</span>
                <div
                  style={{ height: `${Math.max(8, d.percent)}%` }}
                  className="w-full max-w-[28px] bg-purple-500 hover:bg-purple-600 rounded-t-md transition-all"
                />
                <span className="text-[10px] text-stone-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-purple-600" />
            Distribusi Tipe Konten
          </h3>
          <p className="text-stone-400 text-[11px] mb-3">
            Komposisi format snippet yang Anda simpan:
          </p>

          <div className="flex flex-col gap-2.5">
            {typeBreakdown.map(item => (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-semibold text-stone-700">{item.type}</span>
                  <span className="text-stone-500">{item.count} snippet ({item.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percent}%` }}
                    className={`h-full rounded-full ${
                      item.type === 'URL'
                        ? 'bg-blue-500'
                        : item.type === 'CODE'
                        ? 'bg-emerald-500'
                        : item.type === 'NUMBER'
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributing Apps */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Sumber Aplikasi Teratas
          </h3>
          <p className="text-stone-400 text-[11px] mb-3">
            Aplikasi yang paling banyak menjadi sumber salinan:
          </p>

          <div className="flex flex-col gap-2.5">
            {appBreakdown.map(app => (
              <div key={app.app}>
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-semibold text-stone-700 capitalize">{app.app}</span>
                  <span className="text-stone-500">{app.count} item ({app.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${app.percent}%` }}
                    className="h-full bg-stone-700 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
