export const resolveBasePath = () => {
  let baseUrl = window.location.href.split("/#")[0]
    .replace(/^https:\/\/ui\./, 'https://');
  console.log({baseUrl})
  // Direct request from local dev env to dev.develop
  if (/127\.0\.0\.1|localhost|0\.0\.0\.0/.test(baseUrl)) {
    return 'https://dev.develop.tapis.io';
  }

  return baseUrl;
};
