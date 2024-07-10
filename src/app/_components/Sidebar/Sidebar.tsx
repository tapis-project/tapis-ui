// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React, { useState } from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';
import { Menu, ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

type SidebarItems = {
  [key: string]: any;
};

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { extension } = useExtension();
  const [expanded, setExpanded] = useState(true);
  const [openSecondary, setOpenSecondary] = useState(false); //Added openSecondary state to manage the visibility of the secondary sidebar items.

  const renderSidebarItem = (
    to: string,
    icon: string | undefined,
    text: string
  ) => {
    return (
      <NavItem to={to} icon={icon} key={uuidv4()}>
        {expanded ? (
          <span style={{ paddingRight: '32px', whiteSpace: 'nowrap' }}>
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

  const toggleSecondaryItems = () => {
    setOpenSecondary(!openSecondary);
  };

  return (
    <div className={styles.root}>
      <div className={styles['collapse-icon']}>
        <Menu
          color="action"
          onClick={() => {
            setExpanded(!expanded);
          }}
        />
      </div>
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
                    cursor: 'pointer',
                    paddingTop: '10px',
                    paddingBottom: '16px',
                    paddingLeft: '21px',
                  }}
                >
                  {openSecondary ? <ExpandLess /> : <ExpandMore />}
                  {expanded && (
                    <span style={{ fontSize: '14px', color: '#808080' }}>
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
    </div>
  );
};

export default Sidebar;
