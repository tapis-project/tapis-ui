import useFileOperations from './useFileOperations';

export enum FileOpEventStatus {
  waiting = 'waiting',
  loading = 'loading',
  error = 'error',
  success = 'success',
  none = 'none',
}

export type FileOpState = {
  [path: string]: {
    status: FileOpEventStatus;
    error?: Error;
  };
};

export default useFileOperations;