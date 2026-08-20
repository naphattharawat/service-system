import Script from "next/script";

// Blocking inline script (next/script beforeInteractive), rendered in the
// root layout, so the "dark" class lands before first paint (avoids a flash
// of the light theme) and before React hydrates (paired with
// suppressHydrationWarning on <body>). Mirrors the legacy DOMContentLoaded
// localStorage('dm')/prefers-color-scheme check.
const INIT_SCRIPT = `(function(){try{
  var dm = localStorage.getItem('dm');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dm === '1' || (dm === null && prefersDark)) document.body.classList.add('dark');
}catch(e){}})();`;

export function DarkModeInit() {
  return (
    // Rendered from the App Router root layout, which is the documented
    // App Router equivalent of _document.js for beforeInteractive scripts —
    // this lint rule predates App Router support and doesn't know that.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="dark-mode-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
  );
}
