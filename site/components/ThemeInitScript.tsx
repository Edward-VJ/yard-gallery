export const THEME_STORAGE_KEY = "kg-theme";

// Raw inline <script>, not next/script — per Next's own guide for exactly
// this case (docs/01-app/02-guides/preventing-flash-before-hydration.md,
// "Themes" section). The browser runs this synchronously while parsing
// <head>, before any paint, so there's no flash. Must be rendered inside a
// literal <head> in the root layout (see app/(lt)/layout.tsx).
export function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
      }}
    />
  );
}
