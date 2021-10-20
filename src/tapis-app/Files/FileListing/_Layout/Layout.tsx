import { Files } from '@tapis/tapis-typescript';
import { FileListing } from 'tapis-ui/components/files';
import { PageLayout } from 'tapis-ui/_common';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
  onSelect?: (files: Array<Files.FileInfo>) => any
};

const Layout: React.FC<LayoutProps> = ({ systemId, path, location, onSelect }) => {
  const body = (
    <div className={styles.body}>
      <FileListing
        systemId={systemId}
        path={path}
        location={location}
        select={{ mode: "multi" }}
        onSelect={onSelect}
      ></FileListing>
    </div>
  );

  return <PageLayout right={body} constrain></PageLayout>;
};

export default Layout;
