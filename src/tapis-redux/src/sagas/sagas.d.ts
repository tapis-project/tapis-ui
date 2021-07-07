import { ApiSagaRequest } from './types';
export declare function apiSaga<T>(action: ApiSagaRequest<T>): Generator<any, void, any>;
export declare function watchApiSaga(): Generator<import("redux-saga/effects").ForkEffect<never>, void, unknown>;
