/**
 * The cluster's own answer to "which projects can I charge?" — caught in
 * flight.
 *
 * There is no API a browser can ask for a user's allocations: the truth
 * lives in the cluster's accounting database, behind site services (TAS,
 * ACCESS) that want credentials a UI does not have. But when a submission
 * goes up without `-A` and the user has more than one project, TACC's
 * submit filter rejects it with the complete list — "Note that your
 * available projects are:" — and that text comes back inside the failed
 * job's last message.
 *
 * So the failed job is the discovery mechanism. Parse the list out of the
 * refusal, remember it per execution system, and the launcher can offer
 * real project names as one-press chips instead of a blank box. The first
 * job on a system may bounce; everything after it should not.
 */

const MARKER = /available projects are:/i;

/** A project id: `TG-ABC123`, `CTS21005`, `A-ccsc` — one token, no prose. */
const PROJECT_ID = /^[A-Za-z][A-Za-z0-9_-]{1,63}$/;

/**
 * Single uppercase words that are scheduler/job vocabulary, not projects.
 * The refusal rides inside a failed job's message chain, and the chain's
 * tail — the job's own state — can land right under the list looking
 * exactly like one more id ("FAILED" was offered as a one-press chip).
 * Meeting one means the wrapper prose has resumed: the list is over.
 */
const JOB_STATE_WORDS = new Set([
  'FAILED',
  'CANCELLED',
  'CANCELED',
  'COMPLETED',
  'FINISHED',
  'PENDING',
  'QUEUED',
  'RUNNING',
  'STAGING',
  'BLOCKED',
  'PAUSED',
  'TIMEOUT',
  'ERROR',
]);

const MAX_PROJECTS = 25;

/**
 * Pull the project list out of a refusal message, or [] when it is some
 * other failure. Tolerant of the shapes the filter's text survives in:
 * escaped newlines from the error chain, `-A`-prefixed lines, several ids
 * on one line. The list ends at the first line that reads as prose — that
 * is the next wrapper in the chain, not a project.
 */
export const parseAvailableProjects = (message?: string): string[] => {
  if (!message) {
    return [];
  }
  const text = message.replace(/\\n/g, '\n');
  const at = text.search(MARKER);
  if (at < 0) {
    return [];
  }
  const tail = text.slice(at).split(':').slice(1).join(':');

  const projects: string[] = [];
  for (const raw of tail.split('\n')) {
    const line = raw.trim().replace(/^-A\s+/, '');
    if (!line) {
      // blank before the list starts is formatting; after it, the end
      if (projects.length) {
        break;
      }
      continue;
    }
    const tokens = line.split(/[\s,]+/).filter(Boolean);
    if (tokens.some((token) => JOB_STATE_WORDS.has(token))) {
      break;
    }
    // one id per line, or a comma list — three bare words in a row is prose
    // ("Please contact support"), and prose means the list is over
    const readsAsList = tokens.length === 1 || line.includes(',');
    if (readsAsList && tokens.every((token) => PROJECT_ID.test(token))) {
      projects.push(...tokens);
    } else {
      break;
    }
  }
  // de-dupe, preserving the order the cluster printed
  const unique = Array.from(new Set(projects));
  // This is scraped prose, and the wording is the site's to change. A parse
  // that swallows a paragraph would yield dozens of "projects"; no refusal
  // prints that many, so a flood means the format moved — the honest answer
  // is none, and the rest of the page carries on without chips.
  return unique.length > MAX_PROJECTS ? [] : unique;
};

/**
 * Per-system memory of those lists, on this device.
 *
 * localStorage rather than anything grander: the list is a convenience
 * cache of what the cluster already said to this user, and saying it again
 * costs one failed submission.
 */
const KEY = 'jobs.known-projects';

type Store = Record<string, string[]>;

const readStore = (): Store => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Store;
    // lists remembered before the state-word guard existed can hold FAILED —
    // scrub them on the way in rather than serving the chip for another visit
    return Object.fromEntries(
      Object.entries(raw).map(([system, list]) => [
        system,
        (list ?? []).filter((id) => !JOB_STATE_WORDS.has(id)),
      ])
    );
  } catch {
    return {};
  }
};

let store: Store = readStore();

const listeners = new Set<() => void>();
const announce = () => listeners.forEach((listener) => listener());

export const subscribeKnownProjects = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const EMPTY: string[] = [];

/** Stable identity per system, so it can feed useSyncExternalStore. */
export const knownProjects = (systemId?: string): string[] =>
  (systemId && store[systemId]) || EMPTY;

export const rememberProjects = (
  systemId: string | undefined,
  projects: string[]
) => {
  // the parser guards this too, but the store is public API — a state word
  // must not become a chip no matter which door it arrives through
  const real = projects.filter((id) => !JOB_STATE_WORDS.has(id));
  if (!systemId || real.length === 0) {
    return;
  }
  const merged = Array.from(new Set([...(store[systemId] ?? []), ...real]));
  const previous = store[systemId];
  if (previous && previous.length === merged.length) {
    return; // union added nothing — keep the stable identity
  }
  store = { ...store, [systemId]: merged };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // it still holds for this visit
  }
  announce();
};

/** Tests. */
export const resetKnownProjects = () => {
  store = {};
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  announce();
};
