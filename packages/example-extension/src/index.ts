import {
  createExtension,
  EnumTapisCoreService,
} from '@tapis/tapisui-extensions-core';
import { MyNewPage } from './pages';

const extension = createExtension({
  allowMultiTenant: false,
  authentication: {
    password: true,
    implicit: {
      authorizationPath: 'https://icicleai.tapis.io/v3/oauth2/authorize',
      clientId: 'tapisui-implicit-client',
      redirectURI: 'https://icicleai.tapis.io/tapis-ui/#/oauth2',
      responseType: 'token',
    },
  },
  removeServices: [EnumTapisCoreService.Apps],
  mainSidebarServices: [
    'systems',
    'apps',
    'jobs',
    'files',
    'workflows',
    'pods',
    'ml-hub',
    'my-new-page',
  ],
  authMethods: ['implicit', 'password'],
  logo: {
    filePath: './logo_icicle.png',
    text: 'MY EXTENSION',
  },
  icon: {
    filePath: './icon_icicle.png',
    text: 'MY EXTENSION',
  },
});

// Registering a new service will add
extension.registerService({
  id: 'my-new-page',
  sidebarDisplayName: 'My New Page',
  iconName: 'simulation',
  component: MyNewPage,
});

export { extension };
