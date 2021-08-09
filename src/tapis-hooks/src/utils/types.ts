// Default configuration uses environment variables to configure URLs
export const defaultConfig: Config = {
  jwt: null,
  tenant: process.env.TAPIS_TENANT_URL
};

export interface Config {
  jwt: string,
  tenant: string,
}

type BaseApiClass = {
  new(...args: any[]): any
};

type ApiModule = {
  Configuration: {
    new(...args: any[]): any
  }
}

export type Action = {
  type: string,
  payload?: any
}

export type OnRequestCallback = () => Action;

export type OnSuccessCallback<T> = (result: T) => any;

export type OnFailureCallback = (error: Error) => Action;

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
   * Callback that yields an action when the API request begins
   */
  onRequest?: OnRequestCallback,

  /**
   * Callback that yields an action when the API request succeeds
   * @param result - the result of the provided function
   */
  onSuccess?: OnSuccessCallback<T>,

  /**
   * Callback that yields an action when the API request fails
   * @param error - the error object generated
   */
  onFailure?: OnFailureCallback,

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
  args: any[]
}