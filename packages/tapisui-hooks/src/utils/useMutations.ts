import { MutateOptions } from 'react-query';
import { useState } from 'react';
import { from, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export type MutationFunction<T, ResponseType> = (
  item: T,
  options?: MutateOptions<ResponseType, Error, T>
) => Promise<ResponseType>;

type UseMutationsParams<T, ResponseType> = {
  fn: MutationFunction<T, ResponseType>;
  onStart?: (item: T) => void;
  onSuccess?: (item: T, response: ResponseType) => void;
  onError?: (item: T, error: Error) => void;
  onComplete?: () => void;
};

const useMutations = <T extends unknown, ResponseType extends unknown>(
  params: UseMutationsParams<T, ResponseType>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { fn, onSuccess, onError, onComplete, onStart } = params;

  const run = (items: Array<T>) => {
    setIsLoading(true);
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
          setIsLoading(false);
          setIsFinished(true);
          onComplete && onComplete();
        }
      );
  };

  return {
    isLoading,
    isFinished,
    run,
  };
};

export default useMutations;
