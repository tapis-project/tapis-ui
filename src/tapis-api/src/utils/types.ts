type BaseApiClass = {
  new(...args: any[]): any
};

type ApiModule = {
  Configuration: {
    new(...args: any[]): any
  }
}

/**
 * A type that describes a payload to send to the API saga
 * 
 * @example
 * ```
 * import { Systems } from '@tapis/tapis-typescript'
 * 
 * const payload: ApiSagaPayload<Systems.RespSystems> = {
 *   onRequest: () => { type: 'TAPIS_SYSTEMS_LIST_REQUEST' },
 *   onSuccess: (result) => { type: 'TAPIS_SYSTEMS_LIST_SUCCESS', payload: result },
 *   onFailure: (error) => { type: 'TAPIS_SYSTEMS_LIST_FAILURE', payload: error },
 *   module: Systems,
 *   api: Systems.SystemsApi,
 *   func: Systems.SystemsApi.prototype.GetSystems,
 *   args: [ {} ]
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