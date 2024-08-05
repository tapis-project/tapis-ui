// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React, { useState } from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';
import { Menu, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, Button, Chip } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import { Link, useHistory, useLocation } from 'react-router-dom';

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
        {expanded ? (
          <span style={{ paddingRight: '.75rem', whiteSpace: 'nowrap' }}>
            {text}
          </span>
        ) : (
          ''
        )}
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

  const chipLabel = expanded ? '<' : '>';

  return (
    <div
      className={styles.root}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // horizontal
          alignItems: 'center', // vertical
          marginTop: '.6rem',
          marginBottom: '.6rem',
          marginRight: '0px',
        }}
      >
        <Link to={'/'}>
          <img
            style={{ height: '42px' }}
            className="logo"
            src={
              expanded
                ? extension?.logo?.url || './tapislogo.png'
                : './tapisicon.png'
            }
          />
        </Link>
        {expanded ? extension?.logo?.logoText : undefined}
      </div>

      <Chip
        label={chipLabel}
        variant="outlined"
        size="small"
        style={{
          borderRadius: '8px',
          backgroundColor: 'white',
          height: '1.5rem',
          width: '2rem',
          position: 'absolute',
          right: '-1rem',
          top: '.75rem',
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
                    // paddingTop: '10px',
                    // paddingBottom: '10px',
                    paddingLeft: '21px',
                  }}
                >
                  {openSecondary ? <ExpandLess /> : <ExpandMore />}
                  {expanded && (
                    <span
                      style={{
                        paddingLeft: '8px',
                        fontSize: '14px',
                        color: '#808080',
                      }}
                    >
                      {' '}
                      More
                    </span>
                  )}
                </div>
                <Collapse in={openSecondary}>
                  {secondarySidebarItems.map((item) => item)}
                </Collapse>
              </>
            )}
          </>
        )}
      </Navbar>

      {/* <div style={{alignContent: "center", alignItems: "center"}}>
      {claims['sub'] && (
          <ButtonDropdown
            size="sm"
            isOpen={isOpen}
            toggle={() => setIsOpen(!isOpen)}
            className="dropdown-button"
          >
            <DropdownToggle caret>{claims['sub']}</DropdownToggle>
            <DropdownMenu style={{ maxHeight: '50vh', overflowY: 'scroll' }}>
              {((extension !== undefined && extension.allowMutiTenant) ||
                extension === undefined ||
                (extension !== undefined && extension.allowMutiTenant)) && (
                <>
                  <DropdownItem header>Tenants</DropdownItem>
                  <DropdownItem divider />
                  <QueryWrapper isLoading={isLoading} error={error}>
                    {tenants.map((tenant) => {
                      return (
                        <DropdownItem
                          onClick={() => {
                            window.location.href =
                              tenant.base_url + '/tapis-ui/';
                          }}
                        >
                          {tenant.tenant_id}
                        </DropdownItem>
                      );
                    })}
                  </QueryWrapper>
                  <DropdownItem divider />
                </>
              )}
              <DropdownItem onClick={() => history.push('/logout')}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        )}
      </div>
 */}
    </div>
  );
};

export default Sidebar;
