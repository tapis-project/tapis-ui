import { useQuery, useMutation } from 'react-query';
import { useContext } from 'react';
import TapisContext, { TapisContextType } from '../context';
import { TapisQueryParams } from './types';

const queryHelper = async <T extends unknown>(params: TapisQueryParams<T>, tapisContext: TapisContextType): Promise<T> => {
  // Get configuration from TapisContext
  const token = tapisContext.accessToken && tapisContext.accessToken.access_token ? tapisContext.accessToken.access_token : null;
  const tenant = tapisContext.tenantUrl;

  const { module, func, args } = params;

  // Generate a configuration object for the module with the
  // API URL and the authorization header
  const configuration = new (module.Configuration)({
    basePath: tenant,

  });

  // If a token is present, add it to the headers for the call.
  // (Some operations do not require a token)
  if (token) {
    configuration.headers = {
      headers: {
        "X-Tapis-Token": token
      }
    }
  }

  // Create an instance of the API
  const api: typeof params.api = new (params.api)(configuration);

  try {
    // Call the specified function name, and expect that specific return type
    const result: T = await func.apply(api, args);
    return result;
  } catch (error) {
    // If an exception occurred, try to decode the json response from it and
    // rethrow it
    if (error.json) {
      const decoded = await error.json();
      throw decoded;
    } else {
      throw error;
    }
  }
}

export default queryHelper;