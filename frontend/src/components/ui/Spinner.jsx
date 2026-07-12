"use client";

import { MESSAGES } from "@/constants/messages";
import { THEME } from "@/constants/theme";

// Shared loading indicator — used wherever the app is waiting on an
// async operation. aria-label comes from MESSAGES so screen readers
// get the same copy as every other user-facing string in the app.
export default function Spinner() {
  return (
    <div
      role="status"
      aria-label={MESSAGES.loadingTitle}
      className={`h-5 w-5 animate-spin rounded-full border-2 ${THEME.spinnerTrack} ${THEME.primaryBorder}`}
    />
  );
}