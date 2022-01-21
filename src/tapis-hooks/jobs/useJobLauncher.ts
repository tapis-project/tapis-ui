import { Jobs } from '@tapis/tapis-typescript';
import withFragment from 'tapis-hooks/utils/withFragment';

const { useFragmentContext, Provider } = withFragment<Jobs.ReqSubmitJob>();

export const useJobLauncher = () => {
  const { data, add, set, clear } = useFragmentContext();
  return {
    job: data,
    add,
    set,
    clear,
  };
};

export const JobLauncherProvider = Provider;

export default useJobLauncher;
