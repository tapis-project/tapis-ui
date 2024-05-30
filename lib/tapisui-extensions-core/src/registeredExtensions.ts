type PermittedExtensions = "@icicle/tapisui-extension"
type ExtensionData = {baseUrls: Array<string>}
type RegisteredExtensions = Record<PermittedExtensions, ExtensionData>

export const registeredExtensions: RegisteredExtensions = {
  '@icicle/tapisui-extension': {
    baseUrls: [
      'https://icicle.tapis.io',
      'https://icicle.develop.tapis.io',
      'https://icicle.staging.tapis.io',
    ],
  },
};