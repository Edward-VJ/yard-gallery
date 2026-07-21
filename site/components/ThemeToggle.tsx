"use client";

import { THEME_STORAGE_KEY } from "./ThemeInitScript";

// Both icons always render; globals.css shows/hides them via the
// [data-theme] attribute selector — set by ThemeInitScript before first
// paint, and flipped here on click. No React state/effects needed, which
// sidesteps any hydration-mismatch: the DOM attribute is the single source
// of truth for which icon is visible, at every point from first paint on.
export function ThemeToggle() {
  function toggle() {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — toggle still works for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[var(--color-border)] text-[var(--color-foreground)] hover:text-[var(--color-accent)]"
    >
      <svg
        className="theme-icon-sun"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path
          strokeLinecap="round"
          d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"
        />
      </svg>
      <svg className="theme-icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20.4 14.7A8.5 8.5 0 0 1 9.3 3.6a8.9 8.9 0 1 0 11.1 11.1Z" />
      </svg>
    </button>
  );
}
