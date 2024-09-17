import { request } from 'app/apis/utils';
import { type Callbacks } from 'app/apis';

export const decoder = async <T extends any>(
  fn: () => ReturnType<typeof request>,
  callbacks: Callbacks<T>
) => {
  fn()
    .then((res) => res.json())
    .then((res: T) => {
      const success = (res as any).status === undefined ? true : false;
      if (success && callbacks?.onSuccess) {
        callbacks.onSuccess({ result: res, error: undefined });
      }

      if (!success && callbacks?.onError) {
        callbacks.onError({
          result: undefined,
          error: new Error((res as any).message),
        });
      }
    });
};
