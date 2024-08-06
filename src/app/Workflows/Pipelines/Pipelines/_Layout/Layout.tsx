import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutNavWrapper,
} from '@tapis/tapisui-common';
import { GroupsNav } from '../../../_components';
import { Router } from '../_Router';

const Layout: React.FC = () => {
  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <GroupsNav baseUrl="/workflows/pipelines" />
    </LayoutNavWrapper>
  );

  return <PageLayout left={sidebar} right={body} />;
};

export default Layout;
