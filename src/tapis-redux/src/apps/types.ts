import { TapisListResults } from 'tapis-redux/src/types';
import { Apps } from '@tapis/tapis-typescript';
import { AppsListingAction } from './list/types';

export type AppsReducerState = {
  apps: TapisListResults<Apps.TapisApp>
}

export type AppsAction = 
  | AppsListingAction;

export type AppsReducer = (state: AppsReducerState, action: AppsAction) => AppsReducerState;