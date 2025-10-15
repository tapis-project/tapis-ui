export const resolveMLHubBasePath = () => {
  const basePath = import.meta.env.VITE_MLHUB_BASE_URL;
  if (!basePath) {
    throw new Error('VITE_MLHUB_BASE_URL environment variable is not set');
  }
  return basePath;
};
