import React, { useEffect } from 'react';
import { FileListing } from '@tapis/tapisui-common';
import { PageLayout } from '@tapis/tapisui-common';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
};

const Layout: React.FC<LayoutProps> = ({ systemId, path, location }) => {
  const { selectedFiles, select, unselect, clear } = useFilesSelect();
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
        selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
        selectedFiles={selectedFiles}
        onSelect={(files) => select(files, 'multi')}
        onUnselect={unselect}
      ></FileListing>
    </div>
  );

  return <PageLayout right={body} constrain></PageLayout>;
};

export default Layout;
