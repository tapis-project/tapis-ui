import { MutateOptions } from 'react-query';
import { useState, useCallback } from 'react';
import { from, of } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';

type UseMutationsParams<T, ResponseType> = {
  fn: (
    item: T,
    options?: MutateOptions<ResponseType, Error, T>
  ) => Promise<ResponseType>;
  onStart?: (item: T) => void;
  onSuccess?: (item: T, response: ResponseType) => void;
  onError?: (item: T, error: Error) => void;
  onComplete?: () => void;
};

const useMutations = <T extends unknown, ResponseType extends unknown>(
  params: UseMutationsParams<T, ResponseType>
) => {
  const { fn, onSuccess, onError, onComplete, onStart } = params;
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const run = (items: Array<T>) => {
    setIsRunning(true);
    from(items)
      .pipe(
        concatMap((item) => {
          onStart && onStart(item);
          return of(item);
        }),
        concatMap((item) =>
          fn(item)
            .then((data) => {
              onSuccess && onSuccess(item, data);
            })
            .catch((error) => {
              onError && onError(item, error);
            })
        )
      )
      .subscribe(
        () => {},
        () => {},
        () => {
          setIsRunning(false);
          setIsFinished(true);
          onComplete && onComplete();
        }
      );  
  }


  return {
    isRunning,
    isFinished,
    run,
  };
};

export default useMutations;
