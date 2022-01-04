import React from 'react';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import { useDetail } from 'tapis-hooks/apps';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const { data: appData } = useDetail({ appId, appVersion });
  const app = appData?.result;

  const header = <LayoutHeader type={'sub-header'}>Job Launcher</LayoutHeader>;

  const body = (
    <div style={{ flex: 1 }}>{app && <JobLauncher app={app} />}</div>
  );

  return <PageLayout top={header} right={body} />;
};

export default React.memo(Layout);
