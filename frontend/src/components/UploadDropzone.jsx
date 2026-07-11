'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MESSAGES } from '@/constants/messages';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches backend's accepted upload limit

export default function UploadDropzone({ onFileAccepted, error }) {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const isTooLarge = rejection.errors.some(
          (e) => e.code === 'file-too-large',
        );

        onFileAccepted(
          null,
          isTooLarge ? MESSAGES.errorFileTooLarge : MESSAGES.errorNotCsv,
        );
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0], null);
      }
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? 'border-orange-400 bg-orange-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
        </div>
        <p className="text-base font-medium text-slate-900">
          {MESSAGES.uploadTitle}
        </p>
        <p className="mt-1 text-sm text-slate-500">{MESSAGES.uploadSubtitle}</p>
        <p className="mt-4 text-xs text-slate-400">{MESSAGES.uploadHint}</p>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
