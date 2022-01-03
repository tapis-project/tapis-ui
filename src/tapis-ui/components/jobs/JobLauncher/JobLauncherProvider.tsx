import { ReqSubmitJob } from '@tapis/tapis-typescript-jobs';
import withFragment from 'tapis-hooks/utils/withFragment';

const { useFragmentContext, Provider } = withFragment<ReqSubmitJob>();

export const useJobLauncher = () => {
  const { data, set, reset } = useFragmentContext();
  return {
    jobSubmission: data,
    set,
    reset
  };
};

const JobLauncherProvider = Provider;

export default JobLauncherProvider;
