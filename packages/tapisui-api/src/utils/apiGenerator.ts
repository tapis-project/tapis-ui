type BaseApiClass = {
  new (...args: any[]): any;
};

type ApiModule = {
  Configuration: {
    new (...args: any[]): any;
  };
};

type HeaderProvider = () => Record<string, string>;
const headerProviders = new Map<ApiModule, HeaderProvider>();

/**
 * Register a callback that returns extra headers for all API calls
 * using a given SDK module (e.g. Pods). The callback is invoked on
 * every request so it can read live state.
 */
export const registerModuleHeaders = (
  module: ApiModule,
  provider: HeaderProvider
) => {
  headerProviders.set(module, provider);
};

const apiGenerator = <T extends unknown>(
  module: ApiModule,
  api: BaseApiClass,
  basePath: string,
  jwt: string | null
): T => {
  const moduleHeaders = headerProviders.get(module)?.() ?? {};
  const headers: any = { ...moduleHeaders };
  if (jwt) {
    headers['X-Tapis-Token'] = jwt;
  }

  // Generate a configuration object for the module with the
  // API URL and the authorization header
  const configuration = new module.Configuration({
    basePath,
    headers,
  });

  // Create an instance of the API
  const result: T = new api(configuration);
  return result;
};

export default apiGenerator;
