import React from 'react';
import { JobDetail } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';

interface JobDetailProps {
  jobUuid: string;
}

const Layout: React.FC<JobDetailProps> = ({ jobUuid }) => {
  const header = <LayoutHeader type={'sub-header'}>Job Details</LayoutHeader>;

  const body = (
    <div style={{ flex: 1 }}>
      <JobDetail jobUuid={jobUuid}></JobDetail>
    </div>
  );
  return <PageLayout top={header} right={body}></PageLayout>;
};

export default Layout;
