import React, { useCallback } from 'react';
import { FileListing } from 'tapis-ui/components/files';
import { PageLayout } from 'tapis-ui/_common';
import { OnSelectCallback } from 'tapis-ui/components/files/FileListing/FileListing';
import { useFilesSelect } from 'tapis-app/Files/_components/FilesContext';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
};

const Layout: React.FC<LayoutProps> = ({
  systemId,
  path,
  location,
}) => {
  const { selectedFiles, select, unselect } = useFilesSelect();

  const body = (
    <div className={styles.body}>
      <FileListing
        className={styles.container}
        systemId={systemId}
        path={path}
        location={location}
        selectTypes={['dir', 'file']}
        selectedFiles={selectedFiles}
        onSelect={(files) => select(files, 'multi') }
        onUnselect={unselect}
      ></FileListing>
    </div>
  );

  return <PageLayout right={body} constrain></PageLayout>;
};

export default Layout;
