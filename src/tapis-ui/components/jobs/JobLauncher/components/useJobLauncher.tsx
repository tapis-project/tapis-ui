import React, { useContext } from 'react';
import { Jobs, Apps, Systems } from '@tapis/tapis-typescript';
import withBuilder from 'tapis-ui/utils/withBuilder';

type JobLauncherContextType = {
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
};

const JobLauncherContext = React.createContext<JobLauncherContextType>({
  app: {},
  systems: [],
});

const { useBuilderContext, Provider } = withBuilder<Jobs.ReqSubmitJob>();

export const useJobLauncher = () => {
  const { data, add, set, clear } = useBuilderContext();
  const { app, systems } = useContext(JobLauncherContext);
  return {
    job: data,
    add,
    set,
    clear,
    app,
    systems,
  };
};

type JobLauncherProviderProps = {
  value: {
    defaultValues: Partial<Jobs.ReqSubmitJob>;
    app: Apps.TapisApp;
    systems: Array<Systems.TapisSystem>;
  };
};

export const JobLauncherProvider: React.FC<
  React.PropsWithChildren<JobLauncherProviderProps>
> = ({ value, children }) => {
  const { app, systems, defaultValues } = value;
  return (
    <JobLauncherContext.Provider value={{ app, systems }}>
      {Provider({ value: defaultValues, children })}
    </JobLauncherContext.Provider>
  );
};

export default useJobLauncher;
