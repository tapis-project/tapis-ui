import {
  createExtension,
  EnumTapisCoreService,
} from '@tapis/tapisui-extensions-core';

const extension = createExtension({
  allowMultiTenant: false,
  authentication: {
    password: true,
    implicit: {
      authorizationPath: 'https://scoped.tapis.io/v3/oauth2/authorize',
      clientId: 'seisscoped', // TODO
      redirectURI: 'https://scoped.tapis.io/v3/oauth2/idp',
      responseType: 'token',
    },
  },
  removeServices: [EnumTapisCoreService.Apps],
  mainSidebarServices: ['systems', 'apps', 'jobs', 'files'],
  authMethods: ['implicit', 'password'],
  logo: {
    // filePath from https://x.com/SEIS_SCOPED
    filePath:
      'https://pbs.twimg.com/profile_banners/1431832137997582336/1631311944/1500x500',
    text: 'SCOPED',
  },
  icon: {
    // filePath from https://www.youtube.com/@scoped6259
    filePath:
      'https://yt3.googleusercontent.com/ZW2nLowlwtI10OWxxGp0cwV-20_djQdrNBzF7rU_7_a4EfBzDKMHx_GPlhEqw_mPMrCQWPVCSg=s160-c-k-c0x00ffffff-no-rj',
    text: 'SCOPED',
  },
});

export { extension };
