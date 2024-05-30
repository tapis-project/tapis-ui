import { createExtension, EnumCoreTapisService } from '@tapis/tapisui-extensions-core';

const icicleExtension = createExtension({
  multiTenantFeatures: false,
  authentication: {
    implicit: {
      authorizationPath: "v3/oauth2/authorize",
      clientId: "myclientid",
      redirectURI: "tapis-ui/#/oauth2/callback",
      responseType: "token"
    }
  },
  removeServices: [EnumCoreTapisService.Apps],
  mainSidebarServices: ["workflows", "pods", "ml-edge"],
  authMethods: ["implicit", "password"],
  logo: {
    logoText: "ICICLE"
  }
})

icicleExtension.registerService({
  id: "ml-edge",
  sidebarName: "ML Edge",
  icon: "share",
  pageComponent: "Hello from the extension library"
})

export {icicleExtension};