// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React, { useState } from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';
import { Menu } from '@mui/icons-material';

type SidebarItems = {
  [key: string]: any;
};

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { extension } = useExtension();
  const [expanded, setExpanded] = useState(true);

  const renderSidebarItem = (
    to: string,
    icon: string | undefined,
    text: string
  ) => {
    return (
      <NavItem to={to} icon={icon}>
        {expanded === true ? <span style={{paddingRight: "32px", whiteSpace: "nowrap"}}>{text}</span> : ''}
      </NavItem>
    );
  };

  const sidebarItems: SidebarItems = {
    systems: renderSidebarItem('/systems', 'data-files', 'Systems'),
    files: renderSidebarItem('/files', 'folder', 'Files'),
    apps: renderSidebarItem('/apps', 'applications', 'Apps'),
    jobs: renderSidebarItem('/jobs', 'jobs', 'Jobs'),
    workflows: renderSidebarItem('/workflows', 'publications', 'Workflows'),
    pods: renderSidebarItem('/pods', 'visualization', 'Pods'),
    'ml-hub': renderSidebarItem('/ml-hub', 'share', 'ML Hub'),
  };

  if (extension !== undefined) {
    for (const [id, service] of Object.entries(extension.serviceMap)) {
      sidebarItems[id] = renderSidebarItem(
        service.route,
        service.iconName,
        service.sidebarDisplayName
      );
    }
  }

  let mainSidebarItems = Object.entries(sidebarItems).map(([_, item]) => {
    return item;
  });

  const secondarySidebarItems = [];
  if (extension && extension.mainSidebarServices.length > 0) {
    mainSidebarItems = [];
    for (const [id, item] of Object.entries(sidebarItems)) {
      if (extension.mainSidebarServices.includes(id)) {
        mainSidebarItems.push(item);
        continue;
      }

      secondarySidebarItems.push(item);
    }
  }

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
            {mainSidebarItems.map((item: any) => {
              return item;
            })}
          </>
        )}
      </Navbar>
    </div>
  );
};

export default Sidebar;
