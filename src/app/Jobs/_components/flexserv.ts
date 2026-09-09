/**
 * FlexServ sessions.
 *
 * A FlexServ app does not finish — it starts a server on the compute node and
 * keeps running. Some minutes in, it prints the address and a one-time token
 * into `tapisjob.out`:
 *
 *   -- FlexServ address: https://host.example.org:60091  FlexServ token: <token>
 *
 * Until now, getting at that meant knowing to open the job's output listing,
 * finding that file among the rest, downloading it, and reading it. These two
 * functions are what the job page needs to skip all of it.
 */

export type FlexServSession = {
  address: string;
  token: string;
};

/**
 * Whether a job is worth watching for a FlexServ line.
 *
 * Name and app id, case-insensitive: the app is the reliable signal, but a job
 * launched from a fork or renamed by hand still usually says so in its name,
 * and a false positive costs one 404 that we stop retrying.
 */
export const isFlexServJob = (job?: {
  name?: string;
  appId?: string;
}): boolean => /flexserv/i.test(`${job?.name ?? ''} ${job?.appId ?? ''}`);

/**
 * An announced address counts only as an https URL. The line comes out of a
 * job's own output, which whoever wrote the app controls; a javascript: or
 * data: "address", or a typo, is not a session and is not shown as one.
 */
export const sessionAddress = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  try {
    return new URL(raw).protocol === 'https:' ? raw : undefined;
  } catch {
    return undefined;
  }
};

/** the last two labels of a hostname, or the whole thing for an IP */
const domainOf = (host: string): string =>
  /^[\d.]+$|:/.test(host) ? host : host.split('.').slice(-2).join('.');

/**
 * Where an address sits relative to the job's execution system: on its
 * domain, somewhere else, or not yet known (the system has not loaded).
 * Only an address on the system's own domain is framed inside the page.
 */
export type AddressPlacement = 'on-system' | 'elsewhere' | 'unverified';

export const addressPlacement = (
  address: string,
  systemHost?: string
): AddressPlacement => {
  if (!systemHost) return 'unverified';
  try {
    const host = new URL(address).hostname.toLowerCase();
    return domainOf(host) === domainOf(systemHost.toLowerCase())
      ? 'on-system'
      : 'elsewhere';
  } catch {
    return 'elsewhere';
  }
};

const ADDRESS = /FlexServ\s+address:\s*(\S+)/gi;
const TOKEN = /FlexServ\s+token:\s*(\S+)/gi;

const lastMatch = (text: string, pattern: RegExp): string | undefined => {
  // a fresh lastIndex per call — these are module-level /g regexes
  pattern.lastIndex = 0;
  let found: string | undefined;
  let match = pattern.exec(text);
  while (match) {
    found = match[1];
    match = pattern.exec(text);
  }
  return found;
};

/**
 * Pull the session out of a job's stdout, if it has been printed yet.
 *
 * Address and token are read independently rather than as one pattern: they
 * arrive on the same line today, but a log is a log, and half an answer is
 * still worth showing. The LAST occurrence wins — a job that restarted its
 * server has printed the line twice, and only the newer one is live.
 */
export const parseFlexServSession = (
  text?: string
): FlexServSession | undefined => {
  if (!text) return undefined;
  const address = sessionAddress(lastMatch(text, ADDRESS));
  const token = lastMatch(text, TOKEN);
  if (!address) return undefined;
  return { address, token: token ?? '' };
};
