type ExtensionData = { baseUrls: Array<string> };
type RegisteredExtensions = { [key: string]: ExtensionData };

export const registeredExtensions: RegisteredExtensions = {
  '@scoped/tapisui-extension': {
    baseUrls: ['https://scoped.tapis.io'],
  },
  '@icicle/tapisui-extension': {
    baseUrls: [
      'https://icicle.tapis.io',
      'https://icicleai.tapis.io',
      'https://icicle.develop.tapis.io',
      'https://icicleai.develop.tapis.io',
      'https://icicle.staging.tapis.io',
      'https://icicleai.staging.tapis.io',
    ],
  },
  '@demo/tapisui-extension': {
    baseUrls: [
      //'https://tacc.develop.tapis.io', // development only
      'https://public.tapis.io',
      'https://public.develop.tapis.io',
    ],
  },
};
