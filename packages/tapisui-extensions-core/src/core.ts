import * as React from 'react';
import { WorkflowsCustomizations } from './workflows';
import { OAuth, AuthMethod } from './oauth2';
import { McpServerEntry } from './mcp';
import { HostedEndpointEntry } from './hosted';

export enum EnumTapisCoreService {
  Systems = 'systems',
  Files = 'files',
  Apps = 'apps',
  Pobs = 'jobs',
  Workflows = 'workflows',
  Mlhub = 'mlhub',
  Pods = 'pods',
}

export type Logo = {
  url?: string;
  filePath?: string;
  text?: string;
};
export type Icon = {
  url?: string;
  filePath?: string;
  text?: string;
};

export type ComponentProps = React.PropsWithChildren<{
  accessToken: string | undefined;
}>;

/**
 * A service page. The lazy form is the one to reach for.
 *
 * Every extension is imported at boot so the active one can be resolved from
 * the base path, and an extension that names its pages with a plain import
 * drags their whole dependency tree into the entry bundle — for every
 * deployment, including the ones where that extension is never active. GEO
 * did exactly that with leaflet. `React.lazy` keeps the extension's config
 * (small, and genuinely needed at boot) separate from its pages (large, and
 * needed only if someone navigates there).
 *
 *   const GEO = React.lazy(() => import('./pages/GEO'));
 *
 * The router renders these inside a Suspense boundary, so a lazy component
 * needs nothing else from the extension author.
 */
export type Component =
  | React.FC<ComponentProps>
  | React.LazyExoticComponent<React.ComponentType<ComponentProps>>;

export type Service = {
  id: string;
  sidebarDisplayName: string;
  icon?: string;
  iconName?: string;
  component?: Component;
  route?: string;
};

type ServiceCustomizations = {
  workflows?: WorkflowsCustomizations;
};

type betaSidebar = {
  enabled: boolean;
  sections: Array<{
    name: string;
    defaultOpen: boolean;
    minimal?: boolean;
    mainServices: string[];
    secondaryServices?: string[];
  }>;
  noSection?: {
    mainServices: string[];
    secondaryServices?: string[];
  };
};

export type LoginPageLink = {
  label: string;
  url: string;
};

/** Landing content for the login page — the one page every user sees.
 *  All fields optional; the app falls back to generic Tapis copy. */
export type LoginPageConfig = {
  /** Headline; defaults to the extension's logo text or the tenant host. */
  title?: string;
  /** One-line subtitle under the title. */
  tagline?: string;
  /** Short paragraph (2–3 sentences) about this deployment. */
  description?: string;
  /** Quiet footer links — docs, project site, support. */
  links?: LoginPageLink[];
  /** Render the username/password form expanded on production hosts instead
   *  of collapsed behind a disclosure link — for tenants where password auth
   *  is first-class. Localhost always renders it expanded. */
  passwordProminent?: boolean;
};

/** What an unauthenticated visitor gets: which sidebar items exist, where
 *  '/' lands, and the not-logged-in banner.
 *  Absent = today's behavior (everything gated behind login).
 *  Public pages can raise the app's login modal over themselves (e.g. to
 *  gate an in-page action) via `loginPromptState()` from
 *  `@tapis/tapisui-common` — push/replace it as router location state. */
export type PreloginConfig = {
  /** Service ids shown in the sidebar before login, in order. The special id
   *  'login' places the Login item; if omitted it is appended last. Every
   *  listed service (except 'login') renders as a PUBLIC route. */
  sidebarServices: string[];
  /** Route unauthenticated '/' redirects to — must belong to a listed
   *  service. Also where protected-route bounces land (with the login modal
   *  opened over it). Default: '/login'. */
  mainRoute?: string;
  /** Presence enables the not-logged-in alert bar (shown on the mainRoute
   *  page only); text has an app default. */
  banner?: { text?: string };
};

export type TopBarAction = {
  label: string;
  /** an in-app route */
  to?: string;
  /** an external URL, opened in a new tab */
  href?: string;
  title?: string;
};

export type TopBarStrip = {
  /** route prefix: '/insights' matches /insights and /insights/... */
  route: string;
  text: string;
  /** preset base colour; `color` wins when both are set */
  tone?: 'blue' | 'purple' | 'orange' | 'green' | 'grey';
  /** any CSS colour: hex, rgb(), a named colour */
  color?: string;
  intensity?: 'quiet' | 'normal' | 'loud';
  actions?: Array<TopBarAction>;
  /** shows ✕; dismissed for the session, never navigates */
  dismissible?: boolean;
};

export type Configuration = {
  component?: Component;
  allowMultiTenant?: boolean;
  showMLHub?: boolean;
  showMLEdge?: boolean;
  showSecondarySideBar?: boolean;
  authentication?: OAuth;
  loginPage?: LoginPageConfig;
  prelogin?: PreloginConfig;
  mainSidebarServices?: Array<string>;
  authMethods?: Array<AuthMethod>;
  logo?: Logo;
  icon?: Icon;
  serviceCustomizations?: ServiceCustomizations;
  /** Route prefixes whose pages carry their own top navigation, so the
   *  app-level breadcrumb bar is a second stacked header. Merged with the
   *  app's built-in list in src/app/_Layout/breadcrumbRoutes.ts, which is
   *  where the reasoning lives. */
  hideBreadcrumbRoutes?: Array<string>;
  /** Per-route thin bars that REPLACE the breadcrumb bar: one sentence,
   *  the buttons the page wants (a `to` route in the app, or an `href`
   *  opened in a new tab), and a colour. Resolved by longest prefix in
   *  src/app/_Layout/breadcrumbRoutes.ts; a strip beats the hide list. */
  topBar?: Array<TopBarStrip>;
  betaSidebar?: betaSidebar;
  /** MCP servers this deployment contributes to the AI Hub
   *  registry. Merged by id with the app's base registry — extension
   *  entries win, so a deployment can override an entry's status,
   *  endpoint, or notes (or add servers of its own). */
  mcpServers?: Array<McpServerEntry>;
  /** Always-on hosted AI endpoints this deployment contributes to the
   *  AI Hub (merged by id over the app's base catalog, extension
   *  entries win field-by-field). */
  hostedEndpoints?: Array<HostedEndpointEntry>;
};
