import {
  createExtension,
  EnumTapisCoreService,
} from '@tapis/tapisui-extensions-core';
import { MongoExpress } from './pages';

const extension = createExtension({
  allowMultiTenant: false,
  authentication: {
    password: true,
    implicit: {
      authorizationPath: 'https://scoped.tapis.io/v3/oauth2/authorize',
      clientId: 'seisscoped2024v2',
      redirectURI: 'https://scoped.tapis.io/#/oauth2',
      responseType: 'token',
    },
  },
  removeServices: [EnumTapisCoreService.Apps],
  mainSidebarServices: ['systems', 'apps', 'jobs', 'files', 'mongo-express'],
  showMLHub: false,
  showMLEdge: false,
  showSecondarySideBar: false,
  authMethods: ['implicit', 'password'],
  logo: {
    // filePath from https://x.com/SEIS_SCOPED
    filePath:
      'https://pbs.twimg.com/profile_banners/1431832137997582336/1631311944/1500x500',
    text: 'SCOPED',
  },
  icon: {
    // filePath from https://github.com/SeisSCOPED
    filePath: 'https://avatars.githubusercontent.com/u/72624873?s=200&v=4',
    text: 'SCOPED',
  },
});

extension.registerService({
  id: 'mongo-express',
  sidebarDisplayName: 'MongoExp',
  iconName: 'visualization',
  component: MongoExpress,
});

export { extension };
