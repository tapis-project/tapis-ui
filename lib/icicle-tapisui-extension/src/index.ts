import { createExtension, EnumTapisCoreService } from '@tapis/tapisui-extensions-core';

const extension = createExtension({
  multiTenantFeatures: false,
  authentication: {
    implicit: {
      authorizationPath: "v3/oauth2/authorize",
      clientId: "myclientid",
      redirectURI: "tapis-ui/#/oauth2/callback",
      responseType: "token"
    }
  },
  removeServices: [EnumTapisCoreService.Apps],
  mainSidebarServices: ["workflows", "pods", "ml-edge"],
  authMethods: ["implicit", "password"],
  logo: {
    logoText: "ICICLE"
  }
})

extension.registerService({
  id: "ml-edge",
  sidebarName: "ML Edge",
  iconName: "share"
})

export {extension};