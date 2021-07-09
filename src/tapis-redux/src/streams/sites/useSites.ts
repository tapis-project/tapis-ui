import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../../store/rootReducer';
import { SitesListCallback } from './types';
import * as Streams from "@tapis/tapis-typescript-streams";
import { Config } from 'tapis-redux/types';

interface SitesListParams {
  onList?: SitesListCallback,
  request: Streams.ListSitesRequest
}

const useSites = (config?: Config) => {
  const { sites } = useSelector((state: TapisState) => state.sites);
  return {
    sites,
    list: (params: SitesListParams) => list(config, params.request, params.onList),
  };
};

export default useSites;
