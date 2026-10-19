import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createFileNavigationHistory,
  fileNavigationHistoryStorageKey,
  moveFileNavigationHistory,
  parseFileNavigationHistory,
  recentFileNavigationOptions,
  recordFileNavigationPath,
  serializeFileNavigationHistory,
  type FileNavigationHistoryState,
} from './navigationHistory';
import { normalizeFilePath } from './utils';

interface UseFileNavigationHistoryOptions {
  basePath: string;
  username: string;
  systemId: string;
  path: string;
  onNavigate: (path: string) => void;
}

const readHistory = (storageKey: string, path: string) => {
  try {
    const stored = parseFileNavigationHistory(
      window.sessionStorage.getItem(storageKey)
    );
    return stored
      ? recordFileNavigationPath(stored, path)
      : createFileNavigationHistory(path);
  } catch {
    return createFileNavigationHistory(path);
  }
};

export default function useFileNavigationHistory({
  basePath,
  username,
  systemId,
  path,
  onNavigate,
}: UseFileNavigationHistoryOptions) {
  const storageKey = useMemo(
    () => fileNavigationHistoryStorageKey({ basePath, username, systemId }),
    [basePath, systemId, username]
  );
  const normalizedPath = normalizeFilePath(path);
  const [scopedHistory, setScopedHistory] = useState<{
    storageKey: string;
    history: FileNavigationHistoryState;
  }>(() => ({ storageKey, history: readHistory(storageKey, normalizedPath) }));
  const pendingTraversalPath = useRef<string>();

  useEffect(() => {
    setScopedHistory((current) => {
      if (current.storageKey !== storageKey) {
        pendingTraversalPath.current = undefined;
        return {
          storageKey,
          history: readHistory(storageKey, normalizedPath),
        };
      }
      if (pendingTraversalPath.current === normalizedPath) {
        pendingTraversalPath.current = undefined;
        return current;
      }
      const history = recordFileNavigationPath(current.history, normalizedPath);
      return history === current.history ? current : { storageKey, history };
    });
  }, [normalizedPath, storageKey]);

  useEffect(() => {
    if (scopedHistory.storageKey !== storageKey) return;
    try {
      window.sessionStorage.setItem(
        storageKey,
        serializeFileNavigationHistory(scopedHistory.history)
      );
    } catch {
      // History remains available in memory when session storage is blocked.
    }
  }, [scopedHistory, storageKey]);

  const goToIndex = useCallback(
    (index: number) => {
      const target = scopedHistory.history.entries[index];
      if (!target || index === scopedHistory.history.index) return;
      pendingTraversalPath.current = target.path;
      setScopedHistory((current) => ({
        ...current,
        history: moveFileNavigationHistory(current.history, index),
      }));
      onNavigate(target.path);
    },
    [onNavigate, scopedHistory.history]
  );

  const { history } = scopedHistory;
  return {
    entries: history.entries,
    index: history.index,
    canGoBack: history.index > 0,
    canGoForward: history.index < history.entries.length - 1,
    recentOptions: recentFileNavigationOptions(history),
    goBack: () => goToIndex(history.index - 1),
    goForward: () => goToIndex(history.index + 1),
    goToIndex,
  };
}
