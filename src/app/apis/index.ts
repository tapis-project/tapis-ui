export * as Github from './Github';

export type APIResponse<Resp> = {
  result: Resp | undefined;
  error: Error | undefined;
};

export type Callbacks<T> =
  | {
      onSuccess?: (response: APIResponse<T>) => void;
      onError?: (response: APIResponse<T>) => void;
    }
  | undefined;
export type API<Req, Resp> = (params: Req, callbacks?: Callbacks<Resp>) => void;
