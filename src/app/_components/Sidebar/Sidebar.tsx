// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React, { useEffect, useState } from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
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
} from '@mui/icons-material';
import { LoadingButton as Button } from '@mui/lab';
import {
  Menu,
  Collapse,
  List,
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
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { EditorView } from 'codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import { Link, useHistory } from 'react-router-dom';

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import {
  QueryWrapper,
  PageLayout,
  Breadcrumbs,
  breadcrumbsFromPathname,
} from '@tapis/tapisui-common';

type SidebarItems = {
  [key: string]: any;
};

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { extension } = useExtension();
  const [expanded, setExpanded] = useState(true);
  const [openSecondary, setOpenSecondary] = useState(false); //Added openSecondary state to manage the visibility of the secondary sidebar items.
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modal, setModal] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const history = useHistory();

  const { claims } = useTapisConfig();

  const renderSidebarItem = (
    to: string,
    icon: string | undefined,
    text: string
  ) => {
    return (
      <NavItem to={to} icon={icon} key={uuidv4()}>
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
    pods: renderSidebarItem('/pods', 'visualization', 'Pods'),
    'ml-hub': renderSidebarItem('/ml-hub', 'share', 'ML Hub'),
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
      style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center', // horizontal
          alignItems: 'center', // vertical
          marginTop: '.6rem',
          marginBottom: '.6rem',
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
        {renderSidebarItem('/', 'dashboard', 'Dashboard')}
        {!accessToken && renderSidebarItem('/login', 'user', 'Login')}
        {accessToken && (
          <>
            {mainSidebarItems.map((item) => item)}
            {secondarySidebarItems.length > 0 && (
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
      </Navbar>
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
              {claims['sub'] ? (
                <div style={{ marginLeft: '.4rem', maxWidth: '9rem' }}>
                  {claims['sub'].split('@')[0]}
                  <br />@{claims['sub'].split('@')[1]}
                </div>
              ) : (
                <div style={{ marginLeft: '.4rem', maxWidth: '9rem' }}>
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

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
          },
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.52))',
            mt: 0.5,
            ml: 1.2,
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
          onClick={() => {
            history.push('/workflows/secrets');
          }}
        >
          <ListItemIcon>
            <Key fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Secrets</ListItemText>
        </MenuItem>
        {((extension !== undefined && extension.allowMutiTenant) ||
          extension === undefined ||
          (extension !== undefined && extension.allowMutiTenant)) && (
          <MenuItem
            onClick={() => setModal('changeTenant')}
            disabled={!(claims && claims['sub'])}
          >
            Change Tenant
          </MenuItem>
        )}
        <Divider />
        {claims && claims['sub'] ? (
          <MenuItem onClick={() => history.push('/logout')}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign out</ListItemText>
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
          <Typography variant="h6">Access Token Object</Typography>
          <CodeMirror
            value={JSON.stringify(accessToken, null, 2)}
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
          <Typography variant="h6">Token Life Remaining</Typography>
          <CountdownDisplay expirationTime={claims['exp']} />
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
