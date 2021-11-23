import { StepWizardChildProps } from 'react-step-wizard';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps';

export { default } from './JobLauncherWizard';

export type JobStepProps = {
  app?: Apps.TapisApp;
  systems: Array<TapisSystem>;
  dispatch: React.Dispatch<Partial<Jobs.ReqSubmitJob>>;
} & Partial<StepWizardChildProps>
