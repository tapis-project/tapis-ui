import type { TopBarAction, TopBarStrip } from '@tapis/tapisui-extensions-core';
import { CATALOGS, DOAAS } from './pages/IcicleServicesV2/catalogs';

// Portal pages show a strip instead of breadcrumbs: one line about the page, a
// link back to the Services Board, and an open-in-tab link for embedded pages.
// The line comes from the board catalog; pages it omits are listed below.
// src/app/_Layout/breadcrumbRoutes.ts picks the strip for a route.
const BOARD_BLUE = '#2f7fd1';
const backToBoard: TopBarAction = { label: 'Services Board', to: '/home' };
const openInTab = (href: string): TopBarAction => ({
  label: 'Open in tab ↗',
  href,
});
const portalStrip = (
  route: string,
  text: string,
  ...more: TopBarAction[]
): TopBarStrip => ({
  route,
  text,
  color: BOARD_BLUE,
  actions: [backToBoard, ...more],
  // the strip returns on the next visit
  dismissible: true,
});

/** the URL each embedded page frames, matching its page component */
const EMBEDS: Record<string, string> = {
  '/earth-data-hub': 'https://earthdatahub.pods.icicleai.tapis.io/',
  '/feast': 'https://feast.pods.icicleai.tapis.io/',
  '/food-flow-portal': 'https://gnnfoodflowportal.pods.icicleai.tapis.io/',
  '/food-security-sandbox': 'https://fss.pods.icicleai.tapis.io/',
  '/harvest': 'https://harvest.pods.icicleai.tapis.io/',
  '/icicle-chatbook': 'https://iciclechatbook.pods.icicleai.tapis.io/',
  '/intelligent-edge-management-service':
    'https://edgecontrolplane.pods.icicleai.tapis.io',
  '/isaw-portal': 'https://isawfrontendprod.pods.icicleai.tapis.io/',
  '/no-code-image-lab': 'https://nocodeimagelab.pods.icicleai.tapis.io/',
  '/no-code-workflow-studio': 'https://workflowstudio.pods.icicleai.tapis.io/',
  '/openpass': 'https://reroutlab.org/ei/',
  '/smart-labeler': 'https://smartlabelerdetection.pods.icicleai.tapis.io/',
  '/smart-segmentation':
    'https://smartlabelersegmentation.pods.icicleai.tapis.io/',
  '/insights': 'https://insights.pods.icicleai.tapis.io',
  '/training-catalog':
    'https://icicle-ai.github.io/training-catalog/docs/intro',
  '/open-webui': 'https://openwebui.pods.tacc.develop.tapis.io/',
  '/component-catalog': 'https://componentcatalog.pods.icicleai.tapis.io',
  '/ckn-dashboard': 'https://ckndashboard.pods.icicleai.tapis.io/',
  '/patra': 'https://patra.pods.icicleai.tapis.io',
  '/science-agents': 'https://scienceagent.pods.icicleai.tapis.io/',
};

// ML Hub is a TapisUI page and keeps its own chrome
const isPortalRoute = (href?: string): href is string =>
  !!href && href.startsWith('/') && !href.startsWith('/mlhub');

export const portalStrips = (): TopBarStrip[] => {
  const byRoute = new Map<string, TopBarStrip>();
  const add = (strip: TopBarStrip) => {
    if (!byRoute.has(strip.route)) byRoute.set(strip.route, strip);
  };
  const withEmbed = (route: string, text: string) =>
    EMBEDS[route]
      ? portalStrip(route, text, openInTab(EMBEDS[route]))
      : portalStrip(route, text);

  // the six as-a-Service pages the board consolidates
  CATALOGS.forEach((c) =>
    add(
      portalStrip(
        c.sourceRoute,
        `${c.expansion} (${c.code}): the ${c.name} services, also on the board.`
      )
    )
  );
  add(
    portalStrip(
      DOAAS.sourceRoute,
      `${DOAAS.expansion} (${DOAAS.code}): ${DOAAS.intro}`
    )
  );
  // every service the catalog routes inside this portal
  CATALOGS.flatMap((c) => c.items).forEach((item) => {
    if (isPortalRoute(item.href)) {
      // the strip adds a colon, so drop any subtitle after the catalog's own
      const name = (item.name ?? item.label).split(':')[0].trim();
      add(withEmbed(item.href, `${name}: ${item.description}`));
    }
  });
  // the pages the catalog does not list
  [
    [
      '/portal-home',
      'ICICLE-as-a-Service Portal: the original portal home, kept alongside the board.',
    ],
    [
      '/insights',
      'ICICLE Insights: dashboards across the institute, public to everyone.',
    ],
    ['/training-catalog', 'Training Catalog: ICICLE courses and tutorials.'],
    ['/data-labeler', 'Data Labeler: label data for ICICLE models.'],
    ['/open-webui', 'Open WebUI: a chat interface over the hosted models.'],
    [
      '/smart-scheduler',
      'Smart Scheduler: schedule work across ICICLE resources.',
    ],
    ['/component-catalog', 'Catalog: the ICICLE component catalog.'],
    [
      '/ckn-dashboard',
      'CKN Dashboard: the Cyberinfrastructure Knowledge Network, live.',
    ],
    [
      '/patra',
      'Patra Model Cards: information about AI models, datasets and their active use.',
    ],
  ].forEach(([route, text]) => add(withEmbed(route, text)));
  return [...byRoute.values()];
};
