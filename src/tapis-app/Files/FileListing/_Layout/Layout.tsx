import { useCallback } from 'react';
import { FileListing } from 'tapis-ui/components/files';
import { PageLayout, LayoutHeader, Icon } from 'tapis-ui/_common';
import { useLocation, useHistory } from 'react-router';
import { Files } from '@tapis/tapis-typescript';
import styles from './Layout.module.scss';

const Layout: React.FC<{ systemId: string; path: string }> = ({
  systemId,
  path,
}) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const onNavigate = useCallback(
    (file: Files.FileInfo) => {
      history.push(`${pathname}${file.name}/`)
    },
    [ pathname, history ]
  )

  const onBack = useCallback(
    () => {
      const newPath =`${pathname.split('/').slice(0, -2).join('/')}/`
      history.push(newPath);
    },
    [ pathname, history ]
  )

  const header = <LayoutHeader type={'sub-header'}>
    <div>Files</div>
    { 
      path !== '/' &&
      <span className={`btn btn-link ${styles.up}`} onClick={onBack}>
        <Icon name="contract"/>
        Up
      </span>
    }
  </LayoutHeader>;

  console.log(path);

  const body = (
    <div style={{ flex: 1 }}>
      <FileListing systemId={systemId} path={path} onNavigate={onNavigate}></FileListing>
    </div>
  );

  return <PageLayout top={header} right={body}></PageLayout>;
};

export default Layout;
