/**
 * The path bar above a file listing: where you are, and one press to leave.
 *
 * The app-level breadcrumb bar used to carry this, but /files opted out of it
 * when the page moved onto the pods-style shell — correct for the bar (it was
 * a second stacked header) and wrong for the path, which is the one piece of
 * that bar a file browser cannot do without. There was no way up a directory
 * at all except editing the URL.
 *
 * So it comes back next to the thing it describes rather than at the top of
 * the window, and reads as a path: monospace segments, dimmed separators, and
 * a hover fill instead of link-blue. A long path collapses in the middle —
 * the two ends are the parts anyone reads.
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

/** `/files/frontera/scratch/01/cgarcia` for the first n segments. */
export const filesRoute = (systemId: string, segments: string[]): string =>
  [
    '/files',
    encodeURIComponent(systemId),
    ...segments.map(encodeURIComponent),
  ].join('/');

export const pathSegments = (path?: string): string[] =>
  (path ?? '').split('/').filter(Boolean);

/**
 * What someone typed into the path bar, resolved to a destination.
 *
 * Three spellings, the ones a path already travels as: an absolute
 * `/scratch/01`, a full `tapis://frontera/scratch/01` (system included —
 * the same address the copy button hands out), and a relative `data/run7`
 * or `../logs` resolved against where you stand. Dot-dots above the top
 * just stay at the top; empty input is not a destination.
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

/** the two copy buttons and the edit toggle — quieter than the nav arrows */
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
    // the tooltip carries the exact text the press will hand over — an
    // address you can read before you take it
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
 * A real anchor so middle-click and ⌘-click open a tab, with the left click
 * handed to the router — the same bargain the landing tables' links make.
 *
 * forwardRef + prop spread because the system crumb sits inside a Tooltip:
 * MUI clones its child with a ref and hover listeners, and a plain function
 * component swallowed both — a console warning, and a tooltip that never
 * actually opened on this branch.
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
      // even in-place, the crumb keeps its href: ⌘-click and middle-click open
      // the same directory on the Files page, which is what an address does
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
        // a fill rather than an underline: a path is already a row of small
        // words, and five underlines in it read as damage
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
  // a fixed height, shared with the go-to pill beside them: left to their
  // padding they came out a pixel shorter, which reads as the pill sitting
  // low rather than as the arrows sitting high
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
  // block, not the default inline: an inline svg sits on a text baseline and
  // reserves room under itself for a descender that is not there
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
    {/* a disabled button cannot hold a tooltip, so the span takes it —
        inline-flex so the span hugs the button instead of leaving baseline
        space under it and pushing everything a pixel out of line */}
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
  const system_ = decodeURIComponent(system ?? '');
  const path = rest.map(decodeURIComponent).join('/');
  return path ? `${system_} /${path}` : system_;
};

