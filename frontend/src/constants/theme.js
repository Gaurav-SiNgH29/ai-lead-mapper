// Design tokens — single source of truth for every color decision in the app.
// If the brand color changes (e.g. orange → blue), this is the only file
// that needs updating. Components never hardcode color values directly.

export const THEME = {
  // Brand colors
  primary: "bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-500",
  primaryRing: "focus-visible:ring-orange-500",
  primaryText: "text-orange-500 dark:text-orange-400",
  primaryBorder: "border-t-orange-500 dark:border-t-orange-400",

  // Accent (teal — used for imported counts, icons)
  accentText: "text-teal-600 dark:text-teal-400",
  accentBg: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400",

  // Surfaces
  pageBg: "bg-slate-50 dark:bg-slate-950",
  cardBg: "bg-white dark:bg-slate-900",
  cardBorder: "border-slate-200 dark:border-slate-800",
  inputBg: "bg-slate-50 dark:bg-slate-800/50",
  tableHeaderBg: "bg-slate-50 dark:bg-slate-800",

  // Text
  textPrimary: "text-slate-900 dark:text-slate-100",
  textSecondary: "text-slate-500 dark:text-slate-400",
  textMuted: "text-slate-400 dark:text-slate-500",
  textBody: "text-slate-700 dark:text-slate-300",
  textLabel: "text-slate-600 dark:text-slate-300",

  // Borders
  border: "border-slate-200 dark:border-slate-800",
  borderSubtle: "border-slate-100 dark:border-slate-800",
  borderDivider: "border-slate-200 dark:border-slate-700",

  // Spinner track
  spinnerTrack: "border-slate-200 dark:border-slate-700",

  // Secondary button
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",

  // States
  errorText: "text-red-600 dark:text-red-400",
  dropzoneDrag: "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/30",
  dropzoneIdle: "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
};