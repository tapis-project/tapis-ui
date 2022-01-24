import { Apps } from '@tapis/tapis-typescript';
import useJobLauncher from 'tapis-hooks/jobs/useJobLauncher';

type JobStartProps = {
  app: Apps.TapisApp;
};

export const JobSubmission: React.FC<JobStartProps> = ({ app }) => {
  return (
    <div>
      Job Submission
    </div>
  );
};

export const JobSubmissionSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { name, appId, appVersion } = job;
  return (
    <div>
      Job Submission
    </div>
  );
};
