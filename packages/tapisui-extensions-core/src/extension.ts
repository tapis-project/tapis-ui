import {
  Service,
  Configuration,
  EnumTapisCoreService,
  Logo,
  Icon,
  LoginPageConfig,
  PreloginConfig,
  TopBarStrip,
} from './core';
import { AuthMethod, Implicit } from './oauth2';
import { WorkflowsCustomizations } from './workflows';
import { McpServerEntry } from './mcp';
import { HostedEndpointEntry } from './hosted';

type RegisteredService = Service & {
  route: string;
};

type ServiceMap = {
  [key: string]: RegisteredService;
};

type ServiceCustomizations = {
  [EnumTapisCoreService.Workflows]?: WorkflowsCustomizations | undefined;
};

type BetaSidebarSection = {
  name: string;
  defaultOpen: boolean;
  // When true, the section header renders quiet and recessed (non-bold, muted,
  // smaller) instead of the default bold group heading — for low-emphasis
  // groups (e.g. an archive) that shouldn't invite attention.
  minimal?: boolean;
  mainServices: string[];
  secondaryServices?: string[];
};

type BetaSidebarConfig = {
  enabled: boolean;
  sections: BetaSidebarSection[];
  noSection?: {
    mainServices: string[];
    secondaryServices?: string[];
  };
};

const defaultServiceCustomizations = {
  [EnumTapisCoreService.Workflows]: {
    dagComponent: undefined,
    home: undefined,
    dagTasks: [],
    dagDefaultView: false,
  },
};

export class Extension {
  public mainSidebarServices: Array<string> = [];
  public hideBreadcrumbRoutes: Array<string> = [];
  public topBar: Array<TopBarStrip> = [];
  public authMethods: Array<AuthMethod> = [];
  public allowMultiTenant: boolean = true;
  public showMLHub: boolean = true;
  public showMLEdge: boolean = true;
  public showSecondarySideBar: boolean = true;
  public serviceMap: ServiceMap = {};
  private config: Configuration;
  public serviceCustomizations: ServiceCustomizations;
  public logo: Logo;
  public icon: Icon;
  public betaSidebar?: BetaSidebarConfig;
  public mcpServers: McpServerEntry[] = [];
  public hostedEndpoints: HostedEndpointEntry[] = [];
  public loginPage?: LoginPageConfig;
  public prelogin?: PreloginConfig;

  constructor(config: Configuration) {
    this.setConfiguration(config);
  }

  setConfiguration(config: Configuration): void {
    this.config = config;
    this.allowMultiTenant = config.allowMultiTenant;
    this.showMLHub = config.showMLHub;
    this.showMLEdge = config.showMLEdge;
    this.showSecondarySideBar = config.showSecondarySideBar;
    this.mainSidebarServices = config.mainSidebarServices || [];
    this.hideBreadcrumbRoutes = config.hideBreadcrumbRoutes || [];
    this.topBar = config.topBar || [];
    this.setAuthentication();
    this.setServiceCustomizations();
    this.logo = config.logo;
    this.icon = config.icon;
    this.betaSidebar = config.betaSidebar;
    this.mcpServers = config.mcpServers || [];
    this.hostedEndpoints = config.hostedEndpoints || [];
    this.loginPage = config.loginPage;
    this.prelogin = config.prelogin;
  }

  /** True when this service renders without authentication — i.e. the
   *  extension lists it in prelogin.sidebarServices ('login' is the Login
   *  nav item, not a service). */
  public isPublicService(serviceId: string): boolean {
    return (
      serviceId !== 'login' &&
      (this.prelogin?.sidebarServices ?? []).includes(serviceId)
    );
  }

  private setAuthentication(): void {
    this.authMethods = this.config.authMethods || [];
  }

  /** The access-token sign-in: undefined = on for every tenant, false =
   *  off, a list = only those tenant ids. */
  public getJwtBypass(): boolean | string[] | undefined {
    return this.config.authentication?.jwtBypass;
  }

  /** Hostnames where the login page's JWT-bypass affordance is active.
   *  undefined = extension doesn't care (app default list applies);
   *  [] = explicitly disabled for this deployment. */
  public getJwtBypassHosts(): string[] | undefined {
    return this.config.authentication?.jwtBypassHosts;
  }

  public getAuthByType(
    type: 'password' | 'implicit'
  ): Implicit | boolean | undefined {
    if (type === 'password' && this.authMethods.includes('password')) {
      return this.config.authentication?.password;
    }

    if (type === 'implicit' && this.authMethods.includes('implicit')) {
      return this.config.authentication?.implicit;
    }

    return undefined;
  }

  private setServiceCustomizations(): void {
    // Set the services customizations based on the config
    this.serviceCustomizations = defaultServiceCustomizations;
    if (this.config.serviceCustomizations !== undefined) {
      Object.keys(this.config.serviceCustomizations).map((key) => {
        this.setServiceCustomization(
          key as EnumTapisCoreService,
          this.config.serviceCustomizations[key]
        );
      });
    }
  }

  private setServiceCustomization(
    serviceName: EnumTapisCoreService,
    value: unknown
  ): void {
    this.serviceCustomizations = {
      ...this.serviceCustomizations,
      [serviceName]: value,
    };
  }

  registerService(service: Service): void {
    // Checking uniqueness of service id
    if (
      service.id in this.serviceMap ||
      (Object.values(EnumTapisCoreService) as string[]).includes(service.id)
    ) {
      throw new Error(
        `service.id, '${service.id}', conflicts with an existing service.id.`
      );
    }

    // Ensure friendly url from service.id - alphanumeric and hyphen
    const regex = /^[0-9a-z\-]+$/;
    if (!regex.test(service.id)) {
      throw new Error(
        `service.id, '${service.id}', must contain lowercase alphanumerics and hyphens.`
      );
    }

    const registeredService: RegisteredService = {
      ...service,
      route: service.route || `/${service.id}`,
    };

    this.serviceMap[service.id] = registeredService;
  }

  public getServiceIds(): Array<Service> {
    const serviceIdsArray = [];
    for (let key in this.serviceMap) {
      serviceIdsArray.push(this.serviceMap[key]);
    }

    return serviceIdsArray;
  }
}

export const createExtension: (config: Configuration) => Extension = (
  config
) => {
  return new Extension(config);
};

export type { BetaSidebarSection, BetaSidebarConfig };
