import React, { useState, useCallback } from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
  Breadcrumbs,
} from 'tapis-ui/_common';
import { SystemsNav } from '../_components';
import { Router } from '../_Router';
import Toolbar from '../_components/Toolbar';
import { useLocation } from 'react-router';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import styles from './Layout.module.scss';
import { Files } from '@tapis/tapis-typescript';
import { OnSelectCallback } from 'tapis-ui/components/files/FileListing/FileListing';

const Layout: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<Array<Files.FileInfo>>([]);
  const onSelect = useCallback<OnSelectCallback>(
    (files) => setSelectedFiles(files),
    [setSelectedFiles]
  );

  const { pathname } = useLocation();

  const header = (
    <LayoutHeader>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs
          breadcrumbs={[
            { text: 'Files' },
            ...breadcrumbsFromPathname(pathname).splice(1),
          ]}
        />
      </div>
      <Toolbar selectedFiles={selectedFiles} />
    </LayoutHeader>
  );

  const sidebar = (
    <LayoutNavWrapper>
      <SystemsNav />
    </LayoutNavWrapper>
  );

  const body = (
    <LayoutBody constrain>
      <Router onSelect={onSelect} />
    </LayoutBody>
  );

  return <PageLayout top={header} left={sidebar} right={body} />;
};

export default Layout;
