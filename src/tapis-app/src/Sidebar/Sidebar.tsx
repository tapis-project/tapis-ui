import React from 'react';
import { Nav, NavItem, NavLink, UncontrolledCollapse } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Icon } from 'tapis-ui/_common';
import './Sidebar.global.scss';
import './Sidebar.module.scss';


type SidebarItemProps = {
  to: string,
  label: string,
  iconName: string,
  style?: string,
  id?: string
};

// const SidebarCollapsibleItem: React.FC<SidebarItemProps> = ({ to, label, iconName }) => {
//   return (
//     <NavItem>
//       <NavLink
//         tag={RRNavLink}
//         to={to}
//         exact
//         styleName="link"
//         activeStyleName="link--active"
//         disabled={false}
//       >
//         <div styleName="content" className="nav-content">
//           <Icon name={iconName} />
//           <span styleName="text">{label}</span>
//         </div>
//       </NavLink>
//     </NavItem>
//   );
// };

const SidebarItem: React.FC<SidebarItemProps> = ({ to, label, iconName, style, id }) => {
  return (
    <NavItem>
      <NavLink
        id={id}
        tag={RRNavLink}
        to={to}
        exact
        styleName="link"
        activeStyleName="link--active"
        disabled={false}
      >
        <div styleName={style} className="nav-content">
          <Icon name={iconName} />
          <span styleName="text">{label}</span>
        </div>
      </NavLink>
    </NavItem>
  );
};

type SidebarGroupProps = {
  id: string,
  label: string,
  iconName: string,
  items: SidebarItemProps[]
};

const SidebarGroup: React.FC<SidebarGroupProps> = ({id, label, iconName, items}) => {
  let togglerTag = `#${id}`; 
  return (
    <>
      <SidebarItem id={id} to="/" label="Streams" iconName="folder"></SidebarItem>
      <UncontrolledCollapse toggler={togglerTag}>
        {
          items.map((item, index) => {
            return <SidebarItem key={index} to={item.to} label={item.label} iconName={item.iconName} style="content"></SidebarItem>
          })
        }
        
      </UncontrolledCollapse>
    </>
  );
}


interface SidebarProps {
  jwt?: string
}

const Sidebar: React.FC<SidebarProps> = ({ jwt }) => {
  let streamProps: SidebarItemProps[] = [];
  streamProps.push({
    to: "/projects",
    label: "Projects",
    iconName: "allocations"
  });

  return (
    <Nav styleName="root" vertical>
      <SidebarItem to="/" label="Dashboard" iconName="dashboard" />
      <SidebarItem to="/login" label="Login" iconName="link" />
      {jwt && <>
        <SidebarGroup id="streams-toggle" label="Streams" iconName="allocations" items={streamProps} />
        <SidebarItem to="/systems" label="Systems" iconName="allocations" />
        <SidebarItem to="/files" label="Files" iconName="allocations" />
        <SidebarItem to="/apps" label="Apps" iconName="allocations" />
      </>}
      <SidebarItem to="/uipatterns" label="UI Patterns" iconName="copy" />
    </Nav>
  );
};

Sidebar.defaultProps = {
  jwt: null
}

export default Sidebar;
