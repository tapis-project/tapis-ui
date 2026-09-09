import React, { useEffect } from 'react';
import { FileListing } from '@tapis/tapisui-common';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import FilesBreadcrumbs, {
  useFilesNavigation,
} from 'app/Files/_components/FilesBreadcrumbs';
import { useDropUpload } from 'app/Files/_components/useDropUpload';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
};

const Layout: React.FC<LayoutProps> = ({ systemId, path, location }) => {
  const { selectedFiles, select, unselect, clear } = useFilesSelect();
  // the same back the path bar's arrow does, so ← and ⌫ cannot disagree
  // with the button about where back is — including its fall-through to
  // climbing a directory when there is no trail left
  const { back, top, up } = useFilesNavigation(
    systemId,
    undefined,
    undefined,
    path
  );
  // a drop stages the files in the upload modal rather than writing them
  const { onDropFiles, modal } = useDropUpload(systemId, path);
  useEffect(() => {
    clear();
  }, [systemId, path, clear]);

  return (
    <div className={styles.body}>
      {/* where you are, and the way up — the global breadcrumb bar this page
          opted out of never came back in any other form */}
      <FilesBreadcrumbs systemId={systemId} path={path} />
      <FileListing
        className={styles.container}
        systemId={systemId}
        path={path}
        location={location}
        selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
        selectedFiles={selectedFiles}
        onSelect={(files) => select(files, 'multi')}
        onUnselect={unselect}
        onBack={back}
        // the explanation offers up, never back: history is not an answer to
        // a directory that will not open
        onUp={up}
        onTop={top}
        onDropFiles={onDropFiles}
      />
      {modal}
    </div>
  );
};

export default Layout;
