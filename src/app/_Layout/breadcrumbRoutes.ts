// ── The top bar policy ────────────────────────────────────────────────────────
// THE one place that decides what sits above a page: the breadcrumb bar (the
// default), nothing (pages that carry their own top navigation, where the
// global bar is a second stacked header), or an info strip — one sentence and
// the buttons the page wants, declared by an extension per route.
//
//   prefix     page                  why breadcrumb-less
//   /systems   src/app/Systems/*     page shell owns the header
//   /apps      src/app/Apps/*        page shell owns the header
//   /files     src/app/Files/*       page shell owns the header
//   /jobs      src/app/Jobs/*        page shell owns the header
//   /dashboard src/app/Dashboard/*   its own "Dashboard for <tenant>" header
//   /mlhub     src/app/MLHub/*       its own app bar (MLHubAppBar)
//   /login     src/app/Login/*       the landing page; its brand block is the header
//
// Pods, Workflows and the rest still use the global bar — they have not
// moved to a shell, and taking their breadcrumbs away would leave them with
// no header at all.
//
// Extensions hide their own pages by setting `hideBreadcrumbRoutes:
// ['/myservice']` in their createExtension() configuration, or replace the bar
// with a strip through `topBar: [{ route, text, actions, tone }]`
// (tapisui-extensions-core Configuration). Both meet this list at the one
// render decision in _Layout/Layout.tsx.
import type { TopBarStrip } from '@tapis/tapisui-extensions-core';

export const HIDE_BREADCRUMB_ROUTES: string[] = [
  '/systems',
  '/apps',
  '/files',
  '/jobs',
  '/dashboard',
  '/mlhub',
  '/login',
];

// Checked BEFORE everything else, so a more specific route can opt back in.
// The V2 file explorer lives under /files but is not on the shell — it has no
// header of its own, so it keeps the global bar that /files gives up.
export const KEEP_BREADCRUMB_ROUTES: string[] = ['/files/v2'];

const matchesPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(prefix + '/');

const matches = (pathname: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => matchesPrefix(pathname, prefix));

export type TopBarPolicy =
  | { mode: 'crumbs' }
  | { mode: 'none' }
  | { mode: 'strip'; strip: TopBarStrip };

/** The slice of an Extension the policy reads — kept structural so a test
 *  can hand in a plain object. */
export type TopBarSource = {
  hideBreadcrumbRoutes?: string[];
  topBar?: TopBarStrip[];
};

/**
 * Precedence: keep-list, then an extension strip (longest matching prefix
 * wins, so '/home/detail' can differ from '/home'), then the hide lists,
 * then breadcrumbs. A strip beats the hide list because a page that asked
 * for a strip has said what it wants there.
 */
export const resolveTopBar = (
  pathname: string,
  extension?: TopBarSource
): TopBarPolicy => {
  if (matches(pathname, KEEP_BREADCRUMB_ROUTES)) return { mode: 'crumbs' };
  const strip = (extension?.topBar ?? [])
    .filter((s) => matchesPrefix(pathname, s.route))
    .sort((a, b) => b.route.length - a.route.length)[0];
  if (strip) return { mode: 'strip', strip };
  if (
    matches(pathname, [
      ...HIDE_BREADCRUMB_ROUTES,
      ...(extension?.hideBreadcrumbRoutes ?? []),
    ])
  ) {
    return { mode: 'none' };
  }
  return { mode: 'crumbs' };
};

/** True whenever the breadcrumb bar should not render — a strip counts. */
export const shouldHideBreadcrumbs = (
  pathname: string,
  extensionRoutes?: string[]
): boolean =>
  resolveTopBar(pathname, { hideBreadcrumbRoutes: extensionRoutes }).mode !==
  'crumbs';
