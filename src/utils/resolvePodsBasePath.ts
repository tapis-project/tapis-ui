import { resolveBasePath } from './resolveBasePath';

/**
 * Dev-only override for Pods-service calls (via a same-origin Vite proxy).
 *
 * Set `VITE_PODS_BASE_URL` to the local Pods service ORIGIN (the minikube NodePort), e.g.:
 *
 *   VITE_PODS_BASE_URL = "http://192.168.49.2:30080"
 *
 * When set, Pods calls are sent to the **dev server itself** (`window.location.origin`), and Vite's
 * dev proxy forwards `/v3/pods` to that target — see `vite/vite.config.mts`. Same-origin means there
 * is no CORS preflight at all, and because the request reaches the service as `localhost`,
 * tapisservice's local-dev path resolves the Tapis tenant from your **token** (no Host/tenant
 * rewrite needed). Hitting the raw IP directly instead fails with a CORS/preflight error and
 * `BaseTapisError('invalid tenant id')`, which is why we proxy.
 *
 * `useTapisConfig` skips its basePath↔tenant logout check for localhost basePaths (matching the
 * server's local-dev behaviour), so this override no longer logs you out.
 *
 * Only the Pods subtree consumes this (see `src/app/Pods/_Layout/Layout.tsx`), so login and every
 * other service keep using the global base URL. Unset → normal base path. The proxy + Host rewrite
 * only run under `pnpm dev` (the Vite dev server); production builds ignore all of this.
 */
/** The raw VITE_PODS_BASE_URL override, if set (used for UI indicators). */
export const getPodsBaseUrlOverride = (): string | undefined =>
  (import.meta.env.VITE_PODS_BASE_URL as string | undefined) || undefined;

export const resolvePodsBasePath = (): string => {
  const override = getPodsBaseUrlOverride();
  if (override) {
    // Same-origin: the dev server proxies /v3/pods to the local service (see vite.config.mts).
    return window.location.origin;
  }
  return resolveBasePath();
};
