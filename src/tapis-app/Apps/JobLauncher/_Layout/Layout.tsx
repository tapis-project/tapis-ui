import React from 'react';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import { useDetail } from 'tapis-hooks/apps';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { useList as useSystemsList } from 'tapis-hooks/systems';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const { data, isLoading, error } = useDetail({ appId, appVersion }, { refetchOnWindowFocus: false });
  const { 
    data: systemsData, 
    isLoading: systemsIsLoading, 
    error: systemsError
  } = useSystemsList({ select: "allAttributes" }, { refetchOnWindowFocus: false });
  const app = data?.result;
  const systems = systemsData?.result ?? [];

  const header = <LayoutHeader type={'sub-header'}>Job Launcher</LayoutHeader>;

  const body = (
    <div style={{ flex: 1 }}>
      <QueryWrapper isLoading={isLoading || systemsIsLoading } error={error ?? systemsError}>
        <JobLauncher app={app!} systems={systems} />
      </QueryWrapper>
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default React.memo(Layout);
