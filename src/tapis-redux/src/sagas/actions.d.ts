import { ApiSagaPayload, ApiSagaRequest } from './types';
export declare function apiCall<T>(dispatch: ApiSagaPayload<T>): ApiSagaRequest<T>;
