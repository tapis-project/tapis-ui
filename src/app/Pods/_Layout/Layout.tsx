import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from '@tapis/tapisui-common';
import { PodsNav } from '../_components';
import PodToolbar from '../_components/PodToolbar';
import { Router } from '../_Router';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>Pods List</div>
      <PodToolbar />
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <PodsNav />
    </LayoutNavWrapper>
  );

  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return <PageLayout top={header} left={sidebar} right={body} />;
};

export default Layout;
