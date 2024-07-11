import {
  createExtension,
  EnumTapisCoreService,
} from "@tapis/tapisui-extensions-core";
import { tasks as generatedTasks } from "./gen";
import {
  MLEdge,
  DataLabeler,
  JupyterLab,
  OpenWebUI,
  DigitalAg,
  VisualAnalytics,
} from "./pages";

const extension = createExtension({
  allowMultiTenant: false,
  authentication: {
    password: true,
    implicit: {
      authorizationPath: "https://icicleai.tapis.io/v3/oauth2/authorize",
      clientId: "tapisui-implicit-client",
      redirectURI: "https://icicleai.tapis.io/tapis-ui/#/oauth2",
      responseType: "token",
    },
  },
  removeServices: [EnumTapisCoreService.Apps],
  mainSidebarServices: [
    "workflows",
    "pods",
    "ml-hub",
    "ml-edge",
    "open-web-ui",
    "jupyter-lab",
    "data-labeler",
    "digital-ag",
    "visual-analytics",
  ],
  authMethods: ["implicit", "password"],
  logo: {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfQCeZ-pHyZXArXjYUMjl9TuEwePvsERPcDQ&s",
    logoText: "ICICLE AI",
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
  id: "ml-edge",
  sidebarDisplayName: "ML Edge",
  iconName: "simulation",
  component: MLEdge,
});

extension.registerService({
  id: "data-labeler",
  sidebarDisplayName: "Data Labeler",
  iconName: "bar-graph",
  component: DataLabeler,
});

extension.registerService({
  id: "jupyter-lab",
  sidebarDisplayName: "JupyterLab",
  iconName: "jupyter",
  component: JupyterLab,
});

extension.registerService({
  id: "open-web-ui",
  sidebarDisplayName: "Open WebUI",
  iconName: "multiple-coversation",
  component: OpenWebUI,
});

extension.registerService({
  id: "digital-ag",
  sidebarDisplayName: "Digital Ag",
  iconName: "globe",
  component: DigitalAg,
});

extension.registerService({
  id: "visual-analytics",
  sidebarDisplayName: "Visual Analytics",
  iconName: "globe",
  component: VisualAnalytics,
});

extension.serviceCustomizations.workflows.dagTasks = generatedTasks;

export { extension };
