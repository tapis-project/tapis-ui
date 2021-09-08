import React from 'react';
import { Redirect } from 'react-router-dom';
import { Login as TapisLogin } from '../_components';
import { SectionHeader } from 'tapis-ui/_common';
import { useTapisConfig } from 'tapis-hooks';

const Layout: React.FC = () => {
  const { accessToken } = useTapisConfig();

  if (accessToken?.access_token) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <SectionHeader>Login</SectionHeader>
      <div className="container">
        <TapisLogin />
      </div>
    </>
  );
};

export default Layout;
