/**
 * The session-app registry: jobs that produce a server, not a result.
 *
 * FlexServ was the first — a URL and a token printed partway through the
 * run, watched for and handed over by a card on the job page. ParaView is
 * the second. Everything the card and its watchers need to know about an
 * app lives in one entry here, so adding the next one (Jupyter, DCV, a
 * tenant's own) is a matcher, a parse, and some words — no new component.
 *
 * `matches` runs against name + appId, case-insensitive: the app id is the
 * reliable signal, the name catches renamed/forked runs, and a false
 * positive costs one 404 that we stop retrying. `file` is the dedicated
 * announcement file beside tapisjob.out when the app writes one; without
 * it the log alone is watched. `parse` reads either text the same way.
 */
import { Jobs } from '@tapis/tapis-typescript';
import {
  FlexServSession,
  isFlexServJob,
  parseFlexServSession,
} from './flexserv';

/** what every session app announces: where it lives, and (maybe) a key */
export type SessionInfo = FlexServSession;

export type SessionAppSpec = {
  id: string;
  /** the card's header — "<title> session" */
  title: string;
  /** the box's own color, so each app reads as its own thing */
  accent: string;
  /** name+appId test — cheap, runs on every job detail render */
  matches: (job: Pick<Jobs.Job, 'name' | 'appId'>) => boolean;
  /** dedicated announcement file beside tapisjob.out, when the app writes
   *  one; absent means the log is the only place the address appears */
  file?: string;
  /** pull the session out of the file or the log — same text either way */
  parse: (text?: string) => SessionInfo | undefined;
  /** whether the app announces a token beside its address — a few copy
   *  lines promise one, and must not for apps that never print it */
  hasToken?: boolean;
  /** whether the served app tolerates an iframe. DCV-style sessions send
   *  X-Frame-Options and the panel can only ever show a blank box — false
   *  drops "Open in panel" entirely rather than offering a dead button.
   *  Default true (FlexServ frames fine). */
  framable?: boolean;
  /** the one-line what-this-is under the header */
  whatIs: string;
  /** the open-in-tab button — "Open <openLabel>" */
  openLabel: string;
  /** the book glyph beside the fold */
  docs: { bannerText: string; url: string };
};

const PARAVIEW_ADDRESS = /INTERACTIVE_SESSION_ADDRESS=(\S+)/gi;

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
 * ParaView interactive sessions announce themselves in the log alone:
 *
 *   ++ INTERACTIVE_SESSION_ADDRESS=https://vista.tacc.utexas.edu:60788
 *
 * (the `++` is the batch script's shell trace, not part of the line). No
 * token — the address is the whole way in. Last occurrence wins, the same
 * restarted-server logic FlexServ uses.
 */
export const parseParaviewSession = (
  text?: string
): SessionInfo | undefined => {
  if (!text) return undefined;
  const address = lastMatch(text, PARAVIEW_ADDRESS);
  if (!address) return undefined;
  return { address, token: '' };
};

export const SESSION_APPS: SessionAppSpec[] = [
  {
    id: 'flexserv',
    title: 'FlexServ',
    accent: '#00897b',
    matches: isFlexServJob,
    file: 'flexserv_access_info.txt',
    parse: parseFlexServSession,
    hasToken: true,
    whatIs:
      "FlexServ serves models, inference images, and more from this job's compute node. It stops when the job does.",
    openLabel: 'FlexServ',
    docs: {
      bannerText: 'How FlexServ sessions work, from the project itself.',
      url: 'https://zhangwei217245.github.io/FlexServ/',
    },
  },
  {
    id: 'paraview',
    title: 'ParaView',
    accent: '#3949ab',
    matches: (job) =>
      /paraview/i.test(`${job?.name ?? ''} ${job?.appId ?? ''}`),
    parse: parseParaviewSession,
    // the session is DCV underneath, and DCV refuses to be framed
    framable: false,
    whatIs:
      "An interactive ParaView session on this job's compute node. It stops when the job does.",
    openLabel: 'ParaView',
    docs: {
      bannerText: 'The ParaView documentation, from Kitware.',
      url: 'https://docs.paraview.org/en/latest/',
    },
  },
];

/** the entry a job belongs to, or nothing — first match wins */
export const sessionAppFor = (
  job?: Pick<Jobs.Job, 'name' | 'appId'>
): SessionAppSpec | undefined =>
  job ? SESSION_APPS.find((spec) => spec.matches(job)) : undefined;
