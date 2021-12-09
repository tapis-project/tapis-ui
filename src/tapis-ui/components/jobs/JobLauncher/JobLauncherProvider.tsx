import { ReqSubmitJob } from '@tapis/tapis-typescript-jobs';
import withFragment from 'tapis-hooks/utils/withFragment';

const { useFragmentContext, Provider } = withFragment<ReqSubmitJob>();

export const useJobLauncher = () => {
  const { data, dispatch } = useFragmentContext();
  return {
    jobSubmission: data,
    dispatch,
  };
};

const JobLauncherProvider = Provider;

export default JobLauncherProvider;
