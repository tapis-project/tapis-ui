import React from 'react';
import { Layout, Sidebar } from 'tapis-app/components';
import { Router } from 'tapis-app/Router';
import { SectionHeader } from 'tapis-ui/_common';
import './Layout.scss';

const App: React.FC = () => {

  const header = (
    <div>
      <SectionHeader className="tapis-ui__header">TAPIS UI</SectionHeader>
    </div>
  );

  const workbenchContent = (
    <div className="workbench-content">
      <Router />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexGrow: 1, height: '100vh' }}>
      <Layout top={header} left={<Sidebar />} right={workbenchContent} />
    </div>
  );
};

export default App;
