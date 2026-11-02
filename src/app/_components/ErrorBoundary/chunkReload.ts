// After a deploy, an open tab still asks for the previous build's chunks and
// gets 404s. One reload picks up the new build. The timestamp stops a chunk
// that fails on every load from reloading forever.
const RELOADED_AT_KEY = 'tapisui-chunk-reload-at';
const RELOAD_WINDOW_MS = 60_000;

const CHUNK_ERROR =
  /dynamically imported module|importing a module script failed|error loading dynamically|loading chunk|loading css chunk|unable to preload css/i;

export const isChunkError = (error: unknown): boolean =>
  CHUNK_ERROR.test(String((error as Error)?.message ?? error));

/** Returns false when a reload already ran inside the window. */
export const reloadForNewBuild = (
  reload: () => void = () => window.location.reload(),
  now: number = Date.now()
): boolean => {
  const last = Number(sessionStorage.getItem(RELOADED_AT_KEY) ?? 0);
  if (now - last < RELOAD_WINDOW_MS) return false;
  sessionStorage.setItem(RELOADED_AT_KEY, String(now));
  reload();
  return true;
};
