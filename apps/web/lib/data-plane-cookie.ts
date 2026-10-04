// The browser's half of lib/data-plane.ts: the environment selected in the UI
// tells the server which data plane to use, through this cookie. The server
// only honours a host the gateway's own environments list.

export const DATA_PLANE_COOKIE = 'xg_data_plane_host';

/** Records the selected environment's host, or clears it when there is none. */
export function setDataPlaneHostCookie(host: string | undefined) {
  if (typeof document === 'undefined') return;
  const v = (host || '').trim();
  document.cookie = v
    ? `${DATA_PLANE_COOKIE}=${encodeURIComponent(v)}; path=/; SameSite=Lax`
    : `${DATA_PLANE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
