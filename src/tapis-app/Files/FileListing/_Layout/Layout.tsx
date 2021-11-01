import { FileListing } from 'tapis-ui/components/files';
import { PageLayout } from 'tapis-ui/_common';
import { OnSelectCallback } from 'tapis-ui/components/files/FileListing/FileListing';
import styles from './Layout.module.scss';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
  onSelect: OnSelectCallback;
};

const Layout: React.FC<LayoutProps> = ({
  systemId,
  path,
  location,
  onSelect,
}) => {
  const body = (
    <div className={styles.body}>
      <FileListing
        className={styles.container}
        systemId={systemId}
        path={path}
        location={location}
        select={{ mode: 'multi' }}
        onSelect={onSelect}
      ></FileListing>
    </div>
  );

  return <PageLayout right={body} constrain></PageLayout>;
};

export default Layout;
