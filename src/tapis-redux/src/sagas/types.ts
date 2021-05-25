import { 
  TAPIS_REDUX_API_FAILURE,
  TAPIS_REDUX_API_REQUEST,
  TAPIS_REDUX_API_SUCCESS
} from './actionTypes';

import { Config } from '../types';

export type ApiCallback<T> = (result: T | Error, ...args: any[]) => any;

// TODO: make a stronger specifier for this to match all generated APIs
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
  config: Config,
  onApi: ApiCallback<T>,
  module: ApiModule,
  api: BaseApiClass,
  fnName: string,
  args: any[]
}

export interface ApiSagaRequest<T> {
  type: typeof TAPIS_REDUX_API_REQUEST
  payload: ApiSagaDispatch<T>
}

export interface ApiSagaSuccess<T> {
  type: typeof TAPIS_REDUX_API_REQUEST,
  payload: T
}

export interface ApiSagaFailure {
  type: typeof TAPIS_REDUX_API_FAILURE,
  payload: Error
}

export type ApiSagaAction<T> =
  | ApiSagaRequest<T>
  | ApiSagaSuccess<T>
  | ApiSagaFailure;