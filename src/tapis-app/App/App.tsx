import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Apps, Login, Dashboard, Jobs, Systems } from 'tapis-app/Sections';
import { Layout } from 'tapis-app/Layout';
import { SectionHeader, ProtectedRoute } from 'tapis-ui/_common';
import { useLogin } from 'tapis-hooks/authenticator';
import Sidebar from '../Sidebar/Sidebar';
import UIPatterns from '../UIPatterns';
import './App.scss';

const App: React.FC = () => {
  const { logout } = useLogin();

  const header = (
    <div>
      <SectionHeader className="tapis-ui__header">TAPIS UI</SectionHeader>
    </div>
  );

  const workbenchContent = (
    <div className="workbench-content">
      <Route exact path="/">
        <Dashboard />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route
        path="/logout"
        render={() => {
          logout();
          return <Redirect to="/login" />;
        }}
      />
      <ProtectedRoute path="/systems">
        <Systems />
      </ProtectedRoute>
      <ProtectedRoute path="/apps">
        <Apps />
      </ProtectedRoute>
      <ProtectedRoute path="/jobs">
        <Jobs />
      </ProtectedRoute>
      <Route path="/uipatterns">
        <SectionHeader>UI Patterns</SectionHeader>
        <UIPatterns />
      </Route>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexGrow: 1, height: '100vh' }}>
      <Layout top={header} left={<Sidebar />} right={workbenchContent} />
    </div>
  );
};

export default hot(App);
