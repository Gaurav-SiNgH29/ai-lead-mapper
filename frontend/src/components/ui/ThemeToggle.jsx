"use client";

import { useTheme } from "@/context/ThemeContext";
import { MESSAGES } from "@/constants/messages";
import { THEME } from "@/constants/theme";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      aria-label={isDark ? MESSAGES.toggleLightMode : MESSAGES.toggleDarkMode}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${THEME.border} ${THEME.primaryRing}`}
    >
      <span suppressHydrationWarning aria-hidden="true">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}