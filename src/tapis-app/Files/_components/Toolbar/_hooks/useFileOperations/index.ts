import useFileOperations from './useFileOperations';

export enum FileOpEventStatusEnum {
  waiting = 'waiting',
  loading = 'loading',
  error = 'error',
  success = 'success',
  none = 'none',
}

export type FileOpState = {
  [path: string]: {
    status: FileOpEventStatusEnum;
    error?: Error;
  };
};

export default useFileOperations;
