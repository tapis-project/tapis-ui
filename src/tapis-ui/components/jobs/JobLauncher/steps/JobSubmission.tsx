import { Apps } from '@tapis/tapis-typescript';

type JobStartProps = {
  app: Apps.TapisApp;
};

export const JobSubmission: React.FC<JobStartProps> = ({ app }) => {
  return <div>Job Submission</div>;
};

export const JobSubmissionSummary: React.FC = () => {
  return <div>Job Submission</div>;
};
