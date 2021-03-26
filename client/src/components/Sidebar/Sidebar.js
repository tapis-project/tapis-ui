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

const Sidebar = () => {
  return (
    // WIP
    <Nav styleName="root" vertical>
      <SidebarItem to="" label="Dashboard" iconName="dashboard" />
      <SidebarItem to="/login" label="Login" iconName="link" />
      <SidebarItem to="/systems" label="Systems" iconName="allocations" />
      <SidebarItem to="/uipatterns" label="UI Patterns" iconName="copy" />
    </Nav>
  );
};

export default Sidebar;
