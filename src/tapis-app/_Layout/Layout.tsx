import React from 'react';
import { Sidebar } from 'tapis-app/_components';
import { Router } from 'tapis-app/_Router';
import { SectionHeader, PageLayout } from 'tapis-ui/_common';
import { NotificationsProvider } from 'tapis-app/_components/Notifications';
import { Link } from "react-router-dom"
import './Layout.scss';
import { useTapisConfig } from 'tapis-hooks';

const Layout: React.FC = () => {
  const { claims } = useTapisConfig()
  const header = (
    <div>
      <SectionHeader className="tapis-ui__header">
        TapisUI
        <Link to="/logout" className="logout" style={{textTransform: "none"}}>{claims["sub"]}</Link>
      </SectionHeader>
    </div>
  );

  const workbenchContent = (
    <div className="workbench-content">
      <Router />
    </div>
  );

  return (
    <NotificationsProvider>
      <div style={{ display: 'flex', flexGrow: 1, height: '100vh' }}>
        <PageLayout top={header} left={<Sidebar />} right={workbenchContent} />
      </div>
    </NotificationsProvider>
  );
};

export default Layout;
