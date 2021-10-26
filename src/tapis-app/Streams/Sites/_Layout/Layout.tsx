import React from 'react';
import {
  PageLayout,
  LayoutHeader
} from 'tapis-ui/_common';
import { Router } from '../_Router';

const Layout: React.FC<{ projectId: string }> = ({
  projectId
}) => {
  const header = (
    <LayoutHeader>
      <div>Sites</div>
    </LayoutHeader>
  );

  const body = (
    <Router projectId={projectId} />
  );

  return <PageLayout top={header} left={body} />;
};

export default Layout;
