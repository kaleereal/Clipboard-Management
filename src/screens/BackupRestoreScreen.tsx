import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { ClipItem, Folder, Tag, ClipVersion, BackupMetadata } from '../types';

interface BackupRestoreScreenProps {
  clips: ClipItem[];
  folders: Folder[];
  tags: Tag[];
  versions: ClipVersion[];
  backups: BackupMetadata[];
  onImportData: (data: {
    clips: ClipItem[];
    folders?: Folder[];
    tags?: Tag[];
    versions?: ClipVersion[];
  }, mode: 'MERGE' | 'REPLACE') => void;
  onRecordBackup: (metadata: BackupMetadata) => void;
  onNavigateBack: () => void;
  onShowToast: (msg: string) => void;
}

export const BackupRestoreScreen: React.FC<BackupRestoreScreenProps> = ({
  clips,
  folders,
  tags,
  versions,
  backups,
  onImportData,
  onRecordBackup,
  onNavigateBack,
  onShowToast,
}) => {
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV' | 'TXT'>('JSON');
  const [encryptBackup, setEncryptBackup] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');

  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [importMode, setImportMode] = useState<'MERGE' | 'REPLACE'>('MERGE');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = () => {
    let output = '';
    let filename = `clipboard_backup_${new Date().toISOString().slice(0, 10)}`;
    let mimeType = 'text/plain';

    if (exportFormat === 'JSON') {
      const payload = {
        version: 1,
        exportedAt: Date.now(),
        isEncrypted: encryptBackup,
        data: {
          clips,
          folders,
          tags,
          versions,
        },
      };
      output = JSON.stringify(payload, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    } else if (exportFormat === 'CSV') {
      const header = 'ID,Content,ContentType,IsPinned,CreatedAt\n';
      const rows = clips
        .map(
          c =>
            `"${c.id}","${c.content.replace(/"/g, '""')}","${c.contentType}",${c.isPinned},${c.createdAt}`
        )
        .join('\n');
      output = header + rows;
      filename += '.csv';
      mimeType = 'text/csv';
    } else {
      output = clips.map(c => c.content).join('\n\n---\n\n');
      filename += '.txt';
      mimeType = 'text/plain';
    }

    // Trigger download
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onRecordBackup({
      id: `bk_${Date.now()}`,
      fileName: filename,
      itemCount: clips.length,
      fileSizeBytes: blob.size,
      createdAt: Date.now(),
      isEncrypted: encryptBackup,
    });

    onShowToast(`Cadangan ${filename} berhasil diunduh!`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = evt => {
      setFileContent(evt.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!fileContent) {
      alert('Pilih berkas cadangan terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    try {
      if (selectedFile?.name.endsWith('.json')) {
        const parsed = JSON.parse(fileContent);
        const importedData = parsed.data || parsed;
        if (Array.isArray(importedData.clips)) {
          onImportData(importedData, importMode);
          onShowToast(`Berhasil memulihkan ${importedData.clips.length} snippet`);
        } else if (Array.isArray(importedData)) {
          onImportData({ clips: importedData }, importMode);
          onShowToast(`Berhasil memulihkan ${importedData.length} snippet`);
        } else {
          alert('Format JSON tidak valid.');
        }
      } else if (selectedFile?.name.endsWith('.csv')) {
        // Parse CSV lines
        const lines = fileContent.split('\n').filter(l => l.trim());
        const newClips: ClipItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const cleanText = line.replace(/^"|"$/g, '').replace(/""/g, '"');
          const now = Date.now();
          newClips.push({
            id: `csv_${now}_${i}`,
            content: cleanText,
            plainContent: cleanText,
            contentType: 'TEXT',
            folderId: null,
            tagIds: [],
            isPinned: false,
            isLocked: false,
            isSensitive: false,
            isSelfDestruct: false,
            isDeleted: false,
            useCount: 1,
            charCount: cleanText.length,
            wordCount: cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0,
            lineCount: cleanText.split('\n').length,
            contentHash: String(cleanText.length),
            createdAt: now,
            updatedAt: now,
            lastUsedAt: now,
            sourceApp: 'CSV Import',
          });
        }
        onImportData({ clips: newClips }, importMode);
        onShowToast(`Berhasil memulihkan ${newClips.length} snippet dari CSV`);
      } else {
        // Plain TXT separated by delimiter
        const chunks = fileContent.split(/\n\n---\n\n|\n{2,}/).filter(c => c.trim());
        const newClips: ClipItem[] = chunks.map((chunk, idx) => {
          const text = chunk.trim();
          const now = Date.now();
          return {
            id: `txt_${now}_${idx}`,
            content: text,
            plainContent: text,
            contentType: 'TEXT',
            folderId: null,
            tagIds: [],
            isPinned: false,
            isLocked: false,
            isSensitive: false,
            isSelfDestruct: false,
            isDeleted: false,
            useCount: 1,
            charCount: text.length,
            wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
            lineCount: text.split('\n').length,
            contentHash: String(text.length),
            createdAt: now,
            updatedAt: now,
            lastUsedAt: now,
            sourceApp: 'Text Import',
          };
        });
        onImportData({ clips: newClips }, importMode);
        onShowToast(`Berhasil memulihkan ${newClips.length} snippet dari TXT`);
      }

      setSelectedFile(null);
      setFileContent('');
    } catch (err) {
      alert('Gagal memproses berkas cadangan: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
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
        <h1 className="font-bold text-stone-900 text-base">Cadangkan & Pulihkan</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 flex flex-col gap-4 text-xs">
        {/* Export Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-purple-600" />
            Ekspor & Cadangkan Data
          </h3>
          <p className="text-stone-500 text-[11px]">
            Simpan semua riwayat clipboard, folder, tag, dan versi ke dalam berkas offline.
          </p>

          <div>
            <label className="block font-medium text-stone-700 mb-1.5">Pilih Format Cadangan:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'JSON' as const, label: 'JSON (Lengkap)', icon: FileJson },
                { key: 'CSV' as const, label: 'CSV (Tabel)', icon: FileSpreadsheet },
                { key: 'TXT' as const, label: 'Teks (.txt)', icon: FileText },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setExportFormat(f.key)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      exportFormat === f.key
                        ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExport}
              className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Unduh Cadangan Sekarang ({clips.length} Item)
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-600" />
            Impor & Pulihkan Cadangan
          </h3>
          <p className="text-stone-500 text-[11px]">
            Unggah berkas cadangan (.json, .csv, atau .txt) yang pernah dibuat sebelumnya.
          </p>

          <label className="border-2 border-dashed border-stone-300 hover:border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-stone-50/50">
            <Upload className="w-8 h-8 text-stone-400 mb-2" />
            <span className="font-semibold text-stone-700">
              {selectedFile ? selectedFile.name : 'Klik untuk memilih berkas cadangan'}
            </span>
            <span className="text-stone-400 text-[11px] mt-0.5">
              {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : 'Mendukung format .json, .csv, .txt'}
            </span>
            <input
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <div className="flex flex-col gap-2 pt-2">
              <label className="font-medium text-stone-700">Metode Pemulihan:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'MERGE'}
                    onChange={() => setImportMode('MERGE')}
                    className="text-purple-600"
                  />
                  <span>Gabungkan dengan data yang ada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'REPLACE'}
                    onChange={() => setImportMode('REPLACE')}
                    className="text-purple-600"
                  />
                  <span className="text-red-700">Gantikan semua data (Timpa)</span>
                </label>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'Memproses...' : 'Mulai Pemulihan'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            Riwayat Cadangan
          </h3>
          <p className="text-stone-400 text-[11px] mb-3">
            Daftar berkas cadangan yang telah dibuat di sesi ini:
          </p>

          <div className="flex flex-col gap-2">
            {backups.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">
                Belum ada berkas cadangan dibuat.
              </div>
            ) : (
              backups.map(b => (
                <div
                  key={b.id}
                  className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-stone-800">{b.fileName}</div>
                    <div className="text-[11px] text-stone-400">
                      {new Date(b.createdAt).toLocaleString('id-ID')} · {b.itemCount} snippet · {Math.round(b.fileSizeBytes / 1024)} KB
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Tersimpan
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
