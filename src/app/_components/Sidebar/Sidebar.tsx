// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useSyncExternalStore,
} from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useQueryClient } from 'react-query';
import { subscribePanelRequests } from 'app/_components/SectionedPanel/panelSwitch';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem, loginPromptState } from '@tapis/tapisui-common';
import { LOGIN_RETURN_KEY } from 'app/Login/_components/Login/Login';
import { useExtension } from 'extensions';
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  Login,
  SettingsRounded,
  ChatBubbleOutline,
  HomeRounded,
} from '@mui/icons-material';
import { LoadingButton as Button } from '@mui/lab';
import {
  Collapse,
  ListItemButton,
  // Button,
  Chip,
  ListItemText,
  Typography,
  Tooltip,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import JsonViewerLazy from './JsonViewerLazy';

// Settings modal loads on first open only — the Sidebar mounts on every page.
const SettingsDialogLazy = React.lazy(
  () => import('app/Settings/_components/SettingsDialog/SettingsDialog')
);
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { QueryWrapper } from '@tapis/tapisui-common';
import { FloatingChatButton } from 'app/_components';
import { ChatContext } from 'app/_context/chat';
import {
  getPodsAdminMode,
  setPodsAdminMode,
  subscribePodsAdminMode,
} from 'utils/podsAdminMode';

type SidebarItems = {
  [key: string]: any;
};

const Sidebar: React.FC = () => {
  const { accessToken, claims, domainsMatched, basePath, setAccessToken } =
    useTapisConfig();
  const isAuthenticated = Boolean(accessToken?.access_token);
  const { extension } = useExtension();
  const chatContextValue = useContext(ChatContext);
  const queryClient = useQueryClient();
  const podsAdminMode = useSyncExternalStore(
    subscribePodsAdminMode,
    getPodsAdminMode
  );
  // Long-press on Pods toggles pods admin mode (the tier check that asks
  // the server first arrives with the pods client).
  const togglePodsAdminMode = () => {
    setPodsAdminMode(!podsAdminMode);
    queryClient.invalidateQueries({
      predicate: (q) =>
        typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('pods/'),
    });
  };
  const landingServiceId =
    extension?.serviceMap && 'home' in extension.serviceMap
      ? 'home'
      : undefined;
  // Pre-login sidebar (extensions with a public landing): a flat, config-
  // ordered list of public services plus the Login item (special id 'login';
  // appended last when the config doesn't place it). Without a prelogin
  // config the classic Dashboard+Login pair renders.
  const prelogin = extension?.prelogin;
  const preloginSidebarActive = !accessToken && !!prelogin;
  const preloginSidebarIds = prelogin
    ? prelogin.sidebarServices.includes('login')
      ? prelogin.sidebarServices
      : [...prelogin.sidebarServices, 'login']
    : [];
  const [expanded, setExpanded] = useState(true);
  const [openSecondary, setOpenSecondary] = useState(false); //Added openSecondary state to manage the visibility of the secondary sidebar items.
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [settingsEverOpened, setSettingsEverOpened] = useState(false);
  // Another panel's footer switcher asked for Settings — this is its host.
  useEffect(
    () =>
      subscribePanelRequests(['settings'], () => {
        setSettingsEverOpened(true);
        setModal('settings');
      }),
    []
  );
  const [sectionOpenStates, setSectionOpenStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [moreOpenStates, setMoreOpenStates] = useState<{
    [key: string]: boolean;
  }>({});
  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const history = useHistory();
  const location = useLocation();

  const valueBlockStyle = {
    display: 'inline-block',
    width: 'fit-content',
    maxWidth: '100%',
    marginTop: '0rem',
    marginBottom: '0rem',
    padding: '0.65rem 0.8rem',
    borderRadius: '8px',
    backgroundColor: '#f5f7fa',
    border: '1px solid #d7dee7',
    fontFamily:
      'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
    fontSize: '0.95rem',
    lineHeight: 1.3,
    color: '#1f2933',
    wordBreak: 'break-word' as const,
  };

  // Initialize section open states based on defaultOpen values
  useEffect(() => {
    if (extension?.betaSidebar?.enabled && extension.betaSidebar.sections) {
      const initialStates: { [key: string]: boolean } = {};
      extension.betaSidebar.sections.forEach((section) => {
        initialStates[section.name] = section.defaultOpen;
      });
      setSectionOpenStates(initialStates);
    }
  }, [extension?.betaSidebar]);

  const toggleSection = (sectionName: string) => {
    setSectionOpenStates((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const toggleMoreMenu = (menuId: string) => {
    setMoreOpenStates((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const renderSidebarItem = (
    to: string,
    icon: string | undefined,
    text: string,
    accent?: { accentLeft?: boolean; accentLeftColor?: string },
    iconElement?: React.ReactNode
  ) => {
    return (
      <NavItem
        to={to}
        icon={icon}
        iconElement={iconElement}
        key={uuidv4()}
        accentLeft={accent?.accentLeft}
        accentLeftColor={accent?.accentLeftColor}
      >
        {expanded ? text : ''}
      </NavItem>
    );
  };

  // True when an extension's betaSidebar config explicitly places 'dashboard'
  // somewhere (e.g. icicle's Tapis section) — in that case the standalone
  // top-of-Navbar Dashboard link below is skipped, and the 'dashboard' key
  // below is added to sidebarItems, so it renders once, from the section.
  // Extensions that don't reference 'dashboard' (still the vast majority —
  // e.g. the public extension) never get a 'dashboard' key at all, so the
  // fallback "Original sidebar logic" below — which just iterates every
  // sidebarItems entry — can't pick it up and duplicate it. Computed before
  // sidebarItems on purpose: whether the key gets added depends on this.
  const dashboardPlacedInSidebar =
    !!extension?.betaSidebar?.enabled &&
    [
      ...(extension.betaSidebar.noSection?.mainServices ?? []),
      ...(extension.betaSidebar.noSection?.secondaryServices ?? []),
      ...extension.betaSidebar.sections.flatMap((section: any) => [
        ...section.mainServices,
        ...(section.secondaryServices ?? []),
      ]),
    ].includes('dashboard');

  const sidebarItems: SidebarItems = {
    //Existing sidebar items
    systems: renderSidebarItem('/systems', 'data-files', 'Systems'),
    files: renderSidebarItem('/files', 'folder', 'Files'),
    apps: renderSidebarItem('/apps', 'applications', 'Apps'),
    jobs: renderSidebarItem('/jobs', 'jobs', 'Jobs'),
    workflows: renderSidebarItem('/workflows', 'publications', 'Workflows'),
    pods: (
      <NavItem
        to="/pods"
        icon="visualization"
        key="pods-nav"
        accentLeft={podsAdminMode}
        accentLeftColor="#F69723"
        onLongPress={togglePodsAdminMode}
        longPressMs={1200}
      >
        {expanded ? 'Pods' : ''}
      </NavItem>
    ),
    mlhub: renderSidebarItem('/mlhub', 'share', 'ML Hub'),
    authenticator: renderSidebarItem('/authenticator', 'gear', 'Authenticator'),
    security: renderSidebarItem('/security', 'lock', 'Security'),
    // Only added when an extension's config actually places 'dashboard'
    // somewhere — see the comment on `dashboardPlacedInSidebar` above.
    ...(dashboardPlacedInSidebar && {
      dashboard: renderSidebarItem(
        landingServiceId ? '/dashboard' : '/',
        'dashboard',
        'Dashboard'
      ),
    }),
  };

  if (extension !== undefined) {
    //extension handlng
    for (const [id, service] of Object.entries(extension.serviceMap)) {
      sidebarItems[id] = renderSidebarItem(
        service.route,
        service.iconName,
        service.sidebarDisplayName,
        undefined,
        // The icon font has no house glyph — the landing/Services-Board item
        // gets a real MUI home icon instead of whatever iconName it declares.
        id === 'home' ? <HomeRounded fontSize="small" /> : undefined
      );
    }
  }

  let mainSidebarItems = [];
  let secondarySidebarItems = [];

  for (const [id, item] of Object.entries(sidebarItems)) {
    if (extension && extension.mainSidebarServices.includes(id)) {
      mainSidebarItems.push(item);
    } else {
      secondarySidebarItems.push(item);
    }
  }

  // If there were no main items, we make all items main items
  if (mainSidebarItems.length === 0) {
    mainSidebarItems = secondarySidebarItems;
    secondarySidebarItems = [];
  }

  const toggleSecondaryItems = () => {
    setOpenSecondary(!openSecondary);
  };

  const chipLabel = expanded ? (
    <ExpandLessRounded
      sx={{
        fontSize: 15,
        transform: 'rotate(-90deg)',
        color: 'rgba(0, 0, 0, 0.87)',
      }}
    />
  ) : (
    <ExpandMoreRounded
      sx={{
        fontSize: 15,
        transform: 'rotate(-90deg)',
        color: 'rgba(0, 0, 0, 0.87)',
      }}
    />
  );

  // The account chip used to open a menu whose every item now lives in the
  // settings panel — JWT + copy in Session's token well, tenants in Tenants,
  // secrets as a Session quick link, Log out in the panel footer. So the chip
  // opens the panel itself: one click instead of click-menu-click.
  // The panel is lazy, so a cold first click paid for its chunk. Warm it when
  // the browser is idle (and again on hover, for anyone who clicks before idle
  // fires) — by click time the module graph is already there. Prefetch only:
  // nothing mounts and no query runs until the panel actually opens.
  const warmSettingsChunk = React.useCallback(() => {
    import('app/Settings/_components/SettingsDialog/SettingsDialog');
  }, []);
  // Hover goes one step further and MOUNTS the dialog closed, so the click
  // only has to flip `open`. Cheap: a closed panel prunes to a single section
  // (keepAlive + open=false) and its tenants query is the one the sidebar has
  // already fetched, so this shares a cache entry rather than adding a request.
  const warmSettingsMount = React.useCallback(() => {
    warmSettingsChunk();
    setSettingsEverOpened(true);
  }, [warmSettingsChunk]);
  useEffect(() => {
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (ric) {
      const id = ric(warmSettingsChunk, { timeout: 3000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warmSettingsChunk, 1500);
    return () => window.clearTimeout(t);
  }, [warmSettingsChunk]);

  const openAccountPanel = () => {
    if (!(claims && claims['sub'])) {
      history.push('/login');
      return;
    }
    setSettingsEverOpened(true);
    setModal('settings');
  };

  const useCountdown = (targetTime: number) => {
    const [timeLeft, setTimeLeft] = useState(
      targetTime - Math.floor(Date.now() / 1000)
    );

    useEffect(() => {
      const interval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const newTimeLeft = targetTime - currentTime;

        if (newTimeLeft <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [targetTime]);

    return timeLeft;
  };

  const CountdownDisplay = ({ expirationTime }: { expirationTime: number }) => {
    const timeLeft = useCountdown(expirationTime);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div>
        {timeLeft <= 0
          ? 'Expired'
          : `${minutes} minutes, ${seconds} seconds left`}
      </div>
    );
  };
  return (
    <div
      className={styles.root}
      // Width is content-driven, so a near-empty expanded sidebar (pre-login:
      // just the Login item) would shrink to logo width and park the edge
      // collapse tab on top of the logo — the floor keeps clearance. Collapsed
      // stays its natural thin rail.
      style={{
        position: 'relative',
        minWidth: expanded ? '10rem' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center', // horizontal
          alignItems: 'center', // vertical
          marginTop: '.6rem',
          marginBottom: '.6rem',
          flexShrink: 0,
          // marginRight: '0.2rem',
        }}
      >
        <Link to={'/'}>
          {/* Both images are always in the DOM so they stay preloaded; only one is visible at a time */}
          <img
            style={{
              display: expanded ? 'block' : 'none',
              maxHeight: '50px',
              maxWidth: '9rem',
              borderRadius: '6px',
              marginLeft: '.5rem',
              marginRight: '.5rem',
            }}
            className="logo"
            src={
              extension?.logo?.filePath ||
              extension?.logo?.url ||
              extension?.logo?.text ||
              './logo_tapis.png'
            }
          />
          <img
            style={{
              display: expanded ? 'none' : 'block',
              height: '50px',
              maxWidth: '4.2rem',
              borderRadius: '6px',
              marginLeft: '.2rem',
              marginRight: '.2rem',
            }}
            className="logo"
            src={
              extension?.icon?.filePath ||
              extension?.icon?.url ||
              extension?.icon?.text ||
              './icon_tapis.png'
            }
          />
        </Link>
      </div>

      {/* Collapse/expand tab: rides ON the pane's top-right edge (never over
          page content), rounded toward the pane — a taller, thinner grab-tab
          so the minimized logo stays clear of it. */}
      <Chip
        label={chipLabel}
        variant="outlined"
        size="small"
        sx={{
          borderRadius: '5px 0 0 5px',
          // open right side — the pane's own edge is the tab's fourth wall
          borderRight: 'none',
          backgroundColor: 'white',
          height: '1.8rem',
          width: '0.95rem',
          position: 'absolute',
          right: 0,
          // logo box: .6rem margin + 50px logo → center ≈ .6rem + 25px; put
          // the tab's midpoint (0.9rem into its 1.8rem) on the same line
          top: 'calc(.6rem + 25px - 0.9rem)',
          zIndex: 2,
          cursor: 'pointer',
          '& .MuiChip-label': {
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          '&:hover': { backgroundColor: '#f2f2f2' },
        }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      />

      <Navbar>
        {/* Flex column spanning the WHOLE nav list (not just the betaSidebar
            branch below) — Home/Dashboard/Login items are flex items here
            too, so a `marginTop: 'auto'` section (Archive) pushes itself
            against everything above it, not just its own nested wrapper.
            Nesting a second minHeight: '100%' div below the Home item would
            double-count height against the real nav-list box and force a
            scrollbar (that's the bug this replaced). */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}
        >
          {preloginSidebarActive ? (
            <>
              {preloginSidebarIds.map((serviceId) =>
                serviceId === 'login' ? (
                  // Same door as the banner's Sign in: raise the dialog over
                  // the public page instead of navigating to /login, which on
                  // an implicit-auth deployment leaves the app entirely and
                  // bounces back to the landing route with stale chrome.
                  <NavItem
                    to={{
                      pathname: location.pathname,
                      search: location.search,
                      state: loginPromptState(),
                    }}
                    icon="user"
                    key="login-nav"
                  >
                    {expanded ? 'Login' : ''}
                  </NavItem>
                ) : (
                  sidebarItems[serviceId]
                )
              )}
            </>
          ) : (
            <>
              {landingServiceId &&
                accessToken &&
                sidebarItems[landingServiceId]}
              {/* Only while logged in: pre-login the Dashboard item just
                  bounced to /login (its '/' target redirects there when
                  unauthenticated), so the classic pre-login sidebar is the
                  Login item alone. Deployments that want real pre-login pages
                  declare a prelogin config instead. */}
              {Boolean(accessToken) &&
                !dashboardPlacedInSidebar &&
                renderSidebarItem(
                  landingServiceId ? '/dashboard' : '/',
                  'dashboard',
                  'Dashboard'
                )}
              {/* JWT Bypass moved to the login page itself (hold the page
                  header 3 s) — see src/app/Login/_components/JwtBypassDialog. */}
              {!accessToken && (
                // Record where Login was pressed, for the OAuth2 callback.
                <NavItem
                  to="/login"
                  icon="user"
                  key="login-nav"
                  onClick={() => {
                    if (location.pathname.startsWith('/login')) return;
                    sessionStorage.setItem(
                      LOGIN_RETURN_KEY,
                      location.pathname + location.search
                    );
                  }}
                >
                  {expanded ? 'Login' : ''}
                </NavItem>
              )}
            </>
          )}
          {accessToken && (
            <>
              {extension?.betaSidebar?.enabled ? (
                // Beta sidebar with sections
                <>
                  {/* No Section items - always visible */}
                  {extension.betaSidebar.noSection?.mainServices
                    ?.filter(
                      (serviceId: string) => serviceId !== landingServiceId
                    )
                    .map((serviceId: string) => sidebarItems[serviceId])}
                  {extension.betaSidebar.noSection?.secondaryServices &&
                    extension.betaSidebar.noSection.secondaryServices.length >
                      0 && (
                      <>
                        <div
                          onClick={() => toggleMoreMenu('noSection')}
                          style={{
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}
                        >
                          <ListItemButton
                            sx={{
                              color: '#707070',
                              pl: '1.4rem',
                              pt: '5px',
                              pb: '5px',
                            }}
                          >
                            {moreOpenStates['noSection'] ? (
                              <ExpandLessRounded />
                            ) : (
                              <ExpandMoreRounded />
                            )}
                            {expanded && (
                              <ListItemText
                                primary="More"
                                sx={{ pl: '.5rem' }}
                              />
                            )}
                          </ListItemButton>
                        </div>
                        <Collapse in={moreOpenStates['noSection']}>
                          {extension.betaSidebar.noSection.secondaryServices
                            .filter(
                              (serviceId: string) =>
                                serviceId !== landingServiceId
                            )
                            .map(
                              (serviceId: string) => sidebarItems[serviceId]
                            )}
                        </Collapse>
                      </>
                    )}

                  {/* Sectioned items */}
                  {extension.betaSidebar.sections.map((section: any) => (
                    <div
                      key={section.name}
                      // `minimal` (Archive) pushes itself to the true bottom of
                      // the flex column via margin, not a fixed gap — reads as
                      // separated from the two groups above instead of a third
                      // peer, and collapses to a normal gap once content already
                      // fills the pane and there's no slack left to push into.
                      style={{
                        marginTop: section.minimal ? 'auto' : 0,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        onClick={() => toggleSection(section.name)}
                        style={{
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          marginTop: section.minimal ? '10px' : '2px',
                        }}
                      >
                        <ListItemButton
                          sx={{
                            // `minimal` sections render a quiet, recessed header
                            // (muted, non-bold, a dashed top rule instead of a
                            // solid group boundary) so low-emphasis groups like
                            // Archive don't beckon; the default is the bold
                            // group heading.
                            color: section.minimal ? '#909090' : '#505050',
                            pl: '1.4rem',
                            pt: section.minimal ? '2px' : '3px',
                            pb: section.minimal ? '2px' : '5px',
                            borderTop: section.minimal
                              ? '1px dashed rgba(112,122,134,0.35)'
                              : 'none',
                            fontWeight: section.minimal ? 'normal' : 'bold',
                            justifyContent: 'space-between',
                          }}
                        >
                          {expanded && (
                            <ListItemText
                              primary={section.name}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight: section.minimal
                                    ? 'normal'
                                    : 'bold',
                                  fontSize: section.minimal
                                    ? '0.75rem'
                                    : '0.9rem',
                                },
                              }}
                            />
                          )}
                          {sectionOpenStates[section.name] ? (
                            <ExpandLessRounded
                              fontSize={section.minimal ? 'small' : 'medium'}
                            />
                          ) : (
                            <ExpandMoreRounded
                              fontSize={section.minimal ? 'small' : 'medium'}
                            />
                          )}
                        </ListItemButton>
                      </div>
                      <Collapse in={sectionOpenStates[section.name]}>
                        {/* Main services in section */}
                        {section.mainServices
                          .filter(
                            (serviceId: string) =>
                              serviceId !== landingServiceId
                          )
                          .map((serviceId: string) => sidebarItems[serviceId])}

                        {/* Secondary services in section */}
                        {section.secondaryServices &&
                          section.secondaryServices.length > 0 && (
                            <>
                              <div
                                onClick={() => toggleMoreMenu(section.name)}
                                style={{
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                }}
                              >
                                <ListItemButton
                                  sx={{
                                    color: '#707070',
                                    pl: '1.4rem',
                                    pt: '3px',
                                    pb: '3px',
                                  }}
                                >
                                  {moreOpenStates[section.name] ? (
                                    <ExpandLessRounded fontSize="small" />
                                  ) : (
                                    <ExpandMoreRounded fontSize="small" />
                                  )}
                                  {expanded && (
                                    <ListItemText
                                      primary="More"
                                      sx={{
                                        pl: '.5rem',
                                        '& .MuiListItemText-primary': {
                                          fontSize: '0.8rem',
                                        },
                                      }}
                                    />
                                  )}
                                </ListItemButton>
                              </div>
                              <Collapse in={moreOpenStates[section.name]}>
                                {section.secondaryServices
                                  .filter(
                                    (serviceId: string) =>
                                      serviceId !== landingServiceId
                                  )
                                  .map(
                                    (serviceId: string) =>
                                      sidebarItems[serviceId]
                                  )}
                              </Collapse>
                            </>
                          )}
                      </Collapse>
                    </div>
                  ))}
                </>
              ) : (
                // Original sidebar logic
                <>
                  {mainSidebarItems.map((item) => item)}
                  {secondarySidebarItems.length > 0 &&
                    extension !== undefined &&
                    extension.showSecondarySideBar != false && (
                      <>
                        <div
                          onClick={toggleSecondaryItems}
                          style={{
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                          }}
                        >
                          <ListItemButton
                            sx={{
                              color: '#707070',
                              pl: '1.4rem',
                              pt: '5px',
                              pb: '5px',
                            }}
                          >
                            {openSecondary ? (
                              <ExpandLessRounded />
                            ) : (
                              <ExpandMoreRounded />
                            )}
                            {expanded && (
                              <ListItemText
                                primary="More"
                                sx={{ pl: '.5rem' }}
                              />
                            )}
                          </ListItemButton>
                        </div>
                        <Collapse in={openSecondary}>
                          {secondarySidebarItems.map((item) => item)}
                        </Collapse>
                      </>
                    )}
                </>
              )}
            </>
          )}
        </div>
      </Navbar>
      <div style={{ flexShrink: 0 }}>
        <div style={{ margin: '.6rem', marginBottom: '.4rem' }}>
          <FloatingChatButton isAuthenticated={isAuthenticated} />
        </div>
        <Tooltip
          title={
            isAuthenticated ? 'Open Chatbot' : 'Please log in to use chatbot'
          }
          placement="right"
        >
          <span>
            <Chip
              variant="outlined"
              disabled={!isAuthenticated}
              style={{
                borderRadius: '8px',
              }}
              label={
                !expanded ? (
                  <ChatBubbleOutline sx={{ width: 24, height: 24 }} />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      fontSize: 12,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                    }}
                  >
                    <div>
                      <ChatBubbleOutline sx={{ width: 24, height: 24 }} />
                    </div>
                    {expanded && (
                      <div style={{ marginLeft: '.4rem', maxWidth: '9rem' }}>
                        Chatbot
                      </div>
                    )}
                  </div>
                )
              }
              onClick={() => chatContextValue?.toggleChat()}
              sx={{
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '.6rem',
                marginBottom: '.4rem',
                color: '#707070',
                '& .MuiChip-label': {
                  display: 'flex',
                  whiteSpace: 'normal',
                },
              }}
            />
          </span>
        </Tooltip>
        <Chip
          variant="outlined"
          style={{
            borderRadius: '8px',
          }}
          label={
            !expanded ? (
              <SettingsRounded sx={{ width: 24, height: 24 }} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  fontSize: 12,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                }}
              >
                <div>
                  <SettingsRounded sx={{ width: 24, height: 24 }} />
                </div>
                {claims['tapis/username'] ? (
                  <div
                    style={{
                      marginLeft: '.4rem',
                      maxWidth: '9rem',
                      overflow: 'hidden',
                      fontSize: 12,
                      lineHeight: 1.2,
                    }}
                    title={
                      claims['tapis/username'] +
                      '@' +
                      claims['sub'].split('@')[1]
                    }
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {claims['tapis/username']}
                    </div>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      @{claims['sub'].split('@')[1]}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginLeft: '.4rem',
                      maxWidth: '9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {'Logged Out'}
                  </div>
                )}
              </div>
            )
          }
          aria-label="Account and settings"
          onClick={openAccountPanel} // one click straight into the panel
          onMouseEnter={warmSettingsMount}
          onFocus={warmSettingsMount}
          sx={{
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '.6rem',
            color: '#707070',
            //minWidth: '0rem',
            //width: '2rem',
            '& .MuiChip-label': {
              display: 'flex',
              whiteSpace: 'normal',
            },
          }}
        />
      </div>

      {/* Latched after first open (+ keepMounted inside): reopen skips the
          full panel remount AND react-query subscriptions stay alive, so the
          store/tenant caches stop being garbage-collected between opens. */}
      {settingsEverOpened && (
        <React.Suspense fallback={null}>
          <SettingsDialogLazy
            open={modal === 'settings'}
            onClose={() => setModal(undefined)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default Sidebar;
