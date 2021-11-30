import { TapisSystem } from '@tapis/tapis-typescript-systems';
import * as Apps from '@tapis/tapis-typescript-apps';

export { default } from './JobLauncher';

export type JobStepProps = {
  app?: Apps.TapisApp;
  systems?: Array<TapisSystem>;
};
