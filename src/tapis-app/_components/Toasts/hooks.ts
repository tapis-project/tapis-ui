import { RootState } from 'tapis-app/provider/store';
import { useSelector, useDispatch } from 'react-redux';
import {
  add as addAction,
  markread as markReadAction,
  set as setAction,
  remove as removeAction,
  clear as clearAction,
} from './toastsSlice';
import { ToastType } from '.';

export const useToasts = () => useSelector((state: RootState) => state.toasts);

export const useToastActions = () => {
  const dispatch = useDispatch();
  const add = (toast: ToastType) => dispatch(addAction(toast));
  const markread = (id: string) => dispatch(markReadAction(id));
  const set = (id: string, toast: ToastType) =>
    dispatch(setAction({ id, toast }));
  const remove = (id: string) => dispatch(removeAction(id));
  const clear = () => dispatch(clearAction());
  return {
    add,
    markread,
    set,
    remove,
    clear,
  };
};
