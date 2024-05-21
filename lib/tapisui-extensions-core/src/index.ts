export enum EnumTapisCoreService {
  Systems = "systems",
  Files = "files",
  Apps = "apps",
  Pobs = "jobs",
  Workflows = "workflows",
  Mlhub = "mlhub",
  Pods = "pods"
}

export const registeredExtensions = {
  "@icicle/tapisui-extensions-icicle": {
    "baseUrls": ["https://icicle.tapis.io", "https://icicle.develop.tapis.io", "https://icicle.staging.tapis.io"]
  }
}

type Implicit = {
  authorizationPath: string
  clientId: string
  redirectURI: string
  responseType: "token"
}

type OAuth2 = {
  implicit?: Implicit
  password?: boolean
}

type AuthMethod = "implicit" | "password"

type Logo = {
  url?: string
  filePath?: string
  logoText?: string
}

export type Configuration = {
  multiTenantFeatures?: boolean
  authentication?: OAuth2
  mainSidebarServices?: Array<string>
  removeServices?: Array<EnumTapisCoreService>
  authMethods?: Array<AuthMethod>
  logo?: Logo
}

export type Service = {
  id: string
  sidebarName: string
  icon: string
  component: unknown
}

type RegisteredService = Service & {
  route: string
}

type ServiceMapping = {
  [key: string]: RegisteredService
}

class Extension {
  public serviceMapping: ServiceMapping
  public configuration: Configuration

  constructor(configuration: Configuration) {
    this.serviceMapping = {}
    this.setConfiguration(configuration)
  }

  setConfiguration(configuration: Configuration): void {
    let modifiedAuthPath = configuration?.authentication?.implicit?.authorizationPath
    if (modifiedAuthPath !== undefined) {
      modifiedAuthPath.replace(/\/{2,}/g, "/").replace("/", "")
      configuration!.authentication!.implicit!.authorizationPath = modifiedAuthPath
    }
    this.configuration = configuration
  }

  registerService(service: Service): void {
    // Checking uniqueness of service id
    if (
      service.id in this.serviceMapping
      || service.id in Object.values(EnumTapisCoreService)
    ) {
      throw new Error(`service.id, '${service.id}', conflicts with an existing service.id.`)
    }
    // Ensure friendly url from service.id - alphanumeric and hyphen
    const regex = /^[0-9a-z\-]+$/
    if (!regex.test(service.id)) {
      throw new Error(`service.id, '${service.id}', must contain lowercase alphanumerics and hyphens.`)
    }

    const registeredService: RegisteredService = {
      ...service,
      route: service.id
    }

    this.serviceMapping[service.id] = registeredService
  }

  getServiceIds(): Array<Service> {
    const serviceIdsArray = []
    for (let key in this.serviceMapping) {
      serviceIdsArray.push(this.serviceMapping[key])
    }

    return serviceIdsArray
  }
}

export const initializeExtension: (configuration: Configuration) => Extension = (configuration) => {
  return new Extension(configuration)
}

