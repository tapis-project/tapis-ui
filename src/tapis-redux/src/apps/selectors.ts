import { TapisState } from '../store/rootReducer';
import { Apps } from '@tapis/tapis-typescript';


export const getApps = (state: TapisState) => state.apps.apps.results;

const appIdFilter = (state: TapisState, appId: string) => state.apps.apps.results.filter(
  (app) => app.id === appId
)

type getAppsByIdSelectorType = (state: TapisState) => Array<Apps.TapisApp>;

export const getAppsById = (appId: string): getAppsByIdSelectorType => {
  return (state: TapisState): Array<Apps.TapisApp> => appIdFilter(state, appId);
}

type getAppSelectorType = (state: TapisState) => Apps.TapisApp;

export const getApp = (appId: string, version: string): getAppSelectorType => {
  return (state: TapisState): Apps.TapisApp => {
    const matchingApps = appIdFilter(state, appId);
    if (!matchingApps.length) {
      return undefined;
    }
    return matchingApps.find(
      (app) => app.version === version
    )
  }
}