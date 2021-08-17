import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Icon } from 'tapis-ui/_common';
import { useTapisConfig } from 'tapis-hooks';
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


export default Sidebar;
