"use client";

import { THEME } from "@/constants/theme";

// Allowed variant values — pulling from THEME tokens so all color
// decisions live in one place. Adding a new variant means adding a
// token to theme.js and a key here; nothing else needs changing.
const VARIANTS = {
  primary: THEME.primary,
  secondary: THEME.secondary,
};

const BASE_CLASSES =
  "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  THEME.primaryRing;

// Shared button component — every interactive button in the app uses this,
// so styling and behavior are never duplicated across pages or components.
export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
}) {
  // Guard against typos in the variant prop — fails loudly in development
  // so the error is caught immediately rather than silently rendering
  // an unstyled button in production.
  if (process.env.NODE_ENV !== "production" && !VARIANTS[variant]) {
    console.warn(
      `Button: unknown variant "${variant}". Expected one of: ${Object.keys(VARIANTS).join(", ")}.`
    );
  }

  const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE_CLASSES} ${variantClasses}`}
    >
      {children}
    </button>
  );
}