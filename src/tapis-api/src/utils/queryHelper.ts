import { TapisQueryParams } from './types';

const queryHelper = async <T extends unknown>(params: TapisQueryParams<T>): Promise<T> => {
  const { module, func, args, jwt, basePath } = params;

  const headers = {};
  if (jwt) {
    headers["X-Tapis-Token"] = jwt;
  }

  // Generate a configuration object for the module with the
  // API URL and the authorization header
  const configuration = new (module.Configuration)({
    basePath,
    headers
  });

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