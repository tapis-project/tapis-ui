import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { SystemsListCallback } from './types';
import { Systems } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/types';

export interface SystemsListParams {
  onList?: SystemsListCallback,
  request?: Systems.GetSystemsRequest
}

const useSystems = (config?: Config) => {
  const { systems } = useSelector((state: TapisState) => state.systems);
  return {
    systems,
    list: (params: SystemsListParams) => list(config, params.onList, params.request || {}),
  };
};

export default useSystems;
