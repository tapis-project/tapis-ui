import { TapisState } from '../store/rootReducer';
import { Apps } from '@tapis/tapis-typescript';
export declare const getApps: (state: TapisState) => Apps.TapisApp[];
declare type getAppsByIdSelectorType = (state: TapisState) => Array<Apps.TapisApp>;
export declare const getAppsById: (appId: string) => getAppsByIdSelectorType;
declare type getAppSelectorType = (state: TapisState) => Apps.TapisApp;
export declare const getApp: (appId: string, version: string) => getAppSelectorType;
export {};
