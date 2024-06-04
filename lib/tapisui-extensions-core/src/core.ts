import { WorkflowsCustomizations } from "./workflows"
import { OAuth, AuthMethod } from "./oauth2"

export enum EnumTapisCoreService {
  Systems = 'systems',
  Files = 'files',
  Apps = 'apps',
  Pobs = 'jobs',
  Workflows = 'workflows',
  Mlhub = 'mlhub',
  Pods = 'pods',
}

type Logo = {
  url?: string;
  filePath?: string;
  logoText?: string;
};

export type Service = {
  id: string;
  sidebarDisplayName: string;
  icon?: string;
  iconName?: string;
  component?: unknown;
};

type CustomizableComponents = {
  workflows?: WorkflowsCustomizations;
};

export type Configuration = {
  multiTenantFeatures?: boolean;
  authentication?: OAuth;
  mainSidebarServices?: Array<string>;
  removeServices?: Array<EnumTapisCoreService>;
  authMethods?: Array<AuthMethod>;
  logo?: Logo;
  customizableComponents?: CustomizableComponents
};
