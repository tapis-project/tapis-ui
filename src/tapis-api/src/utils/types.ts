type BaseApiClass = {
  new(...args: any[]): any
};

type ApiModule = {
  Configuration: {
    new(...args: any[]): any
  }
}

/**
 * A type that describes parameters for queryHelper
 * 
 * @example
 * ```
 * import { Systems } from '@tapis/tapis-typescript'
 * 
 * const payload: TapisQueryParams<Systems.RespSystems> = {
 *   module: Systems,
 *   api: Systems.SystemsApi,
 *   func: Systems.SystemsApi.prototype.GetSystems,
 *   args: [ {} ],
 *   basePath: "https://tacc.tapis.io",
 *   jwt: "abcedef"
 * }
 * ```
 */
export type TapisQueryParams<T> = {
  /**
   * The `@tapis/tapis-typescript` module to use
   */
  module: ApiModule,

  /**
   * The API within the module object
   */
  api: BaseApiClass,

  /**
   * The API function from the prototype of the api
   */
  func: (...args: any[]) => any,

  /**
   * Any 
   */
  args: any[],

  /**
   * TAPIS API Base Path (e.g. https://tacc.tapis.io)
   */
  basePath: string,

  /**
   * TAPIS token
   */
  jwt: string
}