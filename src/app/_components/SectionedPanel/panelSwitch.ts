// Panel registry + request bus for the SectionedPanel family.
//
// The panels (Settings, Pods Admin, …) are hosted in different places —
// Settings by the Sidebar, Pods Admin by the pods nav — so a footer switcher
// inside one panel can't reach the other's state directly. Instead panels
// REQUEST each other through this bus and the owning host opens it.
//
// Two things this has to survive, both learned the hard way:
//   * the target panel's MODULE may not be loaded yet (Settings is lazy), so
//     the registry is static here rather than self-registered on import —
//     otherwise the switcher's contents depend on what you happened to open;
//   * the target's HOST may not be mounted yet (Pods Admin only exists on
//     pods pages), so a request carries an optional route and PARKS until a
//     host claims it — the host claims on mount as well as live.
import { getPodsAdminMode } from 'utils/podsAdminMode';

export interface PanelDescriptor {
  id: string;
  label: string;
  /** One-line "what lives here", shown under the label in the switcher. */
  blurb: string;
  accent: string;
  /** Route whose host owns this panel; pushed before the request when set. */
  route?: string;
  /** False hides it from every switcher (e.g. admin mode off). */
  available?: () => boolean;
}

const PANELS: PanelDescriptor[] = [
  {
    id: 'settings',
    label: 'Settings',
    blurb: 'session, tenants, profile, app & system store, preferences',
    accent: '#9d85ef',
  },
  {
    id: 'pods-admin',
    label: 'Pods Admin',
    blurb: 'tenant-wide health, metrics, roles, storage, audit, export',
    accent: '#F5820B',
    route: '/pods',
    available: () => getPodsAdminMode(),
  },
];

export const listPanels = (): PanelDescriptor[] =>
  PANELS.filter((p) => (p.available ? p.available() : true));

export const getPanel = (id: string) => PANELS.find((p) => p.id === id);

// Returns true when this listener actually owns (and opened) the panel — the
// caller uses that to decide whether the request still needs to park.
type Listener = (id: string) => boolean;
const listeners = new Set<Listener>();

// A request nobody claimed yet (host still mounting after a route change).
// Short-lived on purpose: a stale request must never pop a panel open minutes
// later because the user happened to navigate.
const PENDING_TTL_MS = 4000;
let pending: { id: string; at: number } | null = null;

const deliver = (id: string): boolean => {
  let claimed = false;
  listeners.forEach((fn) => {
    if (fn(id)) claimed = true;
  });
  return claimed;
};

/**
 * Host side: open my panel when someone asks for it. Also claims a parked
 * request on mount, which is what makes cross-route switching work.
 */
export const subscribePanelRequests = (
  ids: string[],
  fn: (id: string) => void
): (() => void) => {
  const listener: Listener = (id) => {
    if (!ids.includes(id)) return false;
    fn(id);
    return true;
  };
  listeners.add(listener);
  if (pending && ids.includes(pending.id)) {
    if (Date.now() - pending.at < PENDING_TTL_MS) {
      const { id } = pending;
      pending = null;
      // after paint, so the host finishes mounting before it opens
      setTimeout(() => fn(id), 0);
    } else {
      pending = null;
    }
  }
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Panel side: take me to another panel. Navigates first when the panel lives
 * on a route (navigate is the host's history.push, passed in), then parks the
 * request so the arriving host can claim it.
 */
export const requestPanel = (
  id: string,
  navigate?: (route: string) => void
) => {
  const target = getPanel(id);
  pending = { id, at: Date.now() };
  if (target?.route && navigate) navigate(target.route);
  // a host mounted right now claims it immediately; otherwise it stays parked
  if (deliver(id)) pending = null;
};
