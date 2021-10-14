import { FileListing } from 'tapis-ui/components/files';
import { PageLayout, LayoutHeader, Breadcrumbs} from 'tapis-ui/_common';
import Toolbar from '../../_components/Toolbar';

type LayoutProps = {
  systemId: string;
  path: string;
  location: string;
  backLocation?: string;
};

const Layout: React.FC<LayoutProps> = ({
  systemId,
  path,
  location,
  backLocation = undefined,
}) => {
  const header = (
    <LayoutHeader type={'sub-header'}>
      <div>
        <Breadcrumbs items={['sys-name']} />
        <Toolbar />
      </div>
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
