export const isLocalhost = () =>
  /127\.0\.0\.1|localhost/.test(window.location.hostname);

export const resolveBasePath = () => {
  let baseUrl = import.meta.env.VITE_TAPIS_BASE_URL;
  if (import.meta.env.VITE_SERVERLESS_DEPLOYMENT !== 'true') {
    baseUrl = window.location.origin;
  }

  // Use the specified Tapis Base URL if a local deployment is detected
  // if (/127\.0\.0\.1|localhost|0\.0\.0\.0/.test(baseUrl)) {
  if (/127\.0\.0\.1|localhost/.test(baseUrl)) {
    if (!import.meta.env.VITE_TAPIS_BASE_URL) {
      // Without this every consumer gets basePath=undefined and crashes far
      // from the actual cause (e.g. basePath.replace in Dashboard).
      console.error(
        'resolveBasePath: running on localhost but VITE_TAPIS_BASE_URL is not set — ' +
          'uncomment/set it in .env and restart `pnpm dev`.'
      );
    }
    return import.meta.env.VITE_TAPIS_BASE_URL;
  }

  return baseUrl;
};
