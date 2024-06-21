// TACC Core Styles for icons: https://github.com/TACC/Core-Styles/blob/main/src/lib/_imports/components/cortal.icon.font.css
import React from 'react';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const { extension } = useExtension();
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
            <NavItem to="/systems" icon="data-files">
              Systems
            </NavItem>
            <NavItem to="/files" icon="folder">
              Files
            </NavItem>
            <NavItem to="/apps" icon="applications">
              Apps
            </NavItem>
            <NavItem to="/jobs" icon="jobs">
              Jobs
            </NavItem>
            <NavItem to="/workflows" icon="publications">
              Workflows
            </NavItem>
            <NavItem to="/ml-hub" icon="share">
              ML Hub
            </NavItem>
            <NavItem to="/pods" icon="visualization">
              Pods
            </NavItem>
          </>
        )}
      </Navbar>
    </div>
  );
};

export default Sidebar;
