"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MESSAGES } from "@/constants/messages";
import { THEME } from "@/constants/theme";

// 5MB — must match the backend's multer file size limit exactly.
// Defined here as a named constant so the value is never magic,
// and a future change only requires updating one place per app layer.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Upload icon — extracted as a named constant to keep the JSX below
// readable. Pure presentational SVG, no logic.
const UploadIcon = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 16V4M12 4L7 9M12 4l5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function UploadDropzone({ onFileAccepted, error }) {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const isTooLarge = rejection.errors.some(
          (e) => e.code === "file-too-large"
        );
        onFileAccepted(
          null,
          isTooLarge ? MESSAGES.errorFileTooLarge : MESSAGES.errorNotCsv
        );
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0], null);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
  });

  const dropzoneClasses = `cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
    isDragActive ? THEME.dropzoneDrag : THEME.dropzoneIdle
  }`;

  return (
    <div>
      <div
        {...getRootProps()}
        className={dropzoneClasses}
        aria-label={MESSAGES.uploadAriaLabel}
      >
        <input {...getInputProps()} />

        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${THEME.accentBg}`}>
          {UploadIcon}
        </div>

        <p className={`text-base font-medium ${THEME.textPrimary}`}>
          {MESSAGES.uploadTitle}
        </p>
        <p className={`mt-1 text-sm ${THEME.textSecondary}`}>
          {MESSAGES.uploadSubtitle}
        </p>
        <p className={`mt-4 text-xs ${THEME.textMuted}`}>
          {MESSAGES.uploadHint}
        </p>
      </div>

      {error && (
        <p className={`mt-3 text-sm ${THEME.errorText}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}