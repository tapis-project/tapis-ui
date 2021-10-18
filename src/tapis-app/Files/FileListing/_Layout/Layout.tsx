import { FileListing } from 'tapis-ui/components/files';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import styles from './Layout.module.scss';
type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
};

const Layout: React.FC<LayoutProps> = ({ systemId, path, location }) => {
  const body = (
    <FileListing
      systemId={systemId}
      path={path}
      location={location}
    ></FileListing>
  );

  return <PageLayout right={body} constrain></PageLayout>;
};

export default Layout;
