import { TapisState } from '../store/rootReducer';
import { Apps } from '@tapis/tapis-typescript';


export const getApps = (state: TapisState) => state.apps.apps.results;

const appIdFilter = (state: TapisState, appId: string) => state.apps.apps.results.filter(
  (app: Apps.TapisApp | null) => app?.id === appId
)

type getAppsByIdSelectorType = (state: TapisState) => Array<Apps.TapisApp | null>;

export const getAppsById = (appId: string): getAppsByIdSelectorType => {
  return (state: TapisState): Array<Apps.TapisApp | null> => appIdFilter(state, appId);
}

type getAppSelectorType = (state: TapisState) => Apps.TapisApp | undefined;

export const getApp = (appId: string, version: string) => {
  return (state: TapisState): Apps.TapisApp | null | undefined => {
    const matchingApps = appIdFilter(state, appId);
    if (!matchingApps.length) {
      return {};
    }
    return matchingApps.find(
      (app) => app?.version === version
    )
  }
}