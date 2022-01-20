import React from 'react';
import { JobLauncherContextType } from '.';

export const jobLauncherContext: JobLauncherContextType = {
  job: {},
  dispatch: () => {},
};

const JobLauncherContext: React.Context<JobLauncherContextType> =
  React.createContext<JobLauncherContextType>(jobLauncherContext);

export default JobLauncherContext;
