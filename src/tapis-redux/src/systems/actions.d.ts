import { Systems } from '@tapis/tapis-typescript';
import { SystemsListCallback } from './types';
import { Config } from 'tapis-redux/types';
export declare const list: (config?: Config, onList?: SystemsListCallback, params?: Systems.GetSystemsRequest) => import("tapis-redux/sagas/types").ApiSagaRequest<Systems.RespSystems>;
