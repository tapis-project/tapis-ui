import { RootState } from './store';
import { useSelector, useDispatch } from 'react-redux';
import { add as addAction, set as setAction, clear as clearAction } from './jobSlice';
import { Jobs } from '@tapis/tapis-typescript';

export const useJobLauncher = () => useSelector((state: RootState) => state.job.job);

export const useJobLauncherActions = () => {
  const dispatch = useDispatch();
  const add = (payload: Partial<Jobs.ReqSubmitJob>) => dispatch(addAction(payload));
  const set = (payload: Partial<Jobs.ReqSubmitJob>) => dispatch(setAction(payload));
  const clear = () => dispatch(clearAction());
  return {
    add,
    set,
    clear
  }
}