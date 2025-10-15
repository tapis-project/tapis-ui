export const resolveMLHubBasePath = () => {
  const basePath = "https://dev.develop.tapis.io";
  if (!basePath) {
    throw new Error("VITE_MLHUB_BASE_URL environment variable is not set");
  }

  return basePath.endsWith("/v3") ? basePath : basePath + "/v3";
};
