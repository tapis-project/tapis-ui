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

  // Don't need the below because error message is already shown, as an error not as plain text like below would do
  // if (error) {
  //   return <div>Error: {error.message}</div>;
  // }

  // Use this block below to hide error message and only show in console
  // if (error) {
  //   console.error(error); // Log the error for debugging
  //   return <div>Something went wrong. Please try again later.</div>;
  // }

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
