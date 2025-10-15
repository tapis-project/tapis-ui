export const resolveMLHubBasePath = () => {
  const basePath = import.meta.env.VITE_MLHUB_BASE_URL;
  if (!basePath) {
    throw new Error('VITE_MLHUB_BASE_URL environment variable is not set');
  }

  // Use /api/ml-hub proxy for localhost to avoid CORS
  if (basePath.includes('127.0.0.1') || basePath.includes('localhost')) {
    return '/api/ml-hub';
  }

  return basePath;
};
