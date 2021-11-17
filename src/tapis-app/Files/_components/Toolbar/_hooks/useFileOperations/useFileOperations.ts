import { useMutations } from 'tapis-hooks/utils';
import { useReducer, useState } from 'react';
import { MutationFunction } from 'tapis-hooks/utils/useMutations';
import { FileOpEventStatus, FileOpState } from '.';

type UseFileOperationsParams<T, ResponseType> = {
  fn: MutationFunction<T, ResponseType>;
  key?: (item: T) => string;
  onComplete?: () => void;
}

interface FileParamType {
  path?: string;
}

const useFileOperations = <T extends FileParamType, ResponseType extends unknown>(
  {
    // Mutation function to run
    fn,
    // Optional identifier function for the state dictionary
    key = (item: T) => item.path!,
    onComplete
  }: UseFileOperationsParams<T, ResponseType>,
) => {

  const [started, setStarted] = useState(false);

  const reducer = (
    state: FileOpState,
    action: { item: T, status: FileOpEventStatus; error?: Error }
  ) => {
    const { item, status, error } = action; 
    return {
      ...state,
      [key(item)]: { status, error }
    }
  };

  const [state, dispatch] = useReducer(reducer, {} as FileOpState);

  const onStart = (item: T) => dispatch({
    item,
    status: FileOpEventStatus.loading
  });
  const onSuccess = (item: T) => dispatch({
    item,
    status: FileOpEventStatus.success
  });
  const onError = (item: T, error: Error) => dispatch({
    item,
    status: FileOpEventStatus.error,
    error
  })

  const { run, isRunning, isFinished } = useMutations<T, ResponseType>({
    fn,
    onStart,
    onSuccess,
    onError,
    onComplete
  });

  const errorEntry = Object.entries(state).find(([ _, state ]) => state.error);
  const error = errorEntry ? errorEntry[1].error! : null;
  const isSuccess = !isRunning && !error && started;

  return {
    run: (items: T[]) => { setStarted(true); return run(items) },
    isRunning,
    isFinished,
    isSuccess,
    error,
    state
  }
}

export default useFileOperations;