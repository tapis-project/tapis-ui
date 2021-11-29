import React from 'react';
import {
  PageLayout,
  LayoutHeader,
  LayoutNavWrapper,
  LayoutBody,
} from 'tapis-ui/_common';
import { InstrumentsNav } from '../_components';
import { Router } from '../_Router';

const Layout: React.FC<{ projectId: string; siteId: string }> = ({
  projectId,
  siteId,
}) => {
  const header = (
    <LayoutHeader>
      <div>Instruments</div>
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <InstrumentsNav projectId={projectId} siteId={siteId} />
    </LayoutNavWrapper>
  );

  const body = (
    <LayoutBody>
      <Router projectId={projectId} siteId={siteId} />
    </LayoutBody>
  );

  return <PageLayout top={header} left={sidebar} right={body} />;
};

export default Layout;
