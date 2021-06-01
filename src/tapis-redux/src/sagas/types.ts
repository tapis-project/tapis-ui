import * as ACTIONS from './actionTypes';

import { Config, ApiCallback } from '../types';

type BaseApiClass = {
  new(...args: any[]): any
};

type ApiModule = {
  Configuration: {
    new(...args: any[]): any
  }
}

export type ApiDispatches = {
  request: string,
  failure: string,
  success: string
}

export type ApiSagaDispatch<T> = {
  dispatches: ApiDispatches,
  config?: Config,
  onApi: ApiCallback<T>,
  module: ApiModule,
  api: BaseApiClass,
  fnName: string,
  args: any[]
}

export interface ApiSagaRequest<T> {
  type: typeof ACTIONS.TAPIS_REDUX_API_REQUEST
  payload: ApiSagaDispatch<T>
}

export interface ApiSagaSuccess<T> {
  type: typeof ACTIONS.TAPIS_REDUX_API_SUCCESS,
  payload: T
}

export interface ApiSagaFailure {
  type: typeof ACTIONS.TAPIS_REDUX_API_FAILURE,
  payload: Error
}

export type ApiSagaAction<T> =
  | ApiSagaRequest<T>
  | ApiSagaSuccess<T>
  | ApiSagaFailure;