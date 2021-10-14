import { FileListing } from 'tapis-ui/components/files';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
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
  const header = <LayoutHeader type={'sub-header'}>Files</LayoutHeader>;

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
