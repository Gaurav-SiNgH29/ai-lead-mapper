// Pure utility — converts a raw byte count into a human-readable string.
// Kept separate from any component so it's independently reusable and
// testable without needing to mount a React tree.
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}