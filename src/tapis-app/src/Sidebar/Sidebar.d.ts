import React from 'react';
import './Sidebar.global.scss';
import './Sidebar.module.scss';
interface SidebarProps {
    jwt?: string;
}
declare const Sidebar: React.FC<SidebarProps>;
export default Sidebar;
