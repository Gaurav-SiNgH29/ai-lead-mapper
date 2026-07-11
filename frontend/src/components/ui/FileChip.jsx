'use client';

import { MESSAGES } from '@/constants/messages';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Shows the currently selected file with a remove action — lets the
// person back out and pick a different file without a full page reload.
export default function FileChip({ file, onRemove }) {
  if (!file) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-xs font-semibold text-teal-700">
          CSV
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={MESSAGES.removeFile}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
//FileChip — a reusable component showing the file icon, name, and size, matching the reference screenshot's style