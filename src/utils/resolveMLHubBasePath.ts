export const resolveMLHubBasePath = () => {
  // TODO: remove this once we have a proper environment variable
  // const basePath = 'https://tacc.tapis.io/v3/mlhub';
  const basePath = 'http://localhost:64722';
  return basePath;
  if (!basePath) {
    throw new Error('VITE_MLHUB_BASE_URL environment variable is not set');
  }

  return basePath.endsWith('/v3') ? basePath : basePath + '/v3';
};
