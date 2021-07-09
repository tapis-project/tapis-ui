import React from 'react';
import { Nav, NavItem, NavLink, UncontrolledCollapse } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Icon } from 'tapis-ui/_common';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { useAuthenticator } from 'tapis-redux';
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
  group: string,
  id: string,
  label: string,
  items: SidebarItemProps[]
};

const SidebarGroup: React.FC<SidebarGroupProps> = ({id, label, items, group}) => {
  let togglerTag = `#${id}`;
  let groupLink = `/${group}`
  return (
    <>
      <SidebarItem id={id} to={groupLink} label={label} iconName="folder"></SidebarItem>
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


type SystemInfoProps = {
  system: TapisSystem
}

// const Sidebar: React.FC<SidebarProps> = ({ jwt }) => {


//   return (
//     <Nav styleName="root" vertical>
//       <SidebarItem to="/" label="Dashboard" iconName="dashboard" />
//       <SidebarItem to="/login" label="Login" iconName="link" />
//       {jwt && <>
//         <SidebarGroup id="streams-toggle" label="Streams" iconName="allocations" items={streamProps} />
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
  let streamProps: SidebarItemProps[] = [];
  streamProps.push({
    to: "/streams/projects",
    label: "Projects",
    iconName: "allocations"
  });
  streamProps.push({
    to: "/streams/sites",
    label: "Sites",
    iconName: "allocations"
  });
  streamProps.push({
    to: "/streams/instruments",
    label: "Instruments",
    iconName: "allocations"
  });
  streamProps.push({
    to: "/streams/variables",
    label: "Variables",
    iconName: "allocations"
  });
  streamProps.push({
    to: "/streams/measurements",
    label: "Measurements",
    iconName: "allocations"
  });
  const { token } = useAuthenticator();
  return (
    <Nav styleName="root" vertical>
      <SidebarItem to="/" label="Dashboard" iconName="dashboard" />
      {!token && <SidebarItem to="/login" label="Login" iconName="link" />}
      {token && <>
        <SidebarGroup id="streams-toggle" label="Streams" items={streamProps} group="streams" />
        <SidebarItem to="/systems" label="Systems" iconName="allocations" />
        <SidebarItem to="/files" label="Files" iconName="allocations" />
        <SidebarItem to="/apps" label="Apps" iconName="allocations" />
        <SidebarItem to="/jobs" label="Jobs" iconName="allocations" />
        <SidebarItem to="/launcher" label="Launcher" iconName="allocations" />
        <SidebarItem to="/logout" label="Log Out" iconName="link" />
      </>}
      <SidebarItem to="/uipatterns" label="UI Patterns" iconName="copy" />
    </Nav>
  );
};

Sidebar.defaultProps = {
  jwt: null
}

export default Sidebar;
