/**
 * Path bar above a file listing: breadcrumb segments, copy buttons, history
 * and up navigation, and a text field for typing a path. Long paths collapse
 * in the middle.
 */
import React, {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Box,
  Breadcrumbs,
  Divider,
  InputBase,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessTimeRounded,
  ArrowBackRounded,
  ArrowDropDownRounded,
  ArrowForwardRounded,
  ArrowUpwardRounded,
  ContentCopyRounded,
  DoneRounded,
  EditRounded,
  LinkRounded,
} from '@mui/icons-material';
import { useHistory, useLocation } from 'react-router-dom';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import HostEvalRailButton from './Toolbar/HostEvalRailButton';
import PlacesRailButton, { type Landmarks } from './Toolbar/PlacesRailButton';
import { PAPER_TOOLTIP } from './Toolbar/ToolbarV2';
import { canHostEval, describeSystemRoot, hostEvalBlocker } from './hostEval';
import { timeAgo } from 'app/_components/NavV2Kit/navKit';
import {
  canGoBack,
  canGoForward,
  FILES_TRAIL,
  getFilesHistory,
  goToFilesHistory,
  replaceNextVisit,
  stepFilesHistory,
  subscribeFilesHistory,
  visitFilesLocation,
} from './filesHistory';

const SEGMENT_SX = {
  fontFamily: 'monospace',
  fontSize: '0.74rem',
  lineHeight: 1.6,
  whiteSpace: 'nowrap',
} as const;

/** `/files/frontera/scratch/01/jdoe` for the first n segments. */
export const filesRoute = (systemId: string, segments: string[]): string =>
  [
    '/files',
    encodeURIComponent(systemId),
    ...segments.map(encodeURIComponent),
  ].join('/');

export const pathSegments = (path?: string): string[] =>
  (path ?? '').split('/').filter(Boolean);

/**
 * Inverse of filesRoute. filesRoute percent-encodes each segment, and
 * react-router 5 returns route parameters still encoded. The Files client
 * encodes `path` again, so decode here to avoid double encoding
 * (`my folder` would be requested as `my%2520folder`).
 *
 * Decoded per segment: a decoded segment may contain `/`, and decoding the
 * joined path would create a directory boundary that does not exist.
 */
export const decodeSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    // a `%` that is not an escape (`100%done`) makes decodeURIComponent throw; keep the raw segment
    return segment;
  }
};

export const pathFromRoute = (systemPath?: string): string =>
  pathSegments(systemPath).map(decodeSegment).join('/') || '/';

/**
 * The folder a /files/<system>/<path> URL is in, decoded, for write
 * operations (new folder, upload, rename, move, delete). The root is '' so
 * `${path}/${name}` has a single leading slash. Goes through pathFromRoute
 * because route segments are still percent-encoded.
 */
export const folderFromPathname = (pathname: string): string => {
  const folder = pathFromRoute(pathname.split('/').slice(3).join('/'));
  return folder === '/' ? '' : folder;
};

/**
 * Resolves text typed into the path bar to a destination. Accepts an absolute
 * `/scratch/01`, a full `tapis://frontera/scratch/01` (system included, as
 * the copy button produces), or a relative `data/run7` or `../logs`
 * resolved against the current directory. `..` above the top stays at the
 * top; empty input is not a destination.
 */
