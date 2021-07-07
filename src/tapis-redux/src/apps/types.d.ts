import { TapisListResults } from 'tapis-redux/types';
import { Apps } from '@tapis/tapis-typescript';
import { AppsListingAction } from './list/types';
export declare type AppsReducerState = {
    apps: TapisListResults<Apps.TapisApp>;
};
export declare type AppsAction = AppsListingAction;
export declare type AppsReducer = (state: AppsReducerState, action: AppsAction) => AppsReducerState;
