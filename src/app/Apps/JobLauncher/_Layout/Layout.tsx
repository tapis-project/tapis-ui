import React from 'react';
import { JobLauncher } from '@tapis/tapisui-common';
import { PageLayout, LayoutHeader } from '@tapis/tapisui-common';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const header = <LayoutHeader type={'sub-header'}>Job Launcher</LayoutHeader>;

  const body = (
    <div style={{ flex: 1, marginLeft: '1em' }}>
      <JobLauncher appId={appId} appVersion={appVersion} />
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default React.memo(Layout);
