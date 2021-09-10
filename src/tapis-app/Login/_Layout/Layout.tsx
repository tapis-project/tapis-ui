import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { Login as TapisLogin } from '../_components';
import { SectionHeader } from 'tapis-ui/_common';
import { useTapisConfig } from 'tapis-hooks';

const Layout: React.FC = () => {
  const { accessToken } = useTapisConfig();
  let location = useLocation<{ from: Location }>();
  let { from } = location.state || { from: { pathname: '/' } };

  if (accessToken?.access_token) {
    return <Redirect to={from} />;
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
