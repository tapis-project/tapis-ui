import { Service, Configuration, EnumTapisCoreService, Logo } from "./core";
import { WorkflowsCustomizations } from "./workflows";

type RegisteredService = Service & {
  route: string;
};
  
type ServiceMapping = {
  [key: string]: RegisteredService;
};

type ServiceCustomizations = {
  [EnumTapisCoreService.Workflows]?: WorkflowsCustomizations | undefined
}

const defaultServiceCustomizations = {
  [EnumTapisCoreService.Workflows]: {
    dagComponent: undefined,
    home: undefined,
    dagTasks: [],
    dagDefaultView: false
  }
}

export class Extension {
  public allowMutiTenant: boolean = true
  public serviceMapping: ServiceMapping;
  private config: Configuration;
  public serviceCustomizations: ServiceCustomizations
  public logo: Logo;

  constructor(config: Configuration) {
    this.serviceMapping = {};
    this.setConfiguration(config);
  }

  setConfiguration(config: Configuration): void {
    this.config = config;
    this.allowMutiTenant = config.allowMultiTenant
    this.setAuthentication()
    this.setServiceCustomizations()
    this.logo = config.logo
  }

  private setAuthentication(): void {
    let modifiedAuthPath = this.config?.authentication?.implicit?.authorizationPath;
    if (modifiedAuthPath !== undefined) {
      modifiedAuthPath.replace(/\/{2,}/g, '/').replace('/', '');
      this.config!.authentication!.implicit!.authorizationPath =  modifiedAuthPath;
    }
  }

  private setServiceCustomizations(): void {
    // Set the services customizations based on the config
    this.serviceCustomizations = defaultServiceCustomizations
    if (this.config.serviceCustomizations !== undefined) {
      Object.keys(this.config.serviceCustomizations).map((key) => {
        this.setServiceCustomization(
          (key as EnumTapisCoreService),
          this.config.serviceCustomizations[key]
        )
      })
    }
  }

  private setServiceCustomization(
    serviceName: EnumTapisCoreService,
    value: unknown
  ): void {
    this.serviceCustomizations = {
      ...this.serviceCustomizations,
      [serviceName]: value
    }
  }

  registerService(service: Service): void {
    // Checking uniqueness of service id
    if (
      service.id in this.serviceMapping ||
      service.id in Object.values(EnumTapisCoreService)
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
      route: service.id,
    };

    this.serviceMapping[service.id] = registeredService;
  }

  public getServiceIds(): Array<Service> {
    const serviceIdsArray = [];
    for (let key in this.serviceMapping) {
      serviceIdsArray.push(this.serviceMapping[key]);
    }

    return serviceIdsArray;
  }
}
  
export const createExtension: (config: Configuration) => Extension = (config) => {
  return new Extension(config);
};