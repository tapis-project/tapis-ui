import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Icon } from 'tapis-ui/src/_common';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { useTapisConfig } from 'tapis-hooks/src';
import './Sidebar.global.scss';
import styles from './Sidebar.module.scss';


type SidebarItemProps = {
  to: string,
  label: string,
  iconName: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, label, iconName }) => {
  return (
    <NavItem>
      <NavLink
        tag={RRNavLink}
        to={to}
        exact
        className={styles.link}
        activeClassName={styles['link--active']}
        disabled={false}
      >
        <div className={`${styles.content} nav-content`}>
          <Icon name={iconName} />
          <span className={styles.text}>{label}</span>
        </div>
      </NavLink>
    </NavItem>
  );
};


type SystemInfoProps = {
  system: TapisSystem
}

const SystemInfo: React.FC<SystemInfoProps> = ({ system }) => {
  return (
    <div>
      <hr></hr>
      <div className={styles.systemContent}>
        <h6>Selected System</h6>
        <div className={styles.systemInfo}>
          <strong>ID: </strong>
          {system.id}
        </div>
        <div className={styles.systemInfo}>
          <strong>Type: </strong>
          {system.systemType}
        </div>
        <div className={styles.systemInfo}>
          <strong>Host: </strong>
          {system.host}
        </div>
      </div>
    </div>
  );
};



const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  return (
    <Nav className={styles.root} vertical>
      <SidebarItem to="/" label="Dashboard" iconName="dashboard" />
      {!accessToken && <SidebarItem to="/login" label="Login" iconName="user" />}
      {accessToken && <>
        <SidebarItem to="/systems" label="Systems" iconName="data-files" />
        <SidebarItem to="/apps" label="Apps" iconName="applications" />
        <SidebarItem to="/jobs" label="Jobs" iconName="jobs" />
        <SidebarItem to="/logout" label="Log Out" iconName="user" />
      </>}
    </Nav>
  );
};

Sidebar.defaultProps = {
  jwt: null
}

export default Sidebar;
