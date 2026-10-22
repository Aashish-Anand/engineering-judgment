export const THEME_STORAGE_KEY = "engineering-judgment-theme";

// Runs in the document head before the first paint, independent of hydration.
export const themeInitScript = `(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = (preference) => {
    root.dataset.themePreference = preference;
    root.dataset.theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
  };
  let saved;
  try { saved = localStorage.getItem('${THEME_STORAGE_KEY}'); } catch {}
  apply(saved === 'dark' || saved === 'light' ? saved : 'system');
  media.addEventListener('change', () => {
    if (root.dataset.themePreference === 'system') apply('system');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === '${THEME_STORAGE_KEY}' || event.key === null) {
      apply(event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : 'system');
    }
  });
})();`;
