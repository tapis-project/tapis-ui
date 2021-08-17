import { useSelector } from 'react-redux';
import { list } from './list/actions';
import { TapisState } from '../store/rootReducer';
import { AppsListCallback } from './list/types';
import { Apps } from '@tapis/tapis-typescript';
import { Config, defaultConfig } from 'tapis-redux/types';
export interface ListAppsParams {
  onList?: AppsListCallback,
  request?: Apps.GetAppsRequest
}

const useSystems = (config: Config = defaultConfig) => {
  const { apps } = useSelector((state: TapisState) => state.apps);
  return {
    apps,
    list: (params: ListAppsParams) => list(config, params.onList, params.request || {}),
  };
};

export default useSystems;
