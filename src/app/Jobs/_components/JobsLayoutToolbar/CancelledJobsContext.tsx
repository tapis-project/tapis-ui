/**
 * The cancel-request ledger — which jobs the user has asked to cancel.
 *
 * It records the REQUEST, never the outcome: Tapis cancels are
 * asynchronous, and every surface derives "cancelling" from a mark here
 * plus a still-non-terminal status. Stale marks are therefore harmless —
 * once the server reports a terminal status the mark stops meaning
 * anything.
 *
 * A module store, not React context: the awareness must outlive the Jobs
 * layout (walking to Systems and back used to forget an in-flight cancel)
 * and, via sessionStorage, a reload of the tab. Same pattern as
 * infoDetail / docsSource.
 */
import { useSyncExternalStore } from 'react';

const KEY = 'jobs.cancelRequested';

const read = (): Set<string> => {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

let _requested = read();
const _listeners = new Set<() => void>();

const write = (next: Set<string>) => {
  _requested = next;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify([..._requested]));
  } catch {
    /* it still holds for this visit */
  }
  _listeners.forEach((fn) => fn());
};

export const getCancelledUuids = (): Set<string> => _requested;

export const markCancelled = (uuid: string) => {
  if (_requested.has(uuid)) return;
  write(new Set(_requested).add(uuid));
};

/** the service refused the cancel — the request mark comes back off */
export const unmarkCancelled = (uuid: string) => {
  if (!_requested.has(uuid)) return;
  const next = new Set(_requested);
  next.delete(uuid);
  write(next);
};

export const subscribeCancelledJobs = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};

/** the same shape the old context handed out, so consumers read unchanged */
export const useCancelledJobs = () => {
  const cancelledUuids = useSyncExternalStore(
    subscribeCancelledJobs,
    getCancelledUuids
  );
  return { cancelledUuids, markCancelled, unmarkCancelled };
};
