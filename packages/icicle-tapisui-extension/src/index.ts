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
  ICICLEChatbook,
  DomainAgnosticCI,
  DomainSpecificServices,
  DigitalAgAaaS,
  AnimalEcologyAaaS,
  FoodLogisticsAaaS,
  IcicleServicesV2,
  Patra,
  IntelligentEdgeManagementService,
  ISAWPortal,
} from './pages';
import { SmartDetection } from './pages/SmartDetection';
import { SmartSegmentation } from './pages/SmartSegmentation';
import { NoCodeImageLab } from './pages/NoCodeImageLab';
import { WorkflowStudio } from './pages/WorkflowStudio';
import { EarthDataHub } from './pages/EarthDataHub';

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
    'ai-hub',
    'mlhub',
    'ml-edge',
    'open-web-ui',
    'jupyter-lab',
    'analytics',
    'training-catalog',
    'home',
    'icicle-chatbook',
    'food-flow-portal',
    'feast',
    'food-security-sandbox',
    'component-catalog',
    'openpass',
    'systems',
    'jobs',
    'files',
    'apps',
    'harvest',
    'patra',
    'smart-labeler',
    'smart-segmentation',
    'no-code-image-lab',
    'no-code-workflow-studio',
    'earth-data-hub',
    'isaw-portal',
    //'ckn-dashboard',
    //'data-labeler',
    //'smart-scheduler',
  ],
  betaSidebar: {
    enabled: true,
    // Grouped like the public extension's sidebar (named sections with real
    // subheaders) instead of one flat noSection + "More" dump — ICICLE's own
    // services get top billing (open by default), Tapis platform services get
    // their own quieter group below, and the former as-a-Service pages stay
    // tucked away in Archive at the very bottom.
    sections: [
      {
        // Every ICICLE-specific service/portal not on the Services Board.
        // Open by default — this is the group most icicleai.tapis.io users
        // actually want on landing.
        name: 'ICICLE Services',
        defaultOpen: true,
        mainServices: [
          'ai-hub',
          'open-web-ui',
          'jupyter-lab',
          'analytics',
          'training-catalog',
          'icicle-chatbook',
          'food-flow-portal',
          'feast',
          'food-security-sandbox',
          'component-catalog',
          'openpass',
          'harvest',
          // 'patra',
          'smart-labeler',
          'smart-segmentation',
          'no-code-image-lab',
          'no-code-workflow-studio',
          'earth-data-hub',
          'intelligent-edge-management-service',
          'isaw-portal',
        ],
        secondaryServices: [],
      },
      {
        // The core Tapis platform services — same set + order as the public
        // extension's "Tapis Services" section, plus ML Hub, ML Edge, and the
        // generic Tapis Dashboard (normally pinned above the whole sidebar —
        // 'dashboard' opts icicle out of that and files it in here instead).
        name: 'Tapis Services',
        defaultOpen: false,
        mainServices: [
          'systems',
          'apps',
          'jobs',
          'files',
          'workflows',
          'pods',
          'mlhub',
          'ml-edge',
          'dashboard',
        ],
        secondaryServices: [],
      },
      {
        // The six ICICLE as-a-Service pages (plus the former Portal Home) are
        // now indexed on the home Services Board (each catalog entry links back
        // via its sourceRoute). Collapsed and out of the main sidebar, but the
        // pages still render at their routes. `minimal` renders a quiet,
        // recessed group header so Archive doesn't beckon users to open it.
        name: 'Archive',
        defaultOpen: false,
        minimal: true,
        // Listed directly (no "More" sub-group) so the whole archive is visible
        // at a glance once expanded.
        mainServices: [
          'portal-home', // former ICICLE landing page
          'domain-agnostic-ai', // AIaaS
          'domain-agnostic-ci', // CIaaS
          'domain-specific-services', // DOaaS
          'digital-ag-aaas', // DAaaS
          'animal-ecology-aaas', // AEaaS
          'food-logistics-aaas', // FLSaaS
        ],
        secondaryServices: [],
      },
    ],
    noSection: {
      mainServices: ['home'],
      secondaryServices: [],
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
// Home = the Services Board. The app router redirects '/' to the 'home' service's
// route, so the board is now the default landing page and the top sidebar item.
extension.registerService({
  id: 'home',
  sidebarDisplayName: 'Home',
  iconName: 'simulation',
  component: IcicleServicesV2,
});

// The former Portal Home, kept accessible (no longer the landing page).
extension.registerService({
  id: 'portal-home',
  sidebarDisplayName: 'Portal Home',
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
  id: 'icicle-chatbook',
  sidebarDisplayName: 'ICICLE Chatbook',
  iconName: 'globe',
  component: ICICLEChatbook,
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

// extension.registerService({
//   id: 'jupyter-lab',
//   sidebarDisplayName: 'JupyterLab',
//   iconName: 'jupyter',
//   component: JupyterLab,
// });

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
  sidebarDisplayName: 'Smart Labeling Service for Object Detection',
  iconName: 'globe',
  component: SmartDetection,
});

extension.registerService({
  id: 'smart-segmentation',
  sidebarDisplayName: 'Intelligent Semantic Segmentation & Annotation',
  iconName: 'globe',
  component: SmartSegmentation,
});

extension.registerService({
  id: 'no-code-image-lab',
  sidebarDisplayName: 'No-Code Image Lab',
  iconName: 'globe',
  component: NoCodeImageLab,
});

extension.registerService({
  id: 'no-code-workflow-studio',
  sidebarDisplayName: 'No-Code Workflow Studio',
  iconName: 'globe',
  component: WorkflowStudio,
});

extension.registerService({
  id: 'earth-data-hub',
  sidebarDisplayName: 'Earth Data Hub',
  iconName: 'globe',
  component: EarthDataHub,
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
  id: 'intelligent-edge-management-service',
  sidebarDisplayName: 'Intelligent Edge Management Service',
  iconName: 'globe',
  component: IntelligentEdgeManagementService,
});

extension.registerService({
  id: 'isaw-portal',
  sidebarDisplayName: 'I-SAW Portal',
  iconName: 'globe',
  component: ISAWPortal,
});

// extension.registerService({
//   id: 'analytics',
//   sidebarDisplayName: 'Analytics',
//   iconName: 'globe',
//   component: CatalogAnalytics,

// });

extension.serviceCustomizations.workflows.dagTasks = generatedTasks;

export { extension };
