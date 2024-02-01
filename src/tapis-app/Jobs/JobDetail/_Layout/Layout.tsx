import React from 'react';
import { JobDetail } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import { JobsToolbar } from "tapis-app/Jobs/_components";
import { useDetails } from "tapis-hooks/jobs";

interface JobDetailProps {
  jobUuid: string;
}



const Layout: React.FC<JobDetailProps> = ({ jobUuid }) => {
  // eslint-disable-next-line
  const { data, isLoading, error } = useDetails(jobUuid);

  if (error) {return <div>{error}</div>}

  const header = (
    <LayoutHeader type={"sub-header"}>
      Job Details
      {
        data && 
        <JobsToolbar jobUuid={jobUuid} /> 
      }
      
    </LayoutHeader>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <JobDetail jobUuid={jobUuid}></JobDetail>
    </div>
  );
  return <PageLayout top={header} right={body}></PageLayout>
};

export default Layout;
