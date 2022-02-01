import { RootState } from 'tapis-app/provider/store';
import { useSelector, useDispatch } from 'react-redux';
import {
  select as selectAction,
  unselect as unselectAction,
  clear as clearAction
} from './fileSelectionSlice';
import { Files } from '@tapis/tapis-typescript';

export const useFilesSelect = () => useSelector((state: RootState) => state.files.selection);

export const useFilesSelectActions = () => {
  const dispatch = useDispatch();
  const select = (files: Array<Files.FileInfo>, mode: 'single' | 'multi') => dispatch(
    selectAction({ files, mode })
  );
  const unselect = (files: Array<Files.FileInfo>) => dispatch(unselectAction(files));
  const clear = () => dispatch(clearAction());
  return {
    select,
    unselect,
    clear
  };
};
