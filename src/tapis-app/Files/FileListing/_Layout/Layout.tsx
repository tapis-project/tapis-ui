import { FileListing } from 'tapis-ui/components/files';
import { PageLayout, LayoutHeader, Icon } from 'tapis-ui/_common';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
  backLocation?: string;
}

const Layout: React.FC<LayoutProps> = ({
  systemId,
  path,
  location,
  backLocation = undefined
}) => {
  const header = (
    <LayoutHeader type={'sub-header'}>
      <div>Files</div>
      {backLocation && (
        <span className={styles.up}>
          <Icon name="contract" />
          <NavLink to={backLocation}>Up</NavLink>
        </span>
      )}
    </LayoutHeader>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <FileListing
        systemId={systemId}
        path={path}
        location={location}
      ></FileListing>
    </div>
  );

  return <PageLayout top={header} right={body}></PageLayout>;
};

export default Layout;
