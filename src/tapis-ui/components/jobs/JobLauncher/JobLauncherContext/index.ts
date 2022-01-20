import { Jobs } from '@tapis/tapis-typescript';

export { default as useJobLauncher } from './useJobLauncher';
export { default as JobLauncherProvider } from './JobLauncherProvider';

export type JobLauncherContextType = {
  job: Partial<Jobs.ReqSubmitJob>; 
  dispatch: React.Dispatch<{
    operation: 'set' | 'add' | 'clear';
    fragment?: Partial<Jobs.ReqSubmitJob>
  }>;
};
