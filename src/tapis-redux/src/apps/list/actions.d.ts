import { Apps } from '@tapis/tapis-typescript';
import { AppsListCallback } from './types';
import { Config } from 'tapis-redux/types';
export declare const list: (config?: Config, onList?: AppsListCallback, params?: Apps.GetAppsRequest) => import("tapis-redux/sagas/types").ApiSagaRequest<Apps.RespApps>;
