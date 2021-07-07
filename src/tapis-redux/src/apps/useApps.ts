import { Apps } from '@tapis/tapis-typescript';
import { useSelector } from 'react-redux';
import { AppsListCallback } from './list/types';
import { list } from './list/actions';
import { TapisState } from '../store/rootReducer';

export interface ListAppsParams {
  onList?: AppsListCallback
}

const useApps = (config) => {
  const { apps } = useSelector((state: TapisState) => state.apps);
  return {
    apps,
    list: (params: ListAppsParams & Apps.GetAppsRequest) => list(config, params.onList),
  };
};

export default useApps;
