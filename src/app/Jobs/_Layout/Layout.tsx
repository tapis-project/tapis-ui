import React from 'react';
import { JobsNav } from '../_components';
import { Router } from '../_Router';
import {
  PageLayout,
  LayoutBody,
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
