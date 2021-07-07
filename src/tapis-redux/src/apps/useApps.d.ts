import { AppsListCallback } from './list/types';
import { Apps } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/types';
export interface ListAppsParams {
    onList?: AppsListCallback;
    request?: Apps.GetAppsRequest;
}
declare const useSystems: (config?: Config) => {
    apps: import("tapis-redux/types").TapisListResults<Apps.TapisApp>;
    list: (params: ListAppsParams) => import("../sagas/types").ApiSagaRequest<Apps.RespApps>;
};
export default useSystems;
