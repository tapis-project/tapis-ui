import { PodDetail } from '@tapis/tapisui-common';
import { PodFunctionBar } from 'app/Pods/_components';
import { PageLayout, LayoutHeader } from '@tapis/tapisui-common';

const Layout: React.FC<{ podId: string }> = ({ podId }) => {
  const header = (
    <LayoutHeader type={'sub-header'}>
      Pod Details
      <PodFunctionBar />
    </LayoutHeader>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <PodDetail podId={podId}></PodDetail>
    </div>
  );

  return <PageLayout top={header} right={body}></PageLayout>;
};

export default Layout;
