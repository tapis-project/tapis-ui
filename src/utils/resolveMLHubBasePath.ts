import { resolveBasePath } from './resolveBasePath';

export const resolveMLHubBasePath = () => {
  let basePath = import.meta.env.VITE_MLHUB_BASE_URL;
  if (!basePath) {
    basePath = resolveBasePath();
  }
  return basePath;
};
