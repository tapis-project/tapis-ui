import * as ACTIONS from './actionTypes';
import { Config, ApiCallback } from '../types';
declare type BaseApiClass = {
    new (...args: any[]): any;
};
declare type ApiModule = {
    Configuration: {
        new (...args: any[]): any;
    };
};
export declare type Action = {
    type: string;
    payload?: any;
};
export declare type OnRequestCallback = () => Action;
export declare type OnSuccessCallback<T> = (result: T) => Action;
export declare type OnFailureCallback = (error: Error) => Action;
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
export declare type ApiSagaPayload<T> = {
    /**
     * Callback that yields an action when the API request begins
     */
    onRequest?: OnRequestCallback;
    /**
     * Callback that yields an action when the API request succeeds
     * @param result - the result of the provided function
     */
    onSuccess?: OnSuccessCallback<T>;
    /**
     * Callback that yields an action when the API request fails
     * @param error - the error object generated
     */
    onFailure?: OnFailureCallback;
    /**
     * An optional API configuration to use instead of
     * the default base URL and token received stored by the authenticator
     */
    config?: Config;
    /**
     * An optional callback function to call with the result
     * of the API function
     */
    onApi?: ApiCallback<T>;
    /**
     * The `@tapis/tapis-typescript` module to use
     */
    module: ApiModule;
    /**
     * The API within the module object
     */
    api: BaseApiClass;
    /**
     * The API function from the prototype of the api
     */
    func: (...args: any[]) => any;
    /**
     * Any
     */
    args: any[];
};
export interface ApiSagaRequest<T> {
    type: typeof ACTIONS.TAPIS_REDUX_API_REQUEST;
    payload: ApiSagaPayload<T>;
}
export interface ApiSagaSuccess<T> {
    type: typeof ACTIONS.TAPIS_REDUX_API_SUCCESS;
    payload: T;
}
export interface ApiSagaFailure {
    type: typeof ACTIONS.TAPIS_REDUX_API_FAILURE;
    payload: Error;
}
export declare type ApiSagaAction<T> = ApiSagaRequest<T> | ApiSagaSuccess<T> | ApiSagaFailure;
export {};
