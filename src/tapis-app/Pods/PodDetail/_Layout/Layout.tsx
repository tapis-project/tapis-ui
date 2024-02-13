import { PodDetail } from 'tapis-ui/components/pods';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';

const Layout: React.FC<{ podId: string }> = ({ podId }) => {
  const header = (
    <LayoutHeader type={'sub-header'}>Pod Details</LayoutHeader>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <PodDetail podId={podId}></PodDetail>
    </div>
  );

  return <PageLayout top={header} right={body}></PageLayout>;
};

export default Layout;
