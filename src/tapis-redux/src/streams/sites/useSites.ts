import { useSelector } from 'react-redux';
import { list, select } from './actions';
import { TapisState } from '../../store/rootReducer';
import { SitesListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface SitesListParams {
  onList?: SitesListCallback,
  request: Streams.ListSitesRequest
}

const useSites = (config?: Config) => {
  const state = useSelector((state: TapisState) => state.sites);
  return {
    state,
    list: (params: SitesListParams) => {
      return list(config, params.request, params.onList);
    },
    select: (site: Streams.Site) => {
      return select(site);
    }
  };
};

export default useSites;
