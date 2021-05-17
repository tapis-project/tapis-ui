import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Icon } from '_common';
import './Sidebar.global.scss';
import './Sidebar.module.scss';

const SidebarItem = ({ to, label, iconName }) => {
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

SidebarItem.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
};

const Sidebar = ({ token }) => {
  return (
    <Nav styleName="root" vertical>
      <SidebarItem to="/" label="Dashboard" iconName="dashboard" />
      <SidebarItem to="/login" label="Login" iconName="link" />
      {token && (
        <SidebarItem to="/systems" label="Systems" iconName="allocations" />
      )}
      <SidebarItem to="/uipatterns" label="UI Patterns" iconName="copy" />
    </Nav>
  );
};

Sidebar.propTypes = {
  token: PropTypes.bool.isRequired,
};

export default Sidebar;