export const parsePathInput = (
  raw: string,
  systemId: string,
  segments: string[]
): { systemId: string; segments: string[] } | undefined => {
  const text = raw.trim();
  if (!text) {
    return undefined;
  }
  let targetSystem = systemId;
  let base: string[];
  let rest: string;
  const tapis = text.match(/^tapis:\/\/([^/]+)(\/.*)?$/i);
  if (tapis) {
    targetSystem = tapis[1];
    base = [];
    rest = tapis[2] ?? '/';
  } else if (text.startsWith('/')) {
    base = [];
    rest = text;
  } else {
    base = segments;
    rest = text;
  }
  const resolved = [...base];
  for (const part of rest.split('/')) {
    if (!part || part === '.') {
      continue;
    }
    if (part === '..') {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return { systemId: targetSystem, segments: resolved };
};

/** the two copy buttons and the edit toggle (quieter than the nav arrows) */
const BAR_ICON_BTN_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 20,
  width: 20,
  p: 0,
  border: 'none',
  borderRadius: '4px',
  bgcolor: 'transparent',
  color: 'text.disabled',
  cursor: 'pointer',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' },
  '& svg': { fontSize: 13, display: 'block' },
} as const;

const CopyButton: React.FC<
  React.PropsWithChildren<{ label: string; text: string }>
> = ({ label, text, children }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={copied ? 'copied' : label}>
      <Box
        component="button"
        type="button"
        aria-label={label}
        onClick={() => {
          navigator.clipboard?.writeText(text).catch(() => {});
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
        sx={BAR_ICON_BTN_SX}
      >
        {copied ? <DoneRounded sx={{ color: '#1b7f3b' }} /> : children}
      </Box>
    </Tooltip>
  );
};

/**
 * A real anchor so middle-click and cmd-click open a tab; left click goes
 * to the router. forwardRef and prop spread are required because the system
 * crumb is inside a Tooltip, which clones its child with a ref and hover
 * listeners.
 */
const Crumb = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<{ to: string; onGo?: () => void }> &
    React.HTMLAttributes<HTMLAnchorElement>
>(({ to, onGo, children, ...tooltipProps }, ref) => {
  const history = useHistory();
  return (
    <Box
      component="a"
      ref={ref}
      {...tooltipProps}
      // keep the href even in place: cmd-click and middle-click open the directory on the Files page
      href={`/#${to}`}
      onClick={(event: React.MouseEvent) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        if (onGo) onGo();
        else history.push(to);
      }}
      sx={{
        ...SEGMENT_SX,
        color: 'text.secondary',
        textDecoration: 'none',
        px: 0.4,
        py: '1px',
        borderRadius: '3px',
        // fill instead of underline
        '&:hover': { color: 'text.primary', bgcolor: 'rgba(0,0,0,0.06)' },
      }}
    >
      {children}
    </Box>
  );
});
Crumb.displayName = 'Crumb';

/** The three arrows, and the caret that opens the trail. */
const NAV_BUTTON_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  // fixed height, shared with the go-to button beside them
  height: 22,
  boxSizing: 'border-box',
  px: '3px',
  py: 0,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '4px',
  bgcolor: 'transparent',
  color: 'text.secondary',
  cursor: 'pointer',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' },
  '&:disabled': {
    cursor: 'default',
    color: 'text.disabled',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  // block, not inline: an inline svg reserves descender space below it
  '& svg': { fontSize: 15, display: 'block' },
} as const;

const NavButton: React.FC<
  React.PropsWithChildren<{
    label: string;
    title: React.ReactNode;
    disabled?: boolean;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    sx?: Record<string, unknown>;
  }>
> = ({ label, title, disabled, onClick, sx, children }) => (
  <Tooltip title={title}>
    {/* a disabled button cannot hold a tooltip, so the span does */}
    <span style={{ display: 'inline-flex' }}>
      <Box
        component="button"
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        sx={{ ...NAV_BUTTON_SX, ...(sx ?? {}) }}
      >
        {children}
      </Box>
    </span>
  </Tooltip>
);

/** '/files/frontera/scratch/01' → 'frontera /scratch/01', for the trail menu */
export const describeFilesLocation = (location: string): string => {
  const [, , system, ...rest] = location.split('/');
  const system_ = decodeSegment(system ?? '');
  const path = rest.map(decodeSegment).join('/');
  return path ? `${system_} /${path}` : system_;
};

/**
 * Navigation moves (back, forward, up, go to) shared by the path bar buttons
 * and the listing's keyboard handlers, so both use the same logic.
 */
export const useFilesNavigation = (
  systemId: string,
  trailKey: string = FILES_TRAIL,
  onNavigate?: (path: string, systemId: string) => void,
  /** where you are, so back has somewhere to fall through to */
  path?: string
) => {
  const history = useHistory();
  const trail = useSyncExternalStore(
    subscribeFilesHistory,
    useCallback(() => getFilesHistory(trailKey), [trailKey])
  );

  /** Somewhere in the trail, expressed as a route. */
  const goToRoute = useCallback(
    (route: string) => {
      if (!onNavigate) {
        history.push(route);
        return;
      }
      // include the system: a trail can cross systems (a job page browses an archive directory on another one)
      const parts = route.split('/');
      onNavigate(
        `/${parts.slice(3).map(decodeSegment).join('/')}`,
        decodeSegment(parts[2] ?? '')
      );
    },
    [history, onNavigate]
  );

  const step = useCallback(
    (delta: number) => {
      const target = stepFilesHistory(trailKey, delta);
      if (target) goToRoute(target);
    },
    [trailKey, goToRoute]
  );

  const segments = pathSegments(path);

  /**
   * Back, then up. With no trail behind, back climbs one directory per
   * press until the top of the system. The climb replaces the trail's
   * current entry instead of appending; appending would make the next back
   * return to the child.
   */
  const back = useCallback(() => {
    if (canGoBack(trailKey)) {
      step(-1);
      return;
    }
    if (!segments.length) return;
    replaceNextVisit(trailKey);
    goToRoute(filesRoute(systemId, segments.slice(0, -1)));
    // segments is rebuilt each render, so compare by content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailKey, step, goToRoute, systemId, segments.join('/')]);

  /** the top of this system, wherever the bar happens to be driving */
  const top = useCallback(
    () => goToRoute(filesRoute(systemId, [])),
    [goToRoute, systemId]
  );

  /**
   * One directory up, independent of the trail. Replaces the trail's current
   * entry for the same reason back's climb does.
   */
  const up = useCallback(() => {
    if (!segments.length) return;
    replaceNextVisit(trailKey);
    goToRoute(filesRoute(systemId, segments.slice(0, -1)));
    // segments is rebuilt each render, so compare by content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailKey, goToRoute, systemId, segments.join('/')]);

  return {
    trail,
    goToRoute,
    step,
    back,
    top,
    up,
    /** history, or a directory above this one */
    canGoBack: canGoBack(trailKey) || segments.length > 0,
    canGoForward: canGoForward(trailKey),
  };
};

const FilesBreadcrumbs: React.FC<{
  systemId: string;
  path?: string;
  /**
   * Browse in place instead of routing to /files (for example a job's output
   * listing). Up, back, forward and the trail work the same.
   */
  onNavigate?: (path: string, systemId: string) => void;
  /** which trail this bar keeps; separate browsers keep separate ones */
  trail?: string;
  /**
   * A tree with known landmarks instead of a Tapis system (for example a
   * pod container: root, mounts, config files). The Go To rail offers
   * these and the bar makes no Systems service request.
   */
  landmarks?: Landmarks;
  /** anything that should sit at the right end of the bar */
  children?: React.ReactNode;
}> = ({
  systemId,
  path,
  onNavigate,
  trail: trailKey = FILES_TRAIL,
  landmarks,
  children,
}) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const {
    trail,
    goToRoute,
    step,
    back,
    canGoBack: backAvailable,
  } = useFilesNavigation(systemId, trailKey, onNavigate, path);
  const [trailAnchor, setTrailAnchor] = useState<HTMLElement | null>(null);

  // Edit mode: the crumbs become a text field holding the path. Enter goes there, Escape or blur cancels. Started from the pencil or by clicking the bar's empty tail.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const plainPath = pathSegments(path).length
    ? `/${pathSegments(path).join('/')}`
    : '/';
  const tapisAddress = `tapis://${systemId}${plainPath}`;
  const startEditing = () => {
    setDraft(plainPath);
    setEditing(true);
  };
  const commitEdit = () => {
    setEditing(false);
    const target = parsePathInput(draft, systemId, pathSegments(path));
    if (!target) {
      return;
    }
    goToRoute(filesRoute(target.systemId, target.segments));
  };

  // Same rule as the file rail: $HOME applies only to a Linux system with a per-user effective id not rooted below /. Disabled, not hidden, so the bar keeps its shape.
  const { data: systemData } = SystemsHooks.useDetails(
    {
      systemId,
      select: 'allAttributes',
    },
    // a tree with its own landmarks is not a system; asking would 404
    { enabled: !landmarks }
  );
  const system = systemData?.result ?? undefined;
  const segments = pathSegments(path);
  const parent = segments.slice(0, -1);
  const atRoot = segments.length === 0;

  // In place, the props are the location; on the Files page the URL is. Both are recorded as routes so one trail model serves both.
  const here = onNavigate ? filesRoute(systemId, segments) : pathname;
  const browsing = Boolean(onNavigate) || pathname.startsWith('/files/');

  useEffect(() => {
    if (!browsing) return;
    visitFilesLocation(trailKey, here, history.action === 'POP');
  }, [browsing, trailKey, here, history.action]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        // sits above a pane that takes the remaining height, so it must not shrink
        flexShrink: 0,
        // no top inset: the shell's right-pane margin is the page's
        pt: 0,
        // space above the table header
        pb: 0.75,
      }}
    >
      {/* Landmarks: $HOME when the system can resolve it, and the top of the tree. On a system that cannot resolve $HOME, the top is the only action and is enabled. */}
      {landmarks ? (
        <PlacesRailButton
          systemId={systemId}
          landmarks={landmarks}
          onNavigate={(target, sys) =>
            goToRoute(filesRoute(sys, pathSegments(target)))
          }
          atTop={atRoot}
        />
      ) : (
        <HostEvalRailButton
          systemId={systemId}
          isAuthenticated={canHostEval(system)}
          disabledReason={hostEvalBlocker(system)}
          onNavigate={onNavigate}
          onTop={() => goToRoute(filesRoute(systemId, []))}
          atTop={atRoot}
        />
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />

      {browsing && (
        <>
          <NavButton
            label="Back"
            title={
              canGoBack(trailKey)
                ? `Back to ${describeFilesLocation(
                    trail.entries[trail.index - 1].location
                  )}`
                : backAvailable
                ? 'No history. Goes up a directory instead'
                : 'Nowhere to go back to'
            }
            disabled={!backAvailable}
            onClick={back}
          >
            <ArrowBackRounded />
          </NavButton>
          <NavButton
            label="Forward"
            title={
              canGoForward(trailKey)
                ? `Forward to ${describeFilesLocation(
                    trail.entries[trail.index + 1].location
                  )}`
                : 'Nothing ahead'
            }
            disabled={!canGoForward(trailKey)}
            onClick={() => step(1)}
          >
            <ArrowForwardRounded />
          </NavButton>
          <NavButton
            label="Recent locations"
            title="Everywhere you have been this session"
            disabled={trail.entries.length < 2}
            onClick={(event) => setTrailAnchor(event.currentTarget)}
            sx={{ px: 0 }}
          >
            <ArrowDropDownRounded />
          </NavButton>
          <Menu
            anchorEl={trailAnchor}
            open={Boolean(trailAnchor)}
            onClose={() => setTrailAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{ paper: { sx: { minWidth: 280, maxWidth: 460 } } }}
          >
            <Typography
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              Recent locations
            </Typography>
            <Divider />
            {/* newest first */}
            {trail.entries
              .map((entry, index) => ({ entry, index }))
              .reverse()
              .map(({ entry, index }) => {
                const here = index === trail.index;
                const [system, ...rest] = describeFilesLocation(
                  entry.location
                ).split(' /');
                return (
                  <MenuItem
                    key={`${entry.location}-${index}`}
                    dense
                    selected={here}
                    onClick={() => {
                      setTrailAnchor(null);
                      const target = goToFilesHistory(trailKey, index);
                      if (target) goToRoute(target);
                    }}
                    sx={{ py: 0.5, gap: 1.25, alignItems: 'baseline' }}
                  >
                    {/* system, then the path under it */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.74rem',
                          fontWeight: here ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          direction: 'rtl',
                          textAlign: 'left',
                        }}
                      >
                        {/* rtl so a long path truncates at the front */}
                        {rest.length ? `/${rest.join(' /')}` : '/'}
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.64rem', color: 'text.secondary' }}
                      >
                        {system}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.25,
                        flexShrink: 0,
                        fontSize: '0.64rem',
                        color: 'text.disabled',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <AccessTimeRounded sx={{ fontSize: 11 }} />
                      {timeAgo(entry.at)}
                    </Box>
                  </MenuItem>
                );
              })}
          </Menu>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
        </>
      )}

      <NavButton
        label="Up one directory"
        title={
          atRoot
            ? landmarks
              ? `This is the root of ${systemId}`
              : `${systemId} is the top of this system`
            : `Up to ${parent.length ? `/${parent.join('/')}` : systemId}`
        }
        disabled={atRoot}
        onClick={() => goToRoute(filesRoute(systemId, parent))}
      >
        <ArrowUpwardRounded />
      </NavButton>

      {editing ? (
        <InputBase
          autoFocus
          fullWidth
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitEdit();
            } else if (event.key === 'Escape') {
              setEditing(false);
            }
          }}
          // blur cancels the edit; nothing navigates (same as Escape)
          onBlur={() => setEditing(false)}
          inputProps={{ 'aria-label': 'Path', spellCheck: false }}
          sx={{
            flex: 1,
            minWidth: 0,
            height: 22,
            fontFamily: 'monospace',
            fontSize: '0.74rem',
            border: '1px solid',
            borderColor: 'rgba(21,101,192,0.5)',
            borderRadius: '4px',
            px: 0.75,
            bgcolor: 'background.paper',
            '& input': { p: 0 },
          }}
        />
      ) : (
        <>
          <Breadcrumbs
            // keep the two ends; collapse the middle of deep paths
            maxItems={5}
            itemsBeforeCollapse={1}
            itemsAfterCollapse={2}
            separator={
              <Box
                component="span"
                sx={{ ...SEGMENT_SX, color: 'text.disabled' }}
              >
                /
              </Box>
            }
            sx={{
              minWidth: 0,
              '& .MuiBreadcrumbs-separator': { mx: 0.25 },
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'nowrap',
                overflow: 'hidden',
              },
              '& .MuiBreadcrumbs-li': { minWidth: 0 },
            }}
          >
            {/* At the top of a system the system is the current directory and
            reads like one. The system crumb is where "top of this system"
            gets a path; a system rooted at /work/01234 does not put you at /. */}
            <Tooltip
              arrow
              disableInteractive
              enterDelay={500}
              title={
                <Box sx={{ maxWidth: 260 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                    {landmarks ? landmarks.title : `Top of ${systemId}`}
                  </Typography>
                  {(landmarks
                    ? landmarks.rootLines
                    : describeSystemRoot(systemId, system)
                  ).map((line) => (
                    <Typography
                      key={line}
                      sx={{ fontSize: '0.68rem', color: 'text.secondary' }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              }
              componentsProps={PAPER_TOOLTIP}
            >
              {atRoot ? (
                <Typography
                  sx={{
                    ...SEGMENT_SX,
                    fontWeight: 600,
                    color: 'text.primary',
                    px: 0.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {systemId}
                </Typography>
              ) : (
                <Crumb
                  to={filesRoute(systemId, [])}
                  onGo={onNavigate && (() => onNavigate('/', systemId))}
                >
                  {systemId}
                </Crumb>
              )}
            </Tooltip>
            {segments.map((segment, index) =>
              index === segments.length - 1 ? (
                <Typography
                  key={`${segment}-${index}`}
                  sx={{
                    ...SEGMENT_SX,
                    fontWeight: 600,
                    color: 'text.primary',
                    px: 0.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {segment}
                </Typography>
              ) : (
                <Crumb
                  key={`${segment}-${index}`}
                  to={filesRoute(systemId, segments.slice(0, index + 1))}
                  onGo={
                    onNavigate &&
                    (() =>
                      onNavigate(
                        `/${segments.slice(0, index + 1).join('/')}`,
                        systemId
                      ))
                  }
                >
                  {segment}
                </Crumb>
              )
            )}
          </Breadcrumbs>

          {/* copy the bare path, or the tapis:// address (includes the system); the pencil starts typing a path */}
          <CopyButton label={`Copy ${plainPath}`} text={plainPath}>
            <ContentCopyRounded />
          </CopyButton>
          {!landmarks?.noAddress && (
            <CopyButton label={`Copy ${tapisAddress}`} text={tapisAddress}>
              <LinkRounded />
            </CopyButton>
          )}
          <Tooltip title="Type a path. Enter goes there. tapis://system/path jumps systems">
            <Box
              component="button"
              type="button"
              aria-label="Edit the path"
              onClick={startEditing}
              sx={BAR_ICON_BTN_SX}
            >
              <EditRounded sx={{ fontSize: 12 }} />
            </Box>
          </Tooltip>
          {/* the empty tail of the bar also starts editing */}
          <Box
            onClick={startEditing}
            sx={{ flex: 1, alignSelf: 'stretch', cursor: 'text' }}
          />
        </>
      )}

      {children}
    </Box>
  );
};

export default FilesBreadcrumbs;
