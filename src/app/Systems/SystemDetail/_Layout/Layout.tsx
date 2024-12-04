import { SystemDetail } from '@tapis/tapisui-common';
import { PageLayout, LayoutHeader } from '@tapis/tapisui-common';
import SystemLayoutToolbar from './SystemLayoutToolbar';

const Layout: React.FC<{ systemId: string }> = ({ systemId }) => {
  // const header = (
  //   <LayoutHeader type={'sub-header'}>
  //     Systems
  //     <SystemLayoutToolbar />
  //   </LayoutHeader>
  // );

  const body = (
    <div style={{ flex: 1, marginLeft: '1em' }}>
      <SystemDetail systemId={systemId} />
    </div>
  );

  return <PageLayout right={body}></PageLayout>;
};

export default Layout;
