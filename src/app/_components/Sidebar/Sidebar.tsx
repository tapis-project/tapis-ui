// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React, {
  useEffect,
  useState,
  useContext,
  useSyncExternalStore,
} from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useQueryClient } from 'react-query';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  Login,
  Logout,
  SettingsRounded,
  Key,
  Visibility,
  ContentCopy,
  ChatBubbleOutline,
  PersonOutline,
} from '@mui/icons-material';
import { LoadingButton as Button } from '@mui/lab';
import {
  Menu,
  Collapse,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  // Button,
  MenuItem,
  Chip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { EditorView } from 'codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import {
  Tenants as Hooks,
  Authenticator as AuthHooks,
} from '@tapis/tapisui-hooks';
import { Link, useHistory } from 'react-router-dom';

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
  const { accessToken, claims, domainsMatched, basePath } = useTapisConfig();
  const isAuthenticated = Boolean(accessToken?.access_token);
  const { extension, extensionName } = useExtension();
  const chatContextValue = useContext(ChatContext);
  const queryClient = useQueryClient();
  const podsAdminMode = useSyncExternalStore(
    subscribePodsAdminMode,
    getPodsAdminMode
  );
  const isIcicleExtension = extensionName === '@icicle/tapisui-extension';
  const [expanded, setExpanded] = useState(true);
  const [openSecondary, setOpenSecondary] = useState(false); //Added openSecondary state to manage the visibility of the secondary sidebar items.
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [sectionOpenStates, setSectionOpenStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [moreOpenStates, setMoreOpenStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [profileUsername, setProfileUsername] = useState('');
  const [profileLookup, setProfileLookup] = useState('');
  const [profileInitialized, setProfileInitialized] = useState(false);

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = AuthHooks.useGetProfile(
    { username: profileLookup },
    { enabled: !!profileLookup }
  );

  // When the Profiles modal opens, initialize with the current user's username
  useEffect(() => {
    if (modal === 'profiles' && !profileInitialized && claims?.['sub']) {
      const currentUser = (claims['sub'] as string).split('@')[0];
      setProfileUsername(currentUser);
      setProfileLookup(currentUser);
      setProfileInitialized(true);
    }
    if (modal !== 'profiles') {
      setProfileInitialized(false);
    }
  }, [modal, claims, profileInitialized]);

  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const history = useHistory();

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
    accent?: { accentLeft?: boolean; accentLeftColor?: string }
  ) => {
    return (
      <NavItem
        to={to}
        icon={icon}
        key={uuidv4()}
        accentLeft={accent?.accentLeft}
        accentLeftColor={accent?.accentLeftColor}
      >
        {expanded ? text : ''}
      </NavItem>
    );
  };

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
        onLongPress={() => {
          setPodsAdminMode(!podsAdminMode);
          queryClient.invalidateQueries({
            predicate: (q) =>
              typeof q.queryKey[0] === 'string' &&
              q.queryKey[0].startsWith('pods/'),
          });
        }}
        longPressMs={1200}
      >
        {expanded ? 'Pods' : ''}
      </NavItem>
    ),
    mlhub: renderSidebarItem('/mlhub', 'share', 'ML Hub'),
    authenticator: renderSidebarItem('/authenticator', 'gear', 'Authenticator'),
  };

  if (extension !== undefined) {
    //extension handlng
    for (const [id, service] of Object.entries(extension.serviceMap)) {
      sidebarItems[id] = renderSidebarItem(
        service.route,
        service.iconName,
        service.sidebarDisplayName
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
      style={{ transform: 'rotate(-90deg) translateY(-40%) translateX(-10%)' }}
    />
  ) : (
    <ExpandMoreRounded
      style={{ transform: 'rotate(-90deg) translateY(-40%) translateX(-10%)' }}
    />
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleModal = () => {
    setModal('delete');
  };

  const handleCopyAccessToken = () => {
    if (accessToken?.access_token) {
      navigator.clipboard.writeText(accessToken.access_token);
    }
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
    <div className={styles.root} style={{ position: 'relative' }}>
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
          <img
            style={
              expanded
                ? {
                    maxHeight: '50px',
                    maxWidth: '9rem',
                    borderRadius: '6px',
                    marginLeft: '.5rem',
                    marginRight: '.5rem',
                  }
                : {
                    height: '50px',
                    maxWidth: '4.2rem',
                    borderRadius: '6px',
                    marginLeft: '.2rem',
                    marginRight: '.2rem',
                  }
            }
            className="logo"
            src={
              expanded
                ? extension?.logo?.filePath ||
                  extension?.logo?.url ||
                  extension?.logo?.text ||
                  './logo_tapis.png'
                : extension?.icon?.filePath ||
                  extension?.icon?.url ||
                  extension?.logo?.text ||
                  './icon_tapis.png'
            }
          />
        </Link>
      </div>

      <Chip
        label={chipLabel}
        variant="outlined"
        size="small"
        style={{
          borderRadius: '8px',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          backgroundColor: 'white',
          height: '1.5rem',
          width: '1.5rem',
          position: 'absolute',
          right: '-1.5rem',
          top: '.6rem',
          paddingBottom: '.2rem',
        }}
        className={styles.hideButton} // Add a custom class for styling
        onClick={() => {
          setExpanded(!expanded);
        }}
      />

      <Navbar>
        {isIcicleExtension &&
          accessToken &&
          renderSidebarItem('/home', 'globe', 'Portal Home')}
        {renderSidebarItem(
          extensionName === '@icicle/tapisui-extension' ? '/dashboard' : '/',
          'dashboard',
          'Dashboard'
        )}
        {!accessToken && renderSidebarItem('/login', 'user', 'Login')}
        {accessToken && (
          <>
            {extension?.betaSidebar?.enabled ? (
              // Beta sidebar with sections
              <>
                {/* No Section items - always visible */}
                {extension.betaSidebar.noSection?.mainServices
                  ?.filter(
                    (serviceId: string) =>
                      !(isIcicleExtension && serviceId === 'home')
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
                            <ListItemText primary="More" sx={{ pl: '.5rem' }} />
                          )}
                        </ListItemButton>
                      </div>
                      <Collapse in={moreOpenStates['noSection']}>
                        {extension.betaSidebar.noSection.secondaryServices
                          .filter(
                            (serviceId: string) =>
                              !(isIcicleExtension && serviceId === 'home')
                          )
                          .map((serviceId: string) => sidebarItems[serviceId])}
                      </Collapse>
                    </>
                  )}

                {/* Sectioned items */}
                {extension.betaSidebar.sections.map((section: any) => (
                  <div key={section.name}>
                    <div
                      onClick={() => toggleSection(section.name)}
                      style={{
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        marginTop: '8px',
                      }}
                    >
                      <ListItemButton
                        sx={{
                          color: '#505050',
                          pl: '1.4rem',
                          pt: '8px',
                          pb: '8px',
                          fontWeight: 'bold',
                          justifyContent: 'space-between',
                        }}
                      >
                        {expanded && (
                          <ListItemText
                            primary={section.name}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                              },
                            }}
                          />
                        )}
                        {sectionOpenStates[section.name] ? (
                          <ExpandLessRounded />
                        ) : (
                          <ExpandMoreRounded />
                        )}
                      </ListItemButton>
                    </div>
                    <Collapse in={sectionOpenStates[section.name]}>
                      {/* Main services in section */}
                      {section.mainServices
                        .filter(
                          (serviceId: string) =>
                            !(isIcicleExtension && serviceId === 'home')
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
                                    !(isIcicleExtension && serviceId === 'home')
                                )
                                .map(
                                  (serviceId: string) => sidebarItems[serviceId]
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
                            <ListItemText primary="More" sx={{ pl: '.5rem' }} />
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
          onClick={handleClick} // Move the click handler here to make the entire div clickable
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

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.52))',
            mt: 0.5,
            ml: 1.2,
            '& .MuiMenuItem-root': {
              minHeight: 'auto',
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          disabled={!(claims && claims['sub'])}
          onClick={() => setModal('viewJWT')}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View JWT</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!(claims && claims['sub']) || !accessToken?.access_token}
          onClick={handleCopyAccessToken}
        >
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Access Token</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!(claims && claims['sub'])}
          onClick={() => setModal('profiles')}
        >
          <ListItemIcon>
            <PersonOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profiles</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push('/workflows/secrets');
          }}
          disabled={!(claims && claims['sub'])}
        >
          <ListItemIcon>
            <Key fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Secrets</ListItemText>
        </MenuItem>
        {((extension !== undefined && extension.allowMultiTenant) ||
          extension === undefined ||
          (extension !== undefined && extension.allowMultiTenant)) && (
          <MenuItem
            onClick={() => setModal('changeTenant')}
            disabled={!(claims && claims['sub'])}
          >
            <ListItemIcon>
              <SettingsRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Tenant</ListItemText>
          </MenuItem>
        )}
        <Divider />
        {claims && claims['sub'] ? (
          <MenuItem onClick={() => history.push('/logout')}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => history.push('/login')}>
            <ListItemIcon>
              <Login />
            </ListItemIcon>
            Login
          </MenuItem>
        )}
      </Menu>

      <Dialog
        fullWidth
        open={modal === 'viewJWT'}
        onClose={() => setModal(undefined)}
        aria-labelledby="jwt-dialog-title"
        PaperProps={{
          style: { maxHeight: '95%', width: '60rem', maxWidth: '80%' },
        }}
      >
        <DialogContent>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <Typography variant="h6">Access Token Object</Typography>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopy />}
                onClick={handleCopyAccessToken}
                disabled={!domainsMatched || !accessToken?.access_token}
              >
                Copy Access Token
              </Button>
            </div>
          </div>
          <CodeMirror
            value={
              domainsMatched
                ? JSON.stringify(accessToken, null, 2)
                : 'Access token tenant_id and current domain are out-of-sync. Please log-in again.'
            }
            editable={false}
            readOnly={true}
            basicSetup={{
              lineNumbers: false,
              tabSize: 2,
              foldGutter: false,
            }}
            extensions={[EditorView.lineWrapping, json()]}
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
          <Typography variant="h6">JWT Claims</Typography>
          <CodeMirror
            value={JSON.stringify(claims, null, 2)}
            editable={false}
            readOnly={true}
            basicSetup={{
              lineNumbers: false,
              tabSize: 2,
              foldGutter: false,
            }}
            extensions={[EditorView.lineWrapping, json()]}
            theme={vscodeDarkInit({
              settings: {
                caret: '#c6c6c6',
                fontFamily: 'monospace',
              },
            })}
            style={{
              fontSize: 12,
              backgroundColor: '#f5f5f5',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
          <Typography variant="h6">Current Domain:</Typography>
          <Typography component="div" sx={valueBlockStyle}>
            {basePath?.replace('https://', '').replace('http://', '')}
          </Typography>
          <Typography variant="h6">Token Life Remaining:</Typography>
          <Typography component="div" sx={valueBlockStyle}>
            <CountdownDisplay expirationTime={claims['exp']} />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal(undefined)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modal === 'profiles'}
        onClose={() => setModal(undefined)}
        aria-labelledby="profiles-dialog-title"
        PaperProps={{
          style: { width: '32rem', maxWidth: '90%' },
        }}
      >
        <DialogTitle id="profiles-dialog-title">User Profile</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Look up an OAuth2 profile by username. GET /v3/oauth2/profiles/
            {'\u007B'}user{'\u007D'}
          </Typography>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <TextField
              size="small"
              label="Username"
              value={profileUsername}
              onChange={(e) => setProfileUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && profileUsername.trim()) {
                  setProfileLookup(profileUsername.trim());
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => setProfileLookup(profileUsername.trim())}
              disabled={!profileUsername.trim()}
              loading={profileLoading}
            >
              Submit
            </Button>
          </div>
          {profileError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {profileError.message}
            </Typography>
          )}
          {profileData?.result &&
            (() => {
              const p = profileData.result as any;
              const fields: {
                label: string;
                value: string | number | null | undefined;
              }[] = [
                { label: 'Username', value: p.username },
                {
                  label: 'Name',
                  value:
                    p.name ||
                    [p.given_name, p.last_name].filter(Boolean).join(' ') ||
                    null,
                },
                { label: 'Given Name', value: p.given_name },
                { label: 'Last Name', value: p.last_name },
                { label: 'Email', value: p.email },
                { label: 'UID', value: p.uid },
                { label: 'Phone', value: p.phone },
                { label: 'Mobile Phone', value: p.mobile_phone },
                { label: 'Create Time', value: p.create_time },
              ];

              // Parse LDAP Distinguished Name into readable parts
              const dnAbbreviations: Record<string, string> = {
                cn: 'Common Name',
                ou: 'Org Unit',
                dc: 'Domain',
                o: 'Organization',
                uid: 'User ID',
                l: 'Locality',
                st: 'State',
                c: 'Country',
              };
              const dnParts = p.dn
                ? p.dn.split(',').map((part: string) => {
                    const [key, ...rest] = part.trim().split('=');
                    const k = key.toLowerCase();
                    return {
                      abbr: key,
                      full: dnAbbreviations[k] || key,
                      value: rest.join('='),
                    };
                  })
                : [];
              return (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {fields.map(({ label, value }) => (
                        <tr key={label}>
                          <td
                            style={{
                              padding: '6px 12px 6px 0',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              verticalAlign: 'top',
                              color: '#555',
                              borderBottom: '1px solid #eee',
                            }}
                          >
                            {label}
                          </td>
                          <td
                            style={{
                              padding: '6px 0',
                              wordBreak: 'break-all',
                              borderBottom: '1px solid #eee',
                            }}
                          >
                            {value ?? <span style={{ color: '#999' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dnParts.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 2, mb: 0.5, color: '#555' }}
                      >
                        Distinguished Name (DN)
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mb: 1, color: '#888' }}
                      >
                        {p.dn}
                      </Typography>
                      <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                      >
                        <tbody>
                          {dnParts.map(
                            (
                              part: {
                                abbr: string;
                                full: string;
                                value: string;
                              },
                              i: number
                            ) => (
                              <tr key={i}>
                                <td
                                  style={{
                                    padding: '4px 10px 4px 0',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    color: '#555',
                                    fontSize: '0.85rem',
                                    borderBottom: '1px solid #f0f0f0',
                                  }}
                                >
                                  {part.full}
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      color: '#aaa',
                                      marginLeft: 4,
                                    }}
                                  >
                                    ({part.abbr})
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: '4px 0',
                                    fontSize: '0.85rem',
                                    borderBottom: '1px solid #f0f0f0',
                                  }}
                                >
                                  {part.value}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              );
            })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal(undefined)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modal === 'changeTenant'}
        onClose={() => setModal(undefined)}
        aria-labelledby="change-tenant-dialog-title"
        PaperProps={{
          style: { maxHeight: '70%' },
        }}
      >
        <DialogTitle id="change-tenant-dialog-title">Change Tenant</DialogTitle>
        <DialogContent>
          <QueryWrapper isLoading={isLoading} error={error}>
            {tenants
              .sort((a, b) => a.tenant_id.localeCompare(b.tenant_id))
              .map((tenant) => (
                <MenuItem
                  key={tenant.tenant_id}
                  onClick={() => {
                    window.location.href = tenant.base_url + '/';
                    setModal(undefined);
                  }}
                  onAuxClick={(event) => {
                    // Handle middle-click (button 1) to open in new tab
                    if (event.button === 1) {
                      event.preventDefault();
                      window.open(tenant.base_url + '/', '_blank');
                    }
                  }}
                  component="a"
                  href={tenant.base_url + '/'}
                  sx={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      textDecoration: 'none',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {tenant.tenant_id}
                </MenuItem>
              ))}
          </QueryWrapper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal(undefined)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;
