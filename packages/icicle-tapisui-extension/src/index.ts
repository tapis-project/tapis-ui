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
  CatalogAnalytics,
  SmartScheduler,
  TrainingCatalog,
  CKNDashboard,
  DigitalAgOpenPASS,
  ComponentCatalog,
  Harvest,
  FoodFlowPortal,
  FEAST,
  FoodSecuritySandbox,
  PortalHome,
  DomainAgnosticAI,
  DomainAgnosticCI,
  DomainSpecificServices,
  DigitalAgAaaS,
  AnimalEcologyAaaS,
  FoodLogisticsAaaS,
  Patra,
} from './pages';
import { SmartLabeler } from './pages/SmartLabeler';

const extension = createExtension({
  allowMultiTenant: false,
  authentication: {
    password: true,
    implicit: {
      authorizationPath: 'https://icicleai.tapis.io/v3/oauth2/authorize',
      clientId: 'tapisui-implicit-client',
      redirectURI: 'https://icicleai.tapis.io/#/oauth2',
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
    'analytics',
    'training-catalog',
    'home',
    'domain-agnostic-ai',
    'domain-agnostic-ci',
    'domain-specific-services',
    'digital-ag-aaas',
    'animal-ecology-aaas',
    'food-logistics-aaas',
    'food-flow-portal',
    'feast',
    'food-security-sandbox',
    'component-catalog',
    'ckn-dashboard',
    'openpass',
    'systems',
    'jobs',
    'files',
    'apps',
    'harvest',
    'patra',
    'smart-labeler',
    //'data-labeler',
    //'smart-scheduler',
  ],
  betaSidebar: {
    enabled: true,
    sections: [],
    noSection: {
      mainServices: ['home'],
      secondaryServices: [
        'workflows',
        'pods',
        'ml-hub',
        'ml-edge',
        'open-web-ui',
        'jupyter-lab',
        'analytics',
        'training-catalog',
        'domain-agnostic-ai',
        'domain-agnostic-ci',
        'domain-specific-services',
        'digital-ag-aaas',
        'animal-ecology-aaas',
        'food-logistics-aaas',
        'food-flow-portal',
        'feast',
        'food-security-sandbox',
        'component-catalog',
        'ckn-dashboard',
        'openpass',
        'systems',
        'jobs',
        'files',
        'apps',
        'harvest',
        'patra',
        'smart-labeler',
      ],
    },
  },
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
  id: 'home',
  sidebarDisplayName: 'Portal Home (beta)',
  iconName: 'globe',
  component: PortalHome,
});

extension.registerService({
  id: 'domain-agnostic-ai',
  sidebarDisplayName: 'ICICLE-AIaaS',
  iconName: 'globe',
  component: DomainAgnosticAI,
});

extension.registerService({
  id: 'domain-agnostic-ci',
  sidebarDisplayName: 'ICICLE-CIaaS',
  iconName: 'globe',
  component: DomainAgnosticCI,
});

extension.registerService({
  id: 'domain-specific-services',
  sidebarDisplayName: 'ICICLE-DOaaS',
  iconName: 'globe',
  component: DomainSpecificServices,
});

extension.registerService({
  id: 'digital-ag-aaas',
  sidebarDisplayName: 'ICICLE-DAaaS',
  iconName: 'globe',
  component: DigitalAgAaaS,
});

extension.registerService({
  id: 'animal-ecology-aaas',
  sidebarDisplayName: 'ICICLE-AEaaS',
  iconName: 'globe',
  component: AnimalEcologyAaaS,
});

extension.registerService({
  id: 'food-logistics-aaas',
  sidebarDisplayName: 'ICICLE-FLSaaS',
  iconName: 'globe',
  component: FoodLogisticsAaaS,
});

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
  id: 'food-flow-portal',
  sidebarDisplayName: 'Food Flow Portal',
  iconName: 'globe',
  component: FoodFlowPortal,
});

extension.registerService({
  id: 'feast',
  sidebarDisplayName: 'FEAST',
  iconName: 'globe',
  component: FEAST,
});

extension.registerService({
  id: 'food-security-sandbox',
  sidebarDisplayName: 'Food Security Sandbox',
  iconName: 'globe',
  component: FoodSecuritySandbox,
});

extension.registerService({
  id: 'component-catalog',
  sidebarDisplayName: 'Catalog',
  iconName: 'globe',
  component: ComponentCatalog,
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

extension.registerService({
  id: 'smart-labeler',
  sidebarDisplayName: 'Smart Labeling and Annotation',
  iconName: 'globe',
  component: SmartLabeler,
});

extension.registerService({
  id: 'harvest',
  sidebarDisplayName: 'Harvest',
  iconName: 'globe',
  component: Harvest,
});

extension.registerService({
  id: 'patra',
  sidebarDisplayName: 'Patra',
  iconName: 'globe',
  component: Patra,
});

extension.registerService({
  id: 'analytics',
  sidebarDisplayName: 'Analytics',
  iconName: 'globe',
  component: CatalogAnalytics,
});

extension.serviceCustomizations.workflows.dagTasks = generatedTasks;

export { extension };
