import React from 'react';
import { JobsNav, JobsLayoutToolbar } from '../_components';
import { Router } from '../_Router';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
  SectionHeader,
} from '@tapis/tapisui-common';
import { Link } from 'react-router-dom';
import { JobsHelp } from 'app/_components/Help';

const Layout: React.FC = () => {
  const header = (
    <SectionHeader>
      <span>
        <span>
          <Link to="/jobs" style={{ color: '#444444' }}>
            Jobs
          </Link>
        </span>
        <span style={{ marginLeft: '16px', marginTop: '-1px' }}>
          <JobsHelp />
        </span>
      </span>
    </SectionHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <JobsNav />
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
