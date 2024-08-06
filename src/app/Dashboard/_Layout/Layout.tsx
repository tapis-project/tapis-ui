export { Dashboard } from '../_components/Dashboard';
import React from 'react';
import { PageLayout } from '@tapis/tapisui-common';
import { Dashboard } from '../_components';

const Layout: React.FC = () => {
  const body = <Dashboard />;

  return <PageLayout right={body} />;
};

export default Layout;
