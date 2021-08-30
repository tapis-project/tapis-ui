import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Route } from 'react-router-dom';
import { Apps, Login, Dashboard, Jobs, Systems } from 'tapis-app/Sections';
import { SectionHeader, ProtectedRoute } from 'tapis-ui/_common';
import Sidebar from '../Sidebar/Sidebar';
import UIPatterns from '../UIPatterns';
import './App.scss';

const App: React.FC = () => {
  return (
    <div className="workbench-wrapper">
      <Sidebar/>
      <div className="workbench-content">
        <Route exact path='/'>
          <Dashboard />
        </Route>
        <Route path='/login'>
          <Login /> 
        </Route>
        <ProtectedRoute path='/systems'>
          <Systems />
        </ProtectedRoute>
        <ProtectedRoute path='/apps'>
          <Apps />
        </ProtectedRoute>
        <ProtectedRoute path='/jobs'>
          <Jobs />
        </ProtectedRoute>
        <Route path='/uipatterns'>
          <SectionHeader>UI Patterns</SectionHeader>
          <UIPatterns />
        </Route>
      </div>
    </div>
  );
}

export default hot(App);
