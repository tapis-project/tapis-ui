import {
  createExtension,
  EnumTapisCoreService,
} from '@tapis/tapisui-extensions-core';
import { tasks as generatedTasks } from './gen';
import { MLEdge, SmartScheduler, JupyterLab, OpenWebUI } from './pages';

const extension = createExtension({
  allowMultiTenant: false,
  authentication: {
    implicit: {
      authorizationPath: 'https://icicle.develop.tapis.io/v3/oauth2/authorize',
      clientId: 'tapisui-implicit-client',
      redirectURI: 'https://dev.develop.tapis.io/tapis-ui/#/oauth2',
      responseType: 'token',
    },
  },
  removeServices: [EnumTapisCoreService.Apps],
  mainSidebarServices: [
    'workflows',
    'pods',
    'ml-hub',
    'ml-edge',
    'open-web-ui',
    'jupyter-lab',
    'smart-scheduler',
  ],
  authMethods: ['implicit', 'password'],
  logo: {
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfQCeZ-pHyZXArXjYUMjl9TuEwePvsERPcDQ&s',
    logoText: 'ICICLE AI',
  },
  serviceCustomizations: {
    workflows: {
      dagComponent: undefined,
      home: undefined,
      dagTasks: undefined,
      dagDefaultView: true,
    },
  },
});

extension.registerService({
  id: 'ml-edge',
  sidebarDisplayName: 'ML Edge',
  iconName: 'simulation',
  component: MLEdge,
});

extension.registerService({
  id: 'smart-scheduler',
  sidebarDisplayName: 'Smart Scheduler',
  iconName: 'bar-graph',
  component: SmartScheduler,
});

extension.registerService({
  id: 'jupyter-lab',
  sidebarDisplayName: 'JupyterLab',
  iconName: 'jupyter',
  component: JupyterLab,
});

extension.registerService({
  id: 'open-web-ui',
  sidebarDisplayName: 'Open WebUI',
  iconName: 'multiple-coversation',
  component: OpenWebUI,
});

extension.serviceCustomizations.workflows.dagTasks = generatedTasks;

export { extension };
