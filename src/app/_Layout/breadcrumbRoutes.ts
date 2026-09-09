// ── Breadcrumb opt-out map ────────────────────────────────────────────────────
// THE one glanceable list of route prefixes that hide the app-level breadcrumb
// bar. These pages carry their own top navigation, so the global bar is a
// second stacked header spending vertical space to repeat what the page
// already says.
//
//   prefix     page                  why breadcrumb-less
//   /systems   src/app/Systems/*     page shell owns the header
//   /apps      src/app/Apps/*        page shell owns the header
//   /files     src/app/Files/*       page shell owns the header
//   /jobs      src/app/Jobs/*        page shell owns the header
//
// Pods, MLHub, Workflows and the rest still use the global bar — they have not
// moved to the shell, and taking their breadcrumbs away would leave them with
// no header at all.
export const HIDE_BREADCRUMB_ROUTES: string[] = [
  '/systems',
  '/apps',
  '/files',
  '/jobs',
];

// Checked BEFORE the hide list, so a more specific route can opt back in.
// The V2 file explorer lives under /files but is not on the shell — it has no
// header of its own, so it keeps the global bar that /files gives up.
export const KEEP_BREADCRUMB_ROUTES: string[] = ['/files/v2'];

const matches = (pathname: string, prefixes: string[]): boolean =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

/**
 * `extensionRoutes` lets an extension hide its own pages without editing this
 * file. Nothing passes it yet — the seam is here so the decision stays in one
 * place when one does.
 */
export const shouldHideBreadcrumbs = (
  pathname: string,
  extensionRoutes?: string[]
): boolean => {
  if (matches(pathname, KEEP_BREADCRUMB_ROUTES)) return false;
  return matches(pathname, [
    ...HIDE_BREADCRUMB_ROUTES,
    ...(extensionRoutes ?? []),
  ]);
};
