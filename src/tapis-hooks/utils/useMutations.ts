import { MutateOptions } from 'react-query';
import { useState, useCallback } from 'react';
import { from, of } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';

type UseMutationsParams<T, ResponseType> = {
  fn: (item: T,  options?: MutateOptions<ResponseType, Error, T>) => Promise<ResponseType>;
  onSuccess?: (item: T, response: ResponseType) => void;
  onError?: (item: T, error: Error) => void;
  onComplete?: () => void;
}

const useMutations = <T extends unknown, ResponseType extends unknown>(params: UseMutationsParams<T, ResponseType>) => {
  const { fn, onSuccess, onError, onComplete } = params;
  const [ current, setCurrent ] = useState<T | null>(null);
  const [ isRunning, setIsRunning ] = useState(false); 
  const [ isFinished, setIsFinished ] = useState(false);


  const run = useCallback(
    (items: Array<T>) => {
      setIsRunning(true);
      from(items).pipe(
        concatMap(
          (item, index) => { setCurrent(item); return of(item); }
        ),
        concatMap(
          item => fn(item).then(
            (data) => {
              onSuccess && onSuccess(item, data);
              return { item, data }
            }
          ).catch(
            (error) => {
              throw { item, error }
            }
          )
        ),
        catchError(
          ({ item, error }) => { 
            onError && onError(item, error);
            return of({ item, error });
          }
        )
      ).subscribe(
        () => { },
        () => { },
        () => {
          setIsRunning(false);
          setIsFinished(true);
          onComplete && onComplete();
        }
      );
    }, [setCurrent, setIsRunning, setIsFinished]
  );

  return {
    current,
    isRunning,
    isFinished,
    run
  }
  
}

export default useMutations