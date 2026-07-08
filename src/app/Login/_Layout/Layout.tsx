import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { Login as TapisLogin } from '../_components';
import { SectionHeader, PageLayout } from '@tapis/tapisui-common';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';

const Layout: React.FC = () => {
  const { accessToken, basePath } = useTapisConfig();
  const { extension } = useExtension();
  let location = useLocation<{ from: Location }>();
  let { from } = location.state || { from: { pathname: '/' } };
  const landingRoute = extension?.serviceMap?.['home']?.route;
  if (accessToken?.access_token) {
    return <Redirect to={landingRoute ?? from} />;
  }

  const body = (
    <>
      <div className="container">
        <SectionHeader>
          Login to {basePath.replace('https://', '').replace('http://', '')}
        </SectionHeader>
        <TapisLogin />
      </div>
    </>
  );

  return <PageLayout right={body} />;
};

export default Layout;
