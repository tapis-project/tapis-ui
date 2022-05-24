import { Jobs, Apps, Systems } from '@tapis/tapis-typescript';

export type JobLauncherProviderParams = {
  job: Partial<Jobs.ReqSubmitJob>;
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
};

export type JobStep = {
  id: string;
  name: string;
  render: React.ReactNode;
  summary: React.ReactNode;
  generateInitialValues: (
    props: JobLauncherProviderParams
  ) => Partial<Jobs.ReqSubmitJob>;
  validateThunk?: (
    props: JobLauncherProviderParams
  ) => (values: Partial<Jobs.ReqSubmitJob>) => any;
  validationSchema: any;
};

export { default } from './JobLauncherWizard';
