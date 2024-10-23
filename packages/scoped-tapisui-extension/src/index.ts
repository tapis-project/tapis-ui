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
      authorizationPath: 'https://scoped.tapis.io/v3/oauth2/authorize',
      clientId: 'seisscoped',
      redirectURI: 'https://scoped.tapis.io/v3/oauth2/idp',
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
    filePath: 'https://pbs.twimg.com/profile_banners/1431832137997582336/1631311944/1500x500',
    text: 'SCOPED',
  },
  icon: {
    filePath: 'https://yt3.googleusercontent.com/ZW2nLowlwtI10OWxxGp0cwV-20_djQdrNBzF7rU_7_a4EfBzDKMHx_GPlhEqw_mPMrCQWPVCSg=s160-c-k-c0x00ffffff-no-rj',
    text: 'SCOPED',
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
