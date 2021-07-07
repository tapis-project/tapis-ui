import { Jobs } from '@tapis/tapis-typescript';
import { JobsListCallback } from './types';
import { Config } from 'tapis-redux/types';
export declare const list: (config?: Config, onList?: JobsListCallback, params?: Jobs.GetJobListRequest) => import("tapis-redux/sagas/types").ApiSagaRequest<Jobs.RespGetJobList>;
