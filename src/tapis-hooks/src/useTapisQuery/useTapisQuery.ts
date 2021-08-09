import { useQuery, useMutation } from 'react-query';
import { useContext } from 'react';
import TapisContext, { TapisContextType } from '../context';
import { TapisQueryParams } from './types';

export const queryHelper = <T extends unknown>(params: TapisQueryParams<T>, tapisContext: TapisContextType): Promise<T> => {
  // Get configuration from TapisContext
  const token = tapisContext.accessToken && tapisContext.accessToken.access_token ? tapisContext.accessToken.access_token : null;
  const tenant = tapisContext.tenantUrl;

  const { module, func, args } = params;

  // Generate a configuration object for the module with the
  // API URL and the authorization header
  const configuration = new (module.Configuration)({
    basePath: tenant,

  });

  if (token) {
    configuration.headers = {
      headers: {
        "X-Tapis-Token": token
      }
    }
  }

  // Create an instance of the API
  const api: typeof params.api = new (params.api)(configuration);

  // Call the specified function name, and expect that specific return type
  const resultPromise: Promise<T> = func.apply(api, args);
  return resultPromise;
}

export const useTapisMutation = <T extends unknown>(params: TapisQueryParams<T>) => {
  const tapisContext = useContext<TapisContextType>(TapisContext);
  return useMutation(() => queryHelper<T>(params, tapisContext));
}

export const useTapisQuery = <T extends unknown>(params: TapisQueryParams<T>) => {
  const tapisContext = useContext<TapisContextType>(TapisContext);
  return useQuery(['query', params], () => queryHelper<T>(params, tapisContext));
}
