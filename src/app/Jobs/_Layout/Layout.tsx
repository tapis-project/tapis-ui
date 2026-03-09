import React from 'react';
import { JobsNav } from '../_components';
import { Router } from '../_Router';
import {
  PageLayout,
  LayoutBody,
  LayoutNavWrapper,
  LayoutHeader,
} from '@tapis/tapisui-common';
import { Link } from 'react-router-dom';
import { JobsHelp } from 'app/_components/Help';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <span>
        <Link to="/jobs" style={{ color: '#444444', textDecoration: 'none' }}>
          Jobs
        </Link>
        <span style={{ marginLeft: '16px' }}>
          <JobsHelp />
        </span>
      </span>
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <div
        style={{
          borderRight: '1px solid #CCCCCC',
          borderBottom: '1px solid #CCCCCC',
        }}
      >
        <JobsNav />
      </div>
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
