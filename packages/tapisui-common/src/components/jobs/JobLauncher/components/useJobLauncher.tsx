import React, { useContext } from 'react';
import { Jobs, Apps, Systems } from '@tapis/tapis-typescript';
import withBuilder from '../../../../utils/withBuilder';

type JobLauncherContextType = {
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
  schedulerProfiles: Array<Systems.SchedulerProfile>;
};

const JobLauncherContext = React.createContext<JobLauncherContextType>({
  app: {},
  systems: [],
  schedulerProfiles: [],
});

const { useBuilderContext, Provider } = withBuilder<Jobs.ReqSubmitJob>();

export const useJobLauncher = () => {
  const { data, add, set, clear } = useBuilderContext();
  const { app, systems, schedulerProfiles } = useContext(JobLauncherContext);
  return {
    job: data,
    add,
    set,
    clear,
    app,
    systems,
    schedulerProfiles,
  };
};

type JobLauncherProviderProps = {
  value: {
    defaultValues: Partial<Jobs.ReqSubmitJob>;
    app: Apps.TapisApp;
    systems: Array<Systems.TapisSystem>;
    schedulerProfiles: Array<Systems.SchedulerProfile>;
  };
};

export const JobLauncherProvider: React.FC<
  React.PropsWithChildren<JobLauncherProviderProps>
> = ({ value, children }) => {
  const { app, systems, defaultValues, schedulerProfiles } = value;
  return (
    <JobLauncherContext.Provider value={{ app, systems, schedulerProfiles }}>
      {Provider({ value: defaultValues, children })}
    </JobLauncherContext.Provider>
  );
};

export default useJobLauncher;
