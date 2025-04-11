import {
  createExtension,
  EnumTapisCoreService,
} from '@tapis/tapisui-extensions-core';
import { GEO, SeismoDB } from './pages';

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
  mainSidebarServices: [
    'systems',
    'apps',
    'jobs',
    'files',
    'pods',
    'workflows',
    'seismo-db',
    'geo',
  ],
  showMLHub: false,
  showMLEdge: false,
  showSecondarySideBar: false,
  authMethods: ['implicit', 'password'],
  logo: {
    filePath: './logo_scoped.png',
    text: 'SCOPED',
  },
  icon: {
    filePath: './icon_scoped.png',
    text: 'SCOPED',
  },
});

extension.registerService({
  id: 'geo',
  sidebarDisplayName: 'GEO',
  iconName: 'compass',
  component: GEO,
});

extension.registerService({
  id: 'seismo-db',
  sidebarDisplayName: 'SeismoDB',
  iconName: 'visualization',
  component: SeismoDB,
});

export { extension };
