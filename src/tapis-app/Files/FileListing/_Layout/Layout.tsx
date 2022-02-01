import React, { useEffect } from 'react';
import { FileListing } from 'tapis-ui/components/files';
import { PageLayout } from 'tapis-ui/_common';
import { useFilesSelect, useFilesSelectActions } from 'tapis-app/Files/_store';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
};

const Layout: React.FC<LayoutProps> = ({ systemId, path, location }) => {
  const { selected } = useFilesSelect();
  const { select, unselect, clear } = useFilesSelectActions();
  useEffect(() => {
    clear();
  }, [systemId, path, clear]);

  const body = (
    <div className={styles.body}>
      <FileListing
        className={styles.container}
        systemId={systemId}
        path={path}
        location={location}
        selectTypes={['dir', 'file']}
        selectedFiles={selected}
        onSelect={(files) => select(files, 'multi')}
        onUnselect={unselect}
      ></FileListing>
    </div>
  );

  return <PageLayout right={body} constrain></PageLayout>;
};

export default Layout;
