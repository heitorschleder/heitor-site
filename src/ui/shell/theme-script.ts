/**
 * Runs before first paint, inline in <head>. Without it the page renders in the
 * OS theme for one frame and then snaps to the stored choice.
 * Kept as a string because it must not wait on the React bundle.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`
