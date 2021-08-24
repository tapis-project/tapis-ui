import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Icon } from 'tapis-ui/_common';
import { useTapisConfig } from 'tapis-hooks';
import './Sidebar.global.scss';
import styles from './Sidebar.module.scss';
import { useLogin } from 'tapis-hooks/authenticator';


type SidebarItemProps = {
  label: string,
  iconName: string,
  onClick?: () => any
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, iconName, onClick=undefined }) => {
  return (
    <div className={`${styles.content} nav-content`} onClick={onClick}>
      <Icon name={iconName} />
      <span className={styles.text}>{label}</span>
    </div>
  );
};

const SidebarLogout: React.FC = () => {
  const { logout } = useLogin();
  return (
    <NavItem>
      <NavLink 
        tag={RRNavLink}
        to="/login"
        exact
        className={styles.link}
        activeClassName={styles['link--active']}
        disabled={false}
      >
        <SidebarItem label="Log Out" iconName="user" onClick={logout} />
      </NavLink>
    </NavItem>
  )
}

type SidebarNavProps = {
  to: string,
  label: string,
  iconName: string
}

const SidebarNav: React.FC<SidebarNavProps> = ({ to, label, iconName }) => {
  return (
    <NavItem>
      <NavLink
        tag={RRNavLink}
        to={to}
        exact
        className={styles.link}
        activeClassName={styles['link--active']}
      >
        <SidebarItem label={label} iconName={iconName} />
      </NavLink>
    </NavItem>
  )
}

const Sidebar: React.FC = () => {
  const { accessToken } = useTapisConfig();
  return (
    <Nav className={styles.root} vertical>
      <SidebarNav to="/" label="Dashboard" iconName="dashboard" />
      {!accessToken && <SidebarNav to="/login" label="Login" iconName="user" />}
      {accessToken && <>
        <SidebarNav to="/systems" label="Systems" iconName="data-files" />
        <SidebarNav to="/apps" label="Apps" iconName="applications" />
        <SidebarNav to="/jobs" label="Jobs" iconName="jobs" />
        <SidebarLogout />
      </>}
    </Nav>
  );
};


export default Sidebar;
