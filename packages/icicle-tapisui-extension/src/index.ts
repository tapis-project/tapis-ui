import {
  createExtension,
  EnumTapisCoreService,
} from '@tapis/tapisui-extensions-core';
import { tasks as generatedTasks } from './gen';
import {
  MLEdge,
  DataLabeler,
  JupyterLab,
  OpenWebUI,
  VisualAnalytics,
  SmartScheduler,
  TrainingCatalog,
  CKNDashboard,
  DigitalAgOpenPASS,
} from './pages';

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
    'workflows',
    'pods',
    'ml-hub',
    'ml-edge',
    'open-web-ui',
    'jupyter-lab',
    'visual-analytics',
    'training-catalog',
    'ckn-dashboard',
    'openpass',
    //'data-labeler',
    //'smart-scheduler',
  ],
  authMethods: ['implicit', 'password'],
  logo: {
    filePath: './logo_icicle.png',
    text: 'ICICLE AI',
  },
  icon: {
    filePath: './icon_icicle.png',
    text: 'ICICLE AI',
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

// Order of registration determines sidebar order!!
extension.registerService({
  id: 'ml-edge',
  sidebarDisplayName: 'ML Edge',
  iconName: 'simulation',
  component: MLEdge,
});

extension.registerService({
  id: 'data-labeler',
  sidebarDisplayName: 'Data Labeler',
  iconName: 'bar-graph',
  component: DataLabeler,
});

extension.registerService({
  id: 'jupyter-lab',
  sidebarDisplayName: 'JupyterLab',
  iconName: 'jupyter',
  component: JupyterLab,
});

extension.registerService({
  id: 'open-webui',
  sidebarDisplayName: 'Open WebUI',
  iconName: 'multiple-coversation',
  component: OpenWebUI,
});

extension.registerService({
  id: 'visual-analytics',
  sidebarDisplayName: 'Visual Analytics',
  iconName: 'globe',
  component: VisualAnalytics,
});

extension.registerService({
  id: 'smart-scheduler',
  sidebarDisplayName: 'Smart Scheduler',
  iconName: 'globe',
  component: SmartScheduler,
});

extension.registerService({
  id: 'training-catalog',
  sidebarDisplayName: 'Training Catalog',
  iconName: 'globe',
  component: TrainingCatalog,
});

extension.registerService({
  id: 'ckn-dashboard',
  sidebarDisplayName: 'CKN Dashboard',
  iconName: 'globe',
  component: CKNDashboard,
});

extension.registerService({
  id: 'openpass',
  sidebarDisplayName: 'OpenPASS',
  iconName: 'globe',
  component: DigitalAgOpenPASS,
});

extension.serviceCustomizations.workflows.dagTasks = generatedTasks;

export { extension };
