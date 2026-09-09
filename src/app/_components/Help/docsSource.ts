/**
 * docsSource — which manual the docs buttons open.
 *
 * Two sources exist for most Tapis services: the narrative ReadTheDocs
 * guide, and Live-Docs — the service's rendered OpenAPI specification.
 * Which one a person wants is a taste that holds across pages, so
 * it is one browser-local preference: the Settings row writes it, and the
 * "Switch to …" press inside any docs drawer writes the same store, which
 * also flips every drawer already open.
 *
 * Module-level store, same pattern as infoDetail.
 */
import { useSyncExternalStore } from 'react';

export type DocsSource = 'rtd' | 'live';

export const DOCS_SOURCE_LABELS: Record<DocsSource, string> = {
  rtd: 'ReadTheDocs',
  live: 'Live-Docs',
};

const KEY = 'ui.docsSource';

const read = (): DocsSource => {
  try {
    return window.localStorage.getItem(KEY) === 'live' ? 'live' : 'rtd';
  } catch {
    return 'rtd';
  }
};

let _source = read();
const _listeners = new Set<() => void>();

export const getDocsSource = (): DocsSource => _source;

export const setDocsSource = (source: DocsSource) => {
  if (source === _source) return;
  _source = source;
  try {
    window.localStorage.setItem(KEY, source);
  } catch {
    /* it still holds for this visit */
  }
  _listeners.forEach((fn) => fn());
};

export const subscribeDocsSource = (listener: () => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};

export const useDocsSource = (): DocsSource =>
  useSyncExternalStore(subscribeDocsSource, getDocsSource);

/** one doc, one complete sentence for the banner — no trailing lists */
type DocEntry = { url: string; line: string };

export type ServiceDocs = {
  /** the drawer title, and the doc chip's accessible name */
  title: string;
  rtd?: DocEntry;
  live?: DocEntry;
};

const RTD = 'https://tapis.readthedocs.io/en/latest/technical';
const LIVE = 'https://tapis-project.github.io/live-docs/?service=';

// a specification to read, not a console to press — the try-it side needs
// tenant specs this deployment does not serve yet
const liveLine = (name: string) =>
  `The live ${name} OpenAPI specification: every endpoint, parameter, and schema.`;

export const SERVICE_DOCS = {
  systems: {
    title: 'Tapis Systems',
    rtd: {
      url: `${RTD}/systems.html`,
      line: 'The official guide to Tapis Systems, from registering a host to credentials and queues.',
    },
    live: { url: `${LIVE}Systems`, line: liveLine('Systems') },
  },
  files: {
    title: 'Tapis Files',
    rtd: {
      url: `${RTD}/files.html`,
      line: 'The official guide to Tapis Files, from listings and transfers to permissions and postits.',
    },
    live: { url: `${LIVE}Files`, line: liveLine('Files') },
  },
  apps: {
    title: 'Tapis Apps',
    rtd: {
      url: `${RTD}/apps.html`,
      line: 'The official guide to Tapis Apps, from runnable definitions to versions and sharing.',
    },
    live: { url: `${LIVE}Apps`, line: liveLine('Apps') },
  },
  jobs: {
    title: 'Tapis Jobs',
    rtd: {
      url: `${RTD}/jobs.html`,
      line: 'The official guide to Tapis Jobs, from submission through statuses to archiving.',
    },
    live: { url: `${LIVE}Jobs`, line: liveLine('Jobs') },
  },
  authenticator: {
    title: 'Tapis Authenticator',
    rtd: {
      url: `${RTD}/authentication.html#oauth-clients`,
      line: 'The official guide to Tapis authentication, including OAuth clients and tokens.',
    },
    live: { url: `${LIVE}Authenticator`, line: liveLine('Authenticator') },
  },
  sk: {
    title: 'Security Kernel',
    rtd: {
      url: `${RTD}/security.html`,
      line: 'The official guide to the Security Kernel, covering roles, permissions, and secrets.',
    },
    live: { url: `${LIVE}SK`, line: liveLine('Security Kernel') },
  },
} satisfies Record<string, ServiceDocs>;

export type ServiceDocKey = keyof typeof SERVICE_DOCS;
