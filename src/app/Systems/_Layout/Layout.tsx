import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from '@tapis/tapisui-common';
import { SystemsNav } from '../_components';
import SystemToolbar from '../_components/SystemToolbar';
import { Router } from '../_Router';
import { SystemsHelp } from 'app/_components/Help';
import styles from './Layout.module.scss';

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <span>
        Systems
        <span style={{ marginLeft: '16px' }}>
          <SystemsHelp />
        </span>
      </span>
      <SystemToolbar />
    </LayoutHeader>
  );

  const sidebar = (
    <div className={styles['container']}>
      <SystemsNav />
    </div>
  );

  const body = <Router />;

  return <PageLayout top={header} left={sidebar} right={body} />;
};

export default Layout;
