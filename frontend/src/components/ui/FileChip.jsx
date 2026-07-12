"use client";

import { MESSAGES } from "@/constants/messages";
import { THEME } from "@/constants/theme";
import { formatFileSize } from "@/utils/formatFileSize";

// Shows the currently selected file with an optional remove action —
// lets the user back out and pick a different file without a full page
// reload. Renders nothing if no file is selected, so callers never need
// to guard against rendering this conditionally themselves.
export default function FileChip({ file, onRemove }) {
  if (!file) return null;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${THEME.border} ${THEME.inputBg}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold ${THEME.accentBg}`}
        >
          CSV
        </div>
        <div>
          <p className={`text-sm font-medium ${THEME.textPrimary}`}>
            {file.name}
          </p>
          <p className={`text-xs ${THEME.textSecondary}`}>
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={MESSAGES.removeFileAriaLabel}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${THEME.primaryRing} ${THEME.textMuted} hover:${THEME.inputBg}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}