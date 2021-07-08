import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Icon } from 'tapis-ui/_common';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { useAuthenticator } from 'tapis-redux';
import './Sidebar.global.scss';
import './Sidebar.module.scss';


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
        styleName="link"
        activeStyleName="link--active"
        disabled={false}
      >
        <div styleName="content" className="nav-content">
          <Icon name={iconName} />
          <span styleName="text">{label}</span>
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
      <div styleName="system-content">
        <h6>Selected System</h6>
        <div styleName="system-info">
          <strong>ID: </strong>
          {system.id}
        </div>
        <div styleName="system-info">
          <strong>Type: </strong>
          {system.systemType}
        </div>
        <div styleName="system-info">
          <strong>Host: </strong>
          {system.host}
        </div>
      </div>
    </div>
  );
};



const Sidebar: React.FC = () => {
  const { token } = useAuthenticator();
  return (
    <Nav styleName="root" vertical>
      <SidebarItem to="/" label="Dashboard" iconName="dashboard" />
      {!token && <SidebarItem to="/login" label="Login" iconName="user" />}
      {token && <>
        <SidebarItem to="/logout" label="Log Out" iconName="user" />
        <SidebarItem to="/systems" label="Systems" iconName="data-files" />
        <SidebarItem to="/apps" label="Apps" iconName="applications" />
        <SidebarItem to="/jobs" label="Jobs" iconName="jobs" />
      </>}
      <SidebarItem to="/uipatterns" label="UI Patterns" iconName="code" />
    </Nav>
  );
};

Sidebar.defaultProps = {
  jwt: null
}

export default Sidebar;
