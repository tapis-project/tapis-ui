import React from 'react';
import { useTapisConfig } from 'tapis-hooks';
import styles from './Sidebar.module.scss';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
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
          </>
        )}
      </Navbar>
    </div>
  );
};

export default Sidebar;
