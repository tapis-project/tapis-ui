type ExtensionData = { baseUrls: Array<string> };
type RegisteredExtensions = { [key: string]: ExtensionData };

export const registeredExtensions: RegisteredExtensions = {
  '@icicle/tapisui-extension': {
    baseUrls: [
      'https://icicle.tapis.io',
      'https://icicleai.tapis.io',
      'https://icicle.develop.tapis.io',
      'https://icicleai.develop.tapis.io',
      'https://icicle.staging.tapis.io',
      'https://icicleai.staging.tapis.io',
      'https://dev.develop.tapis.io', // TODO Remove before prod
    ],
  },
};
