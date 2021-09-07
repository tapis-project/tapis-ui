import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from 'tapis-ui/_common';
import { SystemsNav } from '../components';
import { Router } from '../Router';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>System List</div>
    </LayoutHeader>
  );

  const subHeader = <LayoutHeader type={'sub-header'}>Files</LayoutHeader>;

  const sidebar = (
    <LayoutNavWrapper>
      <SystemsNav />
    </LayoutNavWrapper>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <Router />
    </div>
  );

  return (
    <PageLayout
      top={header}
      left={sidebar}
      right={
        <LayoutBody>
          <PageLayout top={subHeader} right={body} />
        </LayoutBody>
      }
    />
  );
};

export default Layout;
