import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { SystemsListCallback } from './types';
import { Systems } from '@tapis/tapis-typescript';

interface SystemsListParams {
  onList?: SystemsListCallback
}

const useSystems = (config) => {
  const { systems } = useSelector((state: TapisState) => state.systems);
  return {
    systems,
    list: (params: SystemsListParams & Systems.GetSystemsRequest) => list(config, params.onList),
  };
};

export default useSystems;
