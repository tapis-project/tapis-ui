import { useContext } from 'react';
import JobLauncherContext from './JobLauncherContext';
import { v4 as uuidv4 } from 'uuid';
import { Jobs } from '@tapis/tapis-typescript';

const useJobLauncher = () => {
  const { job, dispatch } = useContext(JobLauncherContext);

  const add = (fragment: Partial<Jobs.ReqSubmitJob>) => 
    dispatch({ operation: 'add', fragment });

  const set = (fragment: Partial<Jobs.ReqSubmitJob>) => {
    dispatch({ operation: 'set', fragment });
  };

  const clear = () => dispatch({ operation: 'clear' });

  return {
    add,
    set,
    clear,
    job
  };
};

export default useJobLauncher;
