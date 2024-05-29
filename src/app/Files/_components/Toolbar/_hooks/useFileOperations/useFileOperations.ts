import { utils } from '@tapis/tapisui-hooks';
import { useReducer, useState } from 'react';
import { FileOpEventStatusEnum, FileOpState } from '.';

type UseFileOperationsParams<T, ResponseType> = {
  fn: utils.MutationFunction<T, ResponseType>;
  key?: (item: T) => string;
  onComplete?: () => void;
};

interface FileParamType {
  path?: string;
}

const useFileOperations = <
  T extends FileParamType,
  ResponseType extends unknown
>({
  // Mutation function to run
  fn,
  // Optional identifier function for the state dictionary
  key = (item: T) => item.path!,
  onComplete,
}: UseFileOperationsParams<T, ResponseType>) => {
  const [started, setStarted] = useState(false);

  const reducer = (
    state: FileOpState,
    action: { item: T; status: FileOpEventStatusEnum; error?: Error }
  ) => {
    const { item, status, error } = action;
    return {
      ...state,
      [key(item)]: { status, error },
    };
  };

  const [state, dispatch] = useReducer(reducer, {} as FileOpState);

  const onStart = (item: T) =>
    dispatch({
      item,
      status: FileOpEventStatusEnum.loading,
    });
  const onSuccess = (item: T) =>
    dispatch({
      item,
      status: FileOpEventStatusEnum.success,
    });
  const onError = (item: T, error: Error) =>
    dispatch({
      item,
      status: FileOpEventStatusEnum.error,
      error,
    });

  const { run, isLoading, isFinished } = utils.useMutations<T, ResponseType>({
    fn,
    onStart,
    onSuccess,
    onError,
    onComplete,
  });

  const errorEntry = Object.entries(state).find(([_, state]) => state.error);
  const error = errorEntry ? errorEntry[1].error! : null;
  const isSuccess = !isLoading && !error && started;

  return {
    run: (items: T[]) => {
      setStarted(true);
      return run(items);
    },
    isLoading,
    isFinished,
    isSuccess,
    error,
    state,
  };
};

export default useFileOperations;