/**
 * Moving around a file browser, wherever the controls for it happen to be.
 *
 * The path bar owns the buttons, but the listing wants the same moves off the
 * keyboard — and two copies of "go back" is how the button and the key end up
 * disagreeing about where back is. So the moves live here and both use them.
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
      // the system travels with the path: a trail can cross systems (the
      // job page browses its archive directory on another one), and a path
      // handed over without its system lands on the wrong machine
      const parts = route.split('/');
      onNavigate(
        `/${parts.slice(3).map(decodeURIComponent).join('/')}`,
        decodeURIComponent(parts[2] ?? '')
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
   * Back, and then up.
   *
   * With a trail behind you, back is the trail. With none — the first
   * directory of a session, or one opened straight from a URL — the button
   * and the key did nothing at all, which is a poor answer to someone
   * standing four levels down. So it climbs instead, one directory per
   * press, until it reaches the top of the system and genuinely has nowhere
   * to go.
   *
   * The climb replaces the trail's current entry rather than appending: put
   * the parent after the child and the next back walks you straight back
   * down, oscillating between two directories forever.
   */
  const back = useCallback(() => {
    if (canGoBack(trailKey)) {
      step(-1);
      return;
    }
    if (!segments.length) return;
    replaceNextVisit(trailKey);
    goToRoute(filesRoute(systemId, segments.slice(0, -1)));
    // segments is rebuilt each render from a string, so compare by content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailKey, step, goToRoute, systemId, segments.join('/')]);

  /** the top of this system, wherever the bar happens to be driving */
  const top = useCallback(
    () => goToRoute(filesRoute(systemId, [])),
    [goToRoute, systemId]
  );

  /**
   * One directory up, with no reference to the trail.
   *
   * back climbs too, but only once it has run out of history; this is the
   * move on its own, for the places that only ever want that one. It
   * replaces the trail's current entry for the same reason back's climb
   * does: put the parent after the child and the next back walks you
   * straight back down into the directory you just left.
   */
  const up = useCallback(() => {
    if (!segments.length) return;
    replaceNextVisit(trailKey);
    goToRoute(filesRoute(systemId, segments.slice(0, -1)));
    // segments is rebuilt each render from a string, so compare by content
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
   * Browse in place instead of routing to /files.
   *
   * A job's output listing is a file browser too, and sending someone to
   * another page for every directory press loses the job they were reading.
   * With this it walks the tree where it stands, and everything else about
   * the bar — up, back, forward, the trail — behaves identically.
   */
  onNavigate?: (path: string, systemId: string) => void;
  /** which trail this bar keeps; separate browsers keep separate ones */
  trail?: string;
  /** anything that should sit at the right end of the bar */
  children?: React.ReactNode;
}> = ({
  systemId,
  path,
  onNavigate,
  trail: trailKey = FILES_TRAIL,
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

  // The Dolphin move: the crumbs give way to a text field holding the same
  // path, Enter goes there, Escape (or leaving the field) puts the crumbs
  // back. Entered from the pencil, or by clicking the bar's empty tail.
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

  // The same rule the file rail uses, from the same place: $HOME only means
  // something on a Linux system with a per-user effective id that is not
  // rooted below /. Greyed rather than absent, so the bar does not change
  // shape as you move between systems.
  const { data: systemData } = SystemsHooks.useDetails({
    systemId,
    select: 'allAttributes',
  });
  const system = systemData?.result ?? undefined;
  const segments = pathSegments(path);
  const parent = segments.slice(0, -1);
  const atRoot = segments.length === 0;

  // In place, the props ARE the location; on the Files page the URL is. Both
  // are recorded as the same kind of route so one trail model serves both.
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
        // it sits above a pane that takes the remaining height; it must not
        // be the thing that gives way
        flexShrink: 0,
        // no top inset: the shell's right-pane margin is the page's, and the
        // path bar is this page's first row the way the About block is the
        // landings' — they should start on the same line
        pt: 0,
        // the table's header starts immediately below, and a row of buttons
        // touching a row of column names reads as one crowded strip
        pb: 0.75,
      }}
    >
      {/* Landmarks on this system, in one control: $HOME when the system
          can resolve it, and the top of the tree either way — which is the
          only answer on a system that cannot, so there it becomes the
          button rather than a greyed one that never works. */}
      <HostEvalRailButton
        systemId={systemId}
        isAuthenticated={canHostEval(system)}
        disabledReason={hostEvalBlocker(system)}
        onNavigate={onNavigate}
        onTop={() => goToRoute(filesRoute(systemId, []))}
        atTop={atRoot}
      />
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
                ? 'Nothing behind you — up a directory instead'
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
            {/* newest first: the place you want is nearly always near now */}
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
                    {/* the system, then the path under it: two facts, and
                        the path is the one you are scanning for */}
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
                        {/* rtl so a long path truncates at the FRONT, where
                            the uninformative part is */}
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
            ? `${systemId} is the top of this system`
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
          // leaving the field abandons the edit — the crumbs come back and
          // nothing navigates, the same bargain Escape makes
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
            // the two ends are what anyone reads; a deep scratch path is middle
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
            {/* at the top of a system, the system IS the current directory, and
            it should read like one — a deep path bolds where you are, and a
            shallow one was leaving that off */}
            {/* The system crumb is where "top of this system" gets a path.
            It is a Tapis word everywhere else in the bar, and a system
            rooted at /work/01234 does not put you at / when you press it. */}
            <Tooltip
              arrow
              disableInteractive
              enterDelay={500}
              title={
                <Box sx={{ maxWidth: 260 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                    Top of {systemId}
                  </Typography>
                  {describeSystemRoot(systemId, system).map((line) => (
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

          {/* the path as a thing you can take with you: the bare path for a
          shell on that machine, the tapis:// address when the system has
          to travel too — and the pencil for typing one instead */}
          <CopyButton label={`Copy ${plainPath}`} text={plainPath}>
            <ContentCopyRounded />
          </CopyButton>
          <CopyButton label={`Copy ${tapisAddress}`} text={tapisAddress}>
            <LinkRounded />
          </CopyButton>
          <Tooltip title="Type a path — Enter goes there, and tapis://system/path jumps systems">
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
          {/* the bar's empty tail is the path bar too — clicking it starts
          typing, the way Dolphin's does */}
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
