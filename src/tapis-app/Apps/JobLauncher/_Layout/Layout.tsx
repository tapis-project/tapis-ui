import React from 'react';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import { useDetail } from 'tapis-hooks/apps';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const { data, isLoading, error } = useDetail({ appId, appVersion });
  const app = data?.result;

  const header = <LayoutHeader type={'sub-header'}>Job Launcher</LayoutHeader>;

  const body = (
    <div style={{ flex: 1 }}>
      <QueryWrapper isLoading={isLoading} error={error}>
        <JobLauncher app={app!} />
      </QueryWrapper>
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default React.memo(Layout);
