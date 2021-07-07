import { TapisState } from '../store/rootReducer';
declare const getSystems: (state: TapisState) => import("../types").TapisListResults<import("@tapis/tapis-typescript-systems").TapisSystem>;
export default getSystems;
