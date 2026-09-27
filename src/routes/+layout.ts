// Static build for GitHub Pages: prerender a client-rendered shell (no SSR), so the
// app boots on the client and reads its parameters from the URL.
export const prerender = true;
export const ssr = false;
