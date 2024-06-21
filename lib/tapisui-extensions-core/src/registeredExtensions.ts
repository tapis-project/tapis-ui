type ExtensionData = { baseUrls: Array<string> };
type RegisteredExtensions = { [key: string]: ExtensionData };

export const registeredExtensions: RegisteredExtensions = {
  '@icicle/tapisui-extension': {
    baseUrls: ['https://icicle.tapis.io', 'https://icicleai.tapis.io'],
  },
};
