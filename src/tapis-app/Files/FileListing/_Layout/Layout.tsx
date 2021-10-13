import { FileListing } from 'tapis-ui/components/files';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import { useParams } from 'react-router';

const Layout: React.FC<{ systemId: string; path: string }> = ({
  systemId,
  path,
}) => {
  const params = useParams();
  console.log(params);
  const header = <LayoutHeader type={'sub-header'}>Files</LayoutHeader>;

  const body = (
    <div style={{ flex: 1 }}>
      <FileListing systemId={systemId} path={path}></FileListing>
    </div>
  );

  return <PageLayout top={header} right={body}></PageLayout>;
};

export default Layout;
