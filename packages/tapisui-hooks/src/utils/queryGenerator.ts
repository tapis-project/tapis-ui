import { useQuery, QueryObserverOptions } from 'react-query';
import { useTapisConfig } from '../';

const queryGenerator = <TReq, TResp>(
  apiFn: (params: TReq | {}, ...args: any[]) => Promise<TResp>,
  queryKey: string,
  defaultParams: TReq | {} = {},
  defaultOptions: QueryObserverOptions<TResp, Error> = {}
) => {
  const query = (
    params: typeof defaultParams = defaultParams,
    options: typeof defaultOptions = defaultOptions
  ) => {
    const { accessToken, basePath } = useTapisConfig();
    const result = useQuery<TResp, Error>(
      [queryKey, params, accessToken],
      // Default to no token. This will generate a 403 when calling the list function
      // which is expected behavior for not having a token
      () => apiFn(params, basePath, accessToken?.access_token ?? ''),
      {
        ...options,
        enabled: !!accessToken,
      }
    );
    return result;
  };

  return query;
};

export default queryGenerator;
