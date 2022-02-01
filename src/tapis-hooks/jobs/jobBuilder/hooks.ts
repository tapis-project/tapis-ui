import { RootState } from 'tapis-hooks/provider/store';
import { useSelector, useDispatch } from 'react-redux';
import {
  add as addAction,
  set as setAction,
  clear as clearAction,
} from './jobBuilderSlice';
import { Jobs } from '@tapis/tapis-typescript';

export const useJobBuilder = () =>
  useSelector((state: RootState) => state.jobs.builder);

export const useJobBuilderActions = () => {
  const dispatch = useDispatch();
  const add = (payload: Partial<Jobs.ReqSubmitJob>) =>
    dispatch(addAction(payload));
  const set = (payload: Partial<Jobs.ReqSubmitJob>) =>
    dispatch(setAction(payload));
  const clear = () => dispatch(clearAction());
  return {
    add,
    set,
    clear,
  };
};
