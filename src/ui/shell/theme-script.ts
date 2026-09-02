/** The one localStorage key the no-flash script and ThemeToggle must agree on. */
export const THEME_STORAGE_KEY = 'theme'

/**
 * Runs before first paint, inline in <head>. Without it the page renders in the
 * OS theme for one frame and then snaps to the stored choice.
 * Kept as a string because it must not wait on the React bundle. `THEME_STORAGE_KEY`
 * is interpolated via JSON.stringify — not string-concatenated — so the script
 * stays one expression and can't break even if the key ever picks up a quote.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`
