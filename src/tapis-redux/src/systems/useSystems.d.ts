import { SystemsListCallback } from './types';
import { Systems } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/types';
export interface SystemsListParams {
    onList?: SystemsListCallback;
    request?: Systems.GetSystemsRequest;
}
declare const useSystems: (config?: Config) => {
    systems: import("tapis-redux/types").TapisListResults<Systems.TapisSystem>;
    list: (params: SystemsListParams) => import("../sagas/types").ApiSagaRequest<Systems.RespSystems>;
};
export default useSystems;
