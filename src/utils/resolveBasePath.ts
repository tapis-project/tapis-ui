export const resolveBasePath = () => {
  let baseUrl = import.meta.env.VITE_TAPIS_BASE_URL;
  if (import.meta.env.VITE_SERVERLESS_DEPLOYMENT !== 'true') {
    baseUrl = window.location.origin;
  }

  // Use the specified Tapis Base URL if a local deployment is detected
  // if (/127\.0\.0\.1|localhost|0\.0\.0\.0/.test(baseUrl)) {
  if (/127\.0\.0\.1|localhost/.test(baseUrl)) {
    return import.meta.env.VITE_TAPIS_BASE_URL;
  }

  return baseUrl;
};
