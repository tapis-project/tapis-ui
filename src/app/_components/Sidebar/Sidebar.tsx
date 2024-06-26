// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';

type SidebarItems = {
  [key: string]: any
}

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { extension } = useExtension();
  const sidebarItems: SidebarItems  = {
    "systems": (
      <NavItem to="/systems" icon="data-files">
        Systems
      </NavItem>
    ),
    "files": (
      <NavItem to="/files" icon="folder">
        Files
      </NavItem>
    ),
    "apps": (
      <NavItem to="/apps" icon="applications">
        Apps
      </NavItem>
    ),
    "jobs": (
      <NavItem to="/jobs" icon="jobs">
        Jobs
      </NavItem>
    ),
    "workflows": (
      <NavItem to="/workflows" icon="publications">
        Workflows
      </NavItem>
    ),
    "ml-hub": (
      <NavItem to="/ml-hub" icon="share">
        ML Hub
      </NavItem>
    ),
    "pods": (
      <NavItem to="/pods" icon="visualization">
        Pods
      </NavItem>
    ),
  }
  
  if (extension !== undefined) {
    for (const [id, service] of Object.entries(extension.serviceMap)) {
      sidebarItems[id] = (
        <NavItem to={service.route} icon={service.iconName}>
          {service.sidebarDisplayName}
        </NavItem>
      )
    }
  }
  
  let mainSidebarItems = Object.entries(sidebarItems).map(([_, item]) => {
    return item
  })
  
  const secondarySidebarItems = []
  if (extension && extension.mainSidebarServices.length > 0) {
    mainSidebarItems = []
    for (const [id, item] of Object.entries(sidebarItems)) {
      if (extension.mainSidebarServices.includes(id)) {
        mainSidebarItems.push(item)
        continue
      }

      secondarySidebarItems.push(item)
    }
  }


  return (
    <div className={styles.root}>
      <Navbar>
        <NavItem to="/" icon="dashboard">
          Dashboard
        </NavItem>
        {!accessToken && (
          <NavItem to="/login" icon="user">
            Login
          </NavItem>
        )}
        {accessToken && (
          <>
            {mainSidebarItems.map((item: any) => { return item })}
          </>
        )}
      </Navbar>
    </div>
  );
};

export default Sidebar;
