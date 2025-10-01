type BaseApiClass = {
  new (...args: any[]): any;
};

type ApiModule = {
  Configuration: {
    new (...args: any[]): any;
  };
};

const apiGenerator = <T extends unknown>(
  module: ApiModule,
  api: BaseApiClass,
  basePath: string,
  jwt: string | null
): T => {
  const headers: any = {};
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
