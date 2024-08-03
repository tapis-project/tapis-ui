import * as React from 'react';
import { WorkflowsCustomizations } from './workflows';
import { OAuth, AuthMethod } from './oauth2';

export enum EnumTapisCoreService {
  Systems = 'systems',
  Files = 'files',
  Apps = 'apps',
  Pobs = 'jobs',
  Workflows = 'workflows',
  Mlhub = 'mlhub',
  Pods = 'pods',
}

export type Logo = {
  url?: string;
  filePath?: string;
  text?: string;
};
export type Icon = {
  url?: string;
  filePath?: string;
  text?: string;
};

export type Component = React.FC<
  React.PropsWithChildren<{ accessToken: string | undefined }>
>;

export type Service = {
  id: string;
  sidebarDisplayName: string;
  icon?: string;
  iconName?: string;
  component?: Component;
};

type ServiceCustomizations = {
  workflows?: WorkflowsCustomizations;
};

export type Configuration = {
  component?: Component;
  allowMultiTenant?: boolean;
  authentication?: OAuth;
  mainSidebarServices?: Array<string>;
  removeServices?: Array<EnumTapisCoreService>;
  authMethods?: Array<AuthMethod>;
  logo?: Logo;
  icon?: Icon;
  serviceCustomizations?: ServiceCustomizations;
};
